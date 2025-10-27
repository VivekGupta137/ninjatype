const IconButton = ({ children, onClick, className }: {
    children: React.ReactNode,
    onClick?: () => void,
    className?: string
}) => {
    return (<button className={`icon-button ${className}`} onClick={onClick}>{children}</button>);
}

export default IconButton;