import { Star } from 'lucide-react';
import type { StarTier } from '@/constants/badges';

interface StarDisplayProps {
    /** Number of stars to display */
    stars: number;
    /** Color tier for the stars */
    tier: StarTier;
    /** Maximum stars to show (defaults to showing current tier max) */
    maxStars?: number;
    /** Size of each star icon */
    size?: number;
    /** Whether to show the numeric count */
    showCount?: boolean;
}

/**
 * Get CSS color value for star tier
 */
const getTierColor = (tier: StarTier): string => {
    switch (tier) {
        case 'white':
            return 'var(--star-white, #ffffff)';
        case 'green':
            return 'var(--star-green, #10b981)';
        case 'yellow':
            return 'var(--star-yellow, #fbbf24)';
        case 'orange':
            return 'var(--star-orange, #f97316)';
        case 'red':
            return 'var(--star-red, #ef4444)';
    }
};

/**
 * StarDisplay Component
 * 
 * Displays earned stars with color-coded tiers for typing achievements.
 * Always shows exactly 5 stars, with the color indicating the tier/value.
 * 
 * Features:
 * - Color-coded star display based on tier (white, green, yellow, orange, red)
 * - Filled stars show progress within current group of 5
 * - Optional numeric count display
 * - Responsive sizing
 * 
 * @example
 * <StarDisplay stars={7} tier="green" showCount />
 * // Shows 2 filled green stars out of 5 (7 = 1 full tier + 2 in second tier)
 */
const StarDisplay = ({ 
    stars, 
    tier, 
    maxStars = 5,
    size = 16, 
    showCount = false 
}: StarDisplayProps) => {
    const color = getTierColor(tier);
    
    // Calculate stars to show: stars within current group of 5
    // For example: 7 stars = 2 filled stars (7 % 5 = 2)
    // Special case: if stars is a multiple of 5, show all 5 filled
    const starsInCurrentTier = stars % 5 === 0 && stars > 0 ? 5 : stars % 5;
    
    return (
        <div className="star-display">
            <div className="stars-container">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        size={size}
                        fill={index < starsInCurrentTier ? color : 'none'}
                        stroke={color}
                        strokeWidth={2}
                        className="star-icon"
                    />
                ))}
            </div>
            {showCount && (
                <span className="star-count" style={{ color }}>
                    {stars} {stars === 1 ? 'star' : 'stars'}
                </span>
            )}
        </div>
    );
};

export default StarDisplay;
