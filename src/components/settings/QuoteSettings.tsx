import { QUOTE_TYPES, WORD_TYPES } from "@/constants/wordTypes";
import { $config } from "@/store/config";
import { Button } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const QuoteSettings = () => {
    const { quotes: storedQuotes } = useStore($config);
    const [quotes, setQuotes] = useState<typeof storedQuotes | null>(null);

    useEffect(() => {
        setQuotes(storedQuotes);
    }, [storedQuotes]);

    const handleQuoteChange = (newQuote: keyof typeof QUOTE_TYPES) => {
        $config.setKey("quotes", newQuote);
    };

    return (
        <div id="quote-settings" className="flex flex-row gap-2 flex-wrap">
            {Object.keys(QUOTE_TYPES).map((key) => {
                const value = QUOTE_TYPES[key as keyof typeof QUOTE_TYPES];
                return (
                    <Button
                        key={key}
                        variant={quotes === key ? "primary" : "outline"}
                        onClick={() =>
                            handleQuoteChange(key as keyof typeof QUOTE_TYPES)
                        }
                        className="rounded-md"
                    >
                        {value.label}
                        {quotes === key && <Check className="ml-2" size={16} />}
                    </Button>
                    // <button
                    //     key={key}
                    //     data-is-selected={quotes === key ? 1 : 0}
                    //     className="btn large-btn"
                    //     onClick={() =>
                    //         handleQuoteChange(key as keyof typeof QUOTE_TYPES)
                    //     }
                    // >
                    //     {value.label}
                    // </button>
                );
            })}
        </div>
    );
};

export default QuoteSettings;
