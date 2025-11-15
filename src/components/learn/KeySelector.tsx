/**
 * Key Selector Component
 * 
 * Self-contained component that displays keyboard keys with toggle functionality.
 * Manages its own state through the learn keyboard store.
 * 
 * Responsibilities:
 * - Initializes keys in store on mount
 * - Subscribes to key states from store
 * - Handles key toggling through store actions
 * - Displays visual indication of enabled/disabled state
 * 
 * Features:
 * - Visual indication of enabled/disabled state
 * - Click to toggle keys
 * - Keyboard accessible (Enter/Space to toggle)
 * - Theme-aware styling
 */

import { useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { PenLine } from "lucide-react";
import { initializeLearnKeys, toggleLearnKey, $learnKeys } from "@/store/learnKeyboard";
import { FINGER_KEYS, type FingerType } from "@/constants/fingerKeys";

interface KeySelectorProps {
    /** The finger type being practiced */
    finger: FingerType;
}

/**
 * Renders an interactive key selector with toggle functionality
 * All state is managed internally via the learn keyboard store
 * 
 * @param props - Component props
 * @returns A key selector interface
 */
const KeySelector = ({ finger }: KeySelectorProps) => {
    // Get keys for this finger
    const keys = FINGER_KEYS[finger];
    
    // Subscribe to store
    const learnKeys = useStore($learnKeys);
    
    // Compute disabled keys from store
    const disabledKeys = useMemo(() => {
        return new Set(learnKeys.filter(k => !k.active).map(k => k.key));
    }, [learnKeys]);
    
    /**
     * Initialize keys in store when component mounts or finger changes
     */
    useEffect(() => {
        initializeLearnKeys(keys, finger);
    }, [keys, finger]);
    
    /**
     * Handle keyboard interaction for accessibility
     * Allows toggling keys with Enter or Space
     */
    const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleLearnKey(key);
        }
    };

    return (
        <div className="finger-keys-display">
            <div className="keys-header">
                <span className="keys-label">
                    <PenLine size={14} />
                    Keys:
                </span>
                <span className="keys-hint">Click to toggle</span>
            </div>
            <div className="keys-list">
                {keys.map(key => (
                    <kbd 
                        key={key} 
                        className={`key-badge ${disabledKeys.has(key) ? 'key-disabled' : ''}`}
                        onClick={() => toggleLearnKey(key)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, key)}
                        aria-pressed={!disabledKeys.has(key)}
                        aria-label={`Toggle ${key} key ${disabledKeys.has(key) ? 'enabled' : 'disabled'}`}
                    >
                        {key}
                    </kbd>
                ))}
            </div>
        </div>
    );
};

export default KeySelector;
