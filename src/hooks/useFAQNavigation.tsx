import { useState, useCallback } from 'react';

interface UseFAQNavigationReturn {
    currentIndex: number;
    goToNext: () => void;
    goToPrevious: () => void;
    goToIndex: (index: number) => void;
}

export const useFAQNavigation = (totalItems: number): UseFAQNavigationReturn => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, [totalItems]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    }, [totalItems]);

    const goToIndex = useCallback((index: number) => {
        if (index >= 0 && index < totalItems) {
            setCurrentIndex(index);
        }
    }, [totalItems]);

    return {
        currentIndex,
        goToNext,
        goToPrevious,
        goToIndex,
    };
};
