/**
 * Simple toast notification utility
 * Creates temporary notification messages without blocking UI
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    type: ToastType;
    message: string;
    duration?: number;
}

/**
 * Shows a toast notification
 * @param options - Toast configuration
 */
export const showToast = ({ type, message, duration = 3000 }: ToastOptions): void => {
    if (typeof window === 'undefined') return;

    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    // Add to DOM
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    // Auto-remove after duration
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Match CSS transition duration
    }, duration);
};
