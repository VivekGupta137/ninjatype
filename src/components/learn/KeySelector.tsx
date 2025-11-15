/**
 * Key Selector Component
 * 
 * Displays a list of keyboard keys that can be toggled on/off for practice customization.
 * Disabled keys are excluded from practice text generation.
 * 
 * Features:
 * - Visual indication of enabled/disabled state
 * - Click to toggle keys
 * - Keyboard accessible (Enter/Space to toggle)
 * - Theme-aware styling
 */

import { PenLine } from "lucide-react";

interface KeySelectorProps {
    /** Array of keyboard keys to display */
    keys: string[];
    /** Set of keys that are currently disabled */
    disabledKeys: Set<string>;
    /** Callback when a key is toggled */
    onToggleKey: (key: string) => void;
}

/**
 * Renders an interactive key selector with toggle functionality
 * 
 * @param props - Component props
 * @returns A key selector interface
 */
const KeySelector = ({ keys, disabledKeys, onToggleKey }: KeySelectorProps) => {
    /**
     * Handle keyboard interaction for accessibility
     * Allows toggling keys with Enter or Space
     */
    const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleKey(key);
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
                        onClick={() => onToggleKey(key)}
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
