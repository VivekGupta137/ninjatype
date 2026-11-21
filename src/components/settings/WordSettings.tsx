import { WORD_TYPES } from "@/constants/wordTypes";
import { $config } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import "@/styles/ui.css";

const WordSettings = () => {
    const { dictionary: storedDictionary } = useStore($config);
    const [dictionary, setDictionary] = useState<typeof storedDictionary | null>(null);
    useEffect(() => { setDictionary(storedDictionary); }, [storedDictionary]);

    return (
        <ToggleButtonGroup
            className="key-group config-dictionary-group"
            aria-label="Dictionary"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set(dictionary ? [dictionary] : [])}
            onSelectionChange={keys => { const v = Array.from(keys)[0] as keyof typeof WORD_TYPES | undefined; if (v) $config.setKey("dictionary", v); }}
        >
            {(Object.keys(WORD_TYPES) as Array<keyof typeof WORD_TYPES>).map(key => (
                <ToggleButton key={key} id={key} className="key-btn key-btn--ghost">{WORD_TYPES[key].label}</ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default WordSettings;
