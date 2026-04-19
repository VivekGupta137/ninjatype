import { WORD_TYPES } from "@/constants/wordTypes";
import { $config } from "@/store/config";
import { Button } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const WordSettings = () => {
    const { dictionary: storedDictionary } = useStore($config);
    const [dictionary, setDictionary] = useState<
        typeof storedDictionary | null
    >(null);

    useEffect(() => {
        setDictionary(storedDictionary);
    }, [storedDictionary]);

    const handleWordTypeChange = (newType: keyof typeof WORD_TYPES) => {
        $config.setKey("dictionary", newType);
    };

    return (
        <div id="word-settings" className="flex flex-row gap-2 flex-wrap">
            {Object.keys(WORD_TYPES).map((key) => {
                const value = WORD_TYPES[key as keyof typeof WORD_TYPES];
                return (
                    <Button
                        key={key}
                        variant={dictionary === key ? "primary" : "outline"}
                        onClick={() =>
                            handleWordTypeChange(key as keyof typeof WORD_TYPES)
                        }
                        className="rounded-md"
                    >
                        {value.label}
                        {dictionary === key && (
                            <Check className="ml-2" size={16} />
                        )}
                    </Button>
                );
            })}
        </div>
    );
};

export default WordSettings;
