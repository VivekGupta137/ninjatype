import { useEffect, useCallback, useState } from "react";
import { useStore } from "@nanostores/react";
import { 
    $readKbTypingState, 
    $readKbSentence, 
    $readKbTranscribedText,
    generateReadSentence,
    resetReadPractice
} from "@/store/readKeyboard";
import { $readAccuracy, $readClarity, $readOverallScore } from "@/store/readAnalytics";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { RotateCcw, Mic, Play } from "lucide-react";
import Paragraph from "../keyboard/Paragraph";
import { useReadSpeech } from "@/hooks/useReadSpeech";

/**
 * Read Practice Component
 * 
 * Provides an interactive reading practice interface where users read text aloud.
 * Features include:
 * - Real-time speech-to-text transcription
 * - Accuracy and clarity scoring
 * - Text-to-speech read-back functionality
 * - Record button to start/stop recording
 */
const ReadPractice = () => {
    // Store subscriptions
    const kbTypingState = useStore($readKbTypingState);
    const sentence = useStore($readKbSentence);
    const transcribedText = useStore($readKbTranscribedText);
    const accuracy = useStore($readAccuracy);
    const clarity = useStore($readClarity);
    const overallScore = useStore($readOverallScore);

    // Speech recognition hook
    const { isRecording, toggleRecording, stopRecording } = useReadSpeech({
        onRecordingStart: () => {
            console.log("Recording started");
        },
        onRecordingStop: () => {
            console.log("Recording stopped");
        }
    });

    // Generate initial sentence on mount
    useEffect(() => {
        if (!sentence) {
            generateReadSentence();
        }
    }, []);

    // Stop recording when practice is completed
    useEffect(() => {
        if (kbTypingState === KBTYPINGSTATE.COMPLETED && isRecording) {
            stopRecording();
        }
    }, [kbTypingState, isRecording, stopRecording]);

    const isComplete = kbTypingState === KBTYPINGSTATE.COMPLETED;
    const [isPlaying, setIsPlaying] = useState(false);

    // Load voices on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            return;
        }

        // Trigger voice loading
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log("Available voices:", voices.length);
            if (voices.length > 0) {
                console.log("Sample voices:", voices.slice(0, 3).map(v => `${v.name} (${v.lang})`));
            }
        };

        // Load voices immediately if available
        loadVoices();

        // Also listen for voiceschanged event
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        return () => {
            if (window.speechSynthesis.onvoiceschanged) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    /**
     * Read back the transcribed text using text-to-speech
     */
    const readBack = useCallback(() => {
        if (!transcribedText || transcribedText.trim().length === 0) {
            console.warn("No transcribed text to read back");
            return;
        }

        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            console.warn("Text-to-speech not supported in this browser");
            alert("Text-to-speech is not supported in your browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        try {
            // Cancel any ongoing speech
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                return;
            }
            
            // Get voices - they might not be loaded yet
            let voices = window.speechSynthesis.getVoices();
            
            // If voices are not loaded, wait for them
            if (voices.length === 0) {
                // Load voices
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    speakText(voices);
                };
                
                // Try to get voices again after a short delay
                setTimeout(() => {
                    voices = window.speechSynthesis.getVoices();
                    if (voices.length > 0) {
                        speakText(voices);
                    } else {
                        console.error("No voices available");
                        alert("No speech voices available. Please check your browser settings.");
                    }
                }, 100);
            } else {
                speakText(voices);
            }
        } catch (error) {
            console.error("Failed to read back text:", error);
            setIsPlaying(false);
            alert("Failed to play back audio. Please try again.");
        }

        function speakText(availableVoices: any[]) {
            if (availableVoices.length === 0) {
                console.error("No voices available");
                alert("No speech voices available. Please check your browser settings.");
                return;
            }

            // Find an English voice (prefer local service)
            let voice = availableVoices.find((v: any) => 
                v.lang && v.lang.startsWith('en') && v.localService !== false
            );
            
            // If no local service voice, try any English voice
            if (!voice) {
                voice = availableVoices.find((v: any) => 
                    v.lang && v.lang.startsWith('en')
                );
            }
            
            // If still no voice, use the first available voice
            if (!voice && availableVoices.length > 0) {
                voice = availableVoices[0];
            }
            
            // Create new utterance
            const textToSpeak = transcribedText.trim();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            // Set properties
            utterance.lang = 'en-US';
            utterance.rate = 1.0; // Normal speed
            utterance.pitch = 1.0; // Normal pitch
            utterance.volume = 1.0; // Full volume
            
            // Set voice if available (this is critical!)
            if (voice) {
                utterance.voice = voice;
                console.log("Using voice:", voice.name, "Language:", voice.lang, "Local:", voice.localService);
            } else {
                console.warn("No voice available, using default");
            }
            
            // Add event handlers with detailed logging
            utterance.onstart = (event) => {
                setIsPlaying(true);
                console.log("✅ Speech playback started", event);
            };
            
            utterance.onerror = (event: any) => {
                console.error("❌ Speech synthesis error:", event);
                console.error("Error details:", {
                    error: event.error,
                    type: event.type,
                    charIndex: event.charIndex,
                    charLength: event.charLength
                });
                setIsPlaying(false);
                alert(`Failed to play back audio: ${event.error || 'Unknown error'}. Please check your system volume and browser permissions.`);
            };
            
            utterance.onend = (event) => {
                console.log("✅ Speech playback ended", event);
                setIsPlaying(false);
            };
            
            utterance.onpause = () => {
                console.log("⏸️ Speech playback paused");
                setIsPlaying(false);
            };
            
            utterance.onresume = () => {
                console.log("▶️ Speech playback resumed");
                setIsPlaying(true);
            };
            
            // Speak the text
            console.log("🎤 Attempting to speak:", textToSpeak);
            console.log("🎤 Utterance properties:", {
                text: utterance.text,
                lang: utterance.lang,
                rate: utterance.rate,
                pitch: utterance.pitch,
                volume: utterance.volume,
                voice: utterance.voice?.name || 'default'
            });
            
            try {
                window.speechSynthesis.speak(utterance);
                console.log("🎤 speak() called successfully");
            } catch (error) {
                console.error("❌ Error calling speak():", error);
                setIsPlaying(false);
                alert("Failed to start speech synthesis. Please try again.");
            }
        }
    }, [transcribedText]);

    /**
     * Reset the practice session
     */
    const handleReset = useCallback(() => {
        stopRecording();
        resetReadPractice();
    }, [stopRecording]);

    return (
        <div className="read-practice-container">
            {/* Header */}
            <div className="read-practice-header">
                <h2>Read Practice</h2>
                <p className="read-practice-subtitle">Read the text aloud and see how accurately you speak</p>
            </div>

            {/* Text Display - Fills in as user speaks */}
            <div id="keyboard-container" data-kb-loaded={1}>
                <div id="keyboard-wrapper" data-kb-focused={1}>
                    <div id="keyboard" data-kb-focused={1}>
                        <Paragraph
                            paragraphText={sentence}
                            typedText={transcribedText}
                            isActive={!isComplete}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="read-stats">
                <div className="stat-item">
                    <span className="stat-value">{accuracy}%</span>
                    <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-divider">|</div>
                <div className="stat-item">
                    <span className="stat-value">{clarity}%</span>
                    <span className="stat-label">Clarity</span>
                </div>
                <div className="stat-divider">|</div>
                <div className="stat-item">
                    <span className="stat-value">{overallScore}%</span>
                    <span className="stat-label">Overall Score</span>
                </div>
            </div>

            {/* Controls */}
            <div id="read-bottom-toolbar">
                <button 
                    onClick={toggleRecording} 
                    className={`btn ${isRecording ? 'recording' : ''}`}
                    disabled={isComplete}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                    <Mic />
                </button>

                <button 
                    onClick={readBack} 
                    className={`btn ${isPlaying ? 'playing' : ''}`}
                    disabled={!transcribedText || transcribedText.trim().length === 0}
                    title={isPlaying ? "Stop playback" : "Read back what you said"}
                >
                    <Play />
                </button>

                <button onClick={handleReset} className="btn" title="Reset">
                    <RotateCcw />
                </button>
            </div>

            {/* Completion Message */}
            {isComplete && (
                <div className="read-completion-message">
                    <div className="read-completion-text">✨ Great job! Your reading has been scored.</div>
                    <button onClick={handleReset} className="btn" title="Try Again">
                        <RotateCcw />
                    </button>
                </div>
            )}

            {/* Browser Support Warning */}
            {typeof window !== 'undefined' && !window.SpeechRecognition && !(window as any).webkitSpeechRecognition && (
                <div className="browser-warning">
                    <p>⚠️ Speech Recognition is not supported in your browser. Please use Chrome, Edge, or Safari.</p>
                </div>
            )}
        </div>
    );
};

export default ReadPractice;
