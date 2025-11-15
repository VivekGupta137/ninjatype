import { useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { 
    $learnKbState, 
    $learnKbTypingState, 
    $learnKbSentence, 
    $learnKbTypedText, 
    $learnStopwatch,
    regenerateLearnSentence
} from "@/store/learnKeyboard";
import { $learnRawWPM, $learnAccuracy } from "@/store/learnAnalytics";
import { FINGER_NAMES, FINGER_KEYS, type FingerType } from "@/constants/fingerKeys";
import { getBadgeForWPM } from "@/constants/badges";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Paragraph from "../keyboard/Paragraph";
import KeySelector from "./KeySelector";
import useFocus from "@/hooks/useFocus";
import { useLearnTypedText } from "@/hooks/useLearnTypedText";

/**
 * Props for the FingerPractice component
 */
interface FingerPracticeProps {
    /** The finger type to practice (index, middle, ring, or pinky) */
    finger: FingerType;
}

/**
 * Finger Practice Component
 * 
 * Provides an interactive typing practice interface for a specific finger.
 * Features include:
 * - Real-time WPM and accuracy tracking
 * - Badge system for achievement milestones
 * - Progress persistence via localStorage
 * - Dynamic sentence generation with finger-specific keys
 * - Customizable key selection (enable/disable individual keys)
 * 
 * @param props - Component props
 * @returns A complete finger practice interface with keyboard and stats
 */
const FingerPractice = ({ finger }: FingerPracticeProps) => {
    // ========== Store Subscriptions ==========

    /** Ref for the hidden input element that captures keyboard input */
    const keyboardInputRef = useRef<HTMLInputElement>(null);

    /** Focus management hook - handles keyboard focus state */
    const { doFocus } = useFocus(keyboardInputRef, true, $learnKbState);

    /** Typed text management hook - handles input changes and validation */
    const { typedText, handleInputChange } = useLearnTypedText({ focusKeyboard: doFocus });

    /** Learn-specific store subscriptions (isolated from main typing interface) */
    const kbState = useStore($learnKbState);
    const kbTypingState = useStore($learnKbTypingState);
    const sentence = useStore($learnKbSentence);
    const wpm = useStore($learnRawWPM);
    const accuracy = useStore($learnAccuracy);

    /** Badge earned based on current WPM */
    const badge = getBadgeForWPM(wpm);
    const BadgeIcon = badge?.icon;

    /** Whether the keyboard is currently focused */
    const isFocused = kbState === KBSTATE.FOCUSSED;
    
    /** Whether the practice session is complete */
    const isComplete = kbTypingState === KBTYPINGSTATE.COMPLETED;

    // ========== Practice Session Management ==========

    /**
     * Reset the practice session with a new random sentence
     * Regenerates sentence while maintaining current key selection
     */
    const resetPractice = useCallback(() => {
        // Regenerate sentence while keeping the user's key selection
        regenerateLearnSentence();
        
        doFocus();
    }, [doFocus]);

    return (
        <div className="finger-practice-container">
            {/* Header */}
            <div className="finger-practice-header">
                <a href="/learn" className="back-button">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </a>
                <h2>{FINGER_NAMES[finger]}</h2>
            </div>

            {/* Keys for this finger - with toggle functionality */}
            <KeySelector finger={finger} onToggle={doFocus} />

            {/* Typing Area */}
            <div id="keyboard-container" data-kb-loaded={kbState === KBSTATE.LOADING ? 0 : 1}>
                <div id="keyboard-wrapper" data-kb-focused={isFocused ? 1 : 0}>
                    <input
                        value={typedText}
                        onChange={handleInputChange}
                        ref={keyboardInputRef}
                        type="text"
                        id="kb-hidden-input"
                        autoComplete="off"
                        spellCheck="false"
                    />

                    <div id="keyboard-overlay" data-kb-focused={isFocused ? 1 : 0}>
                        <iconify-icon icon="lucide:mouse-pointer-click" width="48" height="48"></iconify-icon> click to focus
                    </div>

                    <div id="keyboard" data-kb-focused={isFocused ? 1 : 0}>
                        <Paragraph
                            paragraphText={sentence}
                            typedText={typedText}
                            isActive={!isComplete}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="finger-stats">
                <div className="stat-item">
                    <span className="stat-value">{wpm}</span>
                    <span className="stat-label">WPM</span>
                </div>
                <div className="stat-divider">|</div>
                <div className="stat-item">
                    <span className="stat-value">{accuracy}%</span>
                    <span className="stat-label">Accuracy</span>
                </div>
                {badge && BadgeIcon && (
                    <>
                        <div className="stat-divider">|</div>
                        <div className="stat-item badge-earned">
                            <BadgeIcon size={16} />
                            <span className="stat-label">{badge.name}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Toolbar */}
            <div className="learn-bottom-toolbar">
                <button onClick={resetPractice} className="reset-button">
                    <RotateCcw size={20} />
                </button>
            </div>


            {/* Completion Message */}
            {isComplete && (
                <div className="completion-message">
                    <p>✨ Well done! Your progress has been saved.</p>
                    <button onClick={resetPractice} className="try-again-button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default FingerPractice;
