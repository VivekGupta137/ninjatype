import { QUOTE_TYPES } from "@/constants/wordTypes";
import { $config } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import "@/styles/ui.css";

const QuoteSettings = () => {
    const { quotes: storedQuotes } = useStore($config);
    const [quotes, setQuotes] = useState<typeof storedQuotes | null>(null);
    useEffect(() => { setQuotes(storedQuotes); }, [storedQuotes]);

    return (
        <ToggleButtonGroup
            className="key-group"
            aria-label="Quote set"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set(quotes ? [quotes] : [])}
            onSelectionChange={keys => { const v = Array.from(keys)[0] as keyof typeof QUOTE_TYPES | undefined; if (v) $config.setKey("quotes", v); }}
        >
            {(Object.keys(QUOTE_TYPES) as Array<keyof typeof QUOTE_TYPES>).map(key => (
                <ToggleButton key={key} id={key} className="key-btn key-btn--ghost">{QUOTE_TYPES[key].label}</ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default QuoteSettings;
