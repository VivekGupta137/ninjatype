import { createContext, useContext, useState, useRef, useEffect } from "react";

const DropdownContext = createContext<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }>({} as any);

const Dropdown = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [flipUp, setFlipUp] = useState(false);
    const [offsetX, setOffsetX] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleDocPointer(e: Event) {
            if (!ref.current) return;
            const target = e.target as Node | null;
            if (target && !ref.current.contains(target)) {
                setIsOpen(false);
            }
        }

        function handleFocusIn(e: Event) {
            if (!ref.current) return;
            const target = e.target as Node | null;
            if (target && !ref.current.contains(target)) {
                setIsOpen(false);
            }
        }

        const events: Array<[keyof DocumentEventMap, EventListener]> = [
            ["mousedown", handleDocPointer],
            ["touchstart", handleDocPointer],
            ["focusin", handleFocusIn],
        ];
        events.forEach(([event, handler]) => {
            document.addEventListener(event, handler);
        });

        return () => {
            events.forEach(([event, handler]) => {
                document.removeEventListener(event, handler);
            });
        };
    }, []);

    // When dropdown opens (or on resize/scroll) compute whether to flip upward
    useEffect(() => {
        function updateFlip() {
            if (!ref.current) return;
            const triggerEl = ref.current.querySelector('.dropdown-trigger') as HTMLElement | null;
            const contentEl = ref.current.querySelector('.dropdown-content') as HTMLElement | null;
            if (!triggerEl || !contentEl) return;

            const triggerRect = triggerEl.getBoundingClientRect();
            const contentHeight = contentEl.offsetHeight || contentEl.getBoundingClientRect().height;

            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;

            const shouldFlip = spaceBelow < contentHeight && spaceAbove > contentHeight;

            setFlipUp(shouldFlip);

            // Horizontal collision: ensure the content stays within the viewport horizontally.
            const contentRect = contentEl.getBoundingClientRect();
            const pad = 20; // keep a small gap from the viewport edge
            const overflowRight = contentRect.right - window.innerWidth;
            const overflowLeft = contentRect.left;
            let x = 0;
            if (overflowRight > 0) {
                // shift left by overflow amount + padding
                x = -(overflowRight + pad);
            } else if (overflowLeft < 0) {
                // shift right by left overflow amount + padding
                x = -overflowLeft + pad;
            }
            setOffsetX(x);
        }

        if (isOpen) {
            // wait a frame so content layout settles
            requestAnimationFrame(updateFlip);
        }
        if(!isOpen) {
            setOffsetX(0);
        }

        window.addEventListener('resize', updateFlip);
        // capture scroll events anywhere in the document
        document.addEventListener('scroll', updateFlip, true);

        return () => {
            window.removeEventListener('resize', updateFlip);
            document.removeEventListener('scroll', updateFlip, true);
        };
    }, [isOpen]);

    return (<DropdownContext.Provider value={{ isOpen, setIsOpen }}>
        <div ref={ref} className="dropdown" data-open={isOpen} data-flip={flipUp} style={{ ['--dropdown-offset-x' as any]: `${offsetX}px` }}>
            {children}
        </div>
    </DropdownContext.Provider>);
}

const Trigger = ({
    children,
}: {
    children?: React.ReactNode;
}) => {
    const { isOpen, setIsOpen } = useContext(DropdownContext);
    const toggleDropdown = () => setIsOpen(!isOpen);
    return (<div className="dropdown-trigger" onClick={toggleDropdown}>
        {children}
    </div>);
}

const Content = ({ children }: { children: React.ReactNode }) => {
    const { isOpen } = useContext(DropdownContext);

    return (<div className="dropdown-content" role="menu" aria-hidden={!isOpen} tabIndex={-1}>{children}</div>);
}

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;

export default Dropdown;