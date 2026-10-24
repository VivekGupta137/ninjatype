import { useEffect, useRef, type ReactNode } from "react";
export default function TerminalDialog({
    open,
    onClose,
    title,
    children,
    className = "",
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        else if (!open && dialog.open) dialog.close();
        return () => {
            if (dialog.open) dialog.close();
        };
    }, [open]);
    return (
        <dialog
            ref={ref}
            className={`hacker-dialog ${className}`}
            aria-label={title}
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="hacker-dialog-content">
                <header>
                    <div>
                        <span className="hacker-eyebrow">
                            NINJA / CONTROL INTERFACE
                        </span>
                        <h2>{title}</h2>
                    </div>
                    <button onClick={onClose} aria-label={`Close ${title}`}>
                        ×
                    </button>
                </header>
                {children}
            </div>
        </dialog>
    );
}
