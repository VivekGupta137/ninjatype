import { Trash2 } from "lucide-react";

type DeleteHistoryButtonProps = {
    /** Additional CSS class for the container */
    className?: string;
    /** Show container wrapper (default: true) */
    showContainer?: boolean;
    /** Button text (default: "Delete History") */
    text?: string;
    /** Icon size (default: 16) */
    iconSize?: number;
    /** Link href (default: "/settings/") */
    href?: string;
};

/**
 * Button to navigate to settings page for deleting typing history
 * Styled as an outline button with error colors to indicate destructive action
 * 
 * @example
 * // Default usage with container
 * <DeleteHistoryButton />
 * 
 * @example
 * // Without container wrapper
 * <DeleteHistoryButton showContainer={false} />
 * 
 * @example
 * // Custom text and styling
 * <DeleteHistoryButton text="Clear Data" className="custom-class" />
 */
const DeleteHistoryButton = ({ 
    className = "", 
    showContainer = true,
    text = "Delete History",
    iconSize = 16,
    href = "/settings/"
}: DeleteHistoryButtonProps) => {
    const button = (
        <a 
            href={href}
            className="delete-history-btn"
            title="Delete typing history"
        >
            <Trash2 size={iconSize} />
            {text}
        </a>
    );

    if (!showContainer) {
        return button;
    }

    return (
        <div className={`delete-history-container ${className}`.trim()}>
            {button}
        </div>
    );
};

export default DeleteHistoryButton;
