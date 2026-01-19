/**
 * Custom Hook for Speech Recognition in Read Practice
 * 
 * Handles Web Speech API integration for real-time speech-to-text transcription.
 * Tracks confidence scores and updates transcribed text in real-time.
 */

import { useEffect, useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
    $readKbTranscribedText,
    $readIsRecording,
    $readConfidenceScores,
    $readKbTypingState,
} from "@/store/readKeyboardState";
import { KBTYPINGSTATE } from "@/constants/keyboardState";

interface UseReadSpeechProps {
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
}

/**
 * Hook for managing speech recognition in read practice sessions
 * 
 * @param props - Hook configuration
 * @returns Speech recognition controls and state
 */
export const useReadSpeech = ({ onRecordingStart, onRecordingStop }: UseReadSpeechProps = {}) => {
    const isRecording = useStore($readIsRecording);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcribedTextRef = useRef<string>("");

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if SpeechRecognition is available
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Handle results
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';
            const confidenceScores: number[] = [];

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence || 0.8;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    confidenceScores.push(confidence);
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update transcribed text
            const newText = transcribedTextRef.current + finalTranscript;
            transcribedTextRef.current = newText;
            $readKbTranscribedText.set(newText.trim());

            // Update confidence scores
            if (confidenceScores.length > 0) {
                const currentScores = $readConfidenceScores.get();
                $readConfidenceScores.set([...currentScores, ...confidenceScores]);
            }

            // Update typing state
            if (newText.trim().length > 0 && $readKbTypingState.get() === KBTYPINGSTATE.IDLE) {
                $readKbTypingState.set(KBTYPINGSTATE.TYPING);
            }
        };

        // Handle errors
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'no-speech') {
                // No speech detected, but don't stop recording
                return;
            }
            if (event.error === 'aborted' || event.error === 'network') {
                stopRecording();
            }
        };

        // Handle end of recognition
        recognition.onend = () => {
            // If still recording, restart recognition
            if ($readIsRecording.get()) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error("Failed to restart recognition:", error);
                    stopRecording();
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Start recording
    const startRecording = useCallback(() => {
        if (!recognitionRef.current) {
            console.warn("Speech recognition not initialized");
            return;
        }

        if (isRecording) {
            return;
        }

        try {
            transcribedTextRef.current = "";
            $readKbTranscribedText.set("");
            $readConfidenceScores.set([]);
            $readIsRecording.set(true);
            recognitionRef.current.start();
            onRecordingStart?.();
        } catch (error) {
            console.error("Failed to start recording:", error);
            $readIsRecording.set(false);
        }
    }, [isRecording, onRecordingStart]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (!recognitionRef.current) {
            return;
        }

        if (!isRecording) {
            return;
        }

        try {
            recognitionRef.current.stop();
            $readIsRecording.set(false);
            onRecordingStop?.();
        } catch (error) {
            console.error("Failed to stop recording:", error);
            $readIsRecording.set(false);
        }
    }, [isRecording, onRecordingStop]);

    // Toggle recording
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        toggleRecording,
    };
};

// Extend Window interface for TypeScript
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}
