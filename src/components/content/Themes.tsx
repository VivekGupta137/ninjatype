import {
    Avatar,
    cn,
    Description,
    Label,
    ListBox,
    Surface,
} from "@heroui/react";
import { THEME } from "@/constants/themes";
import { useEffect, useState } from "react";
import type { Selection } from "@heroui/react";
import { Check } from "lucide-react";
import { useStore } from "@nanostores/react";
import { $config } from "@/store/config";

const Themes = () => {
    const { theme: storedTheme } = useStore($config);
    const [theme, setTheme] = useState<typeof storedTheme | null>(null);

    const [selected, setSelected] = useState<Selection>(
        new Set([theme || "monokai"]),
    );
    const selectedItems = Array.from(selected);

    useEffect(() => {
        setTheme(storedTheme);
        if (storedTheme) {
            setSelected(new Set([storedTheme]));
        }
    }, [storedTheme]);

    const handleThemeChange = (newTheme: keyof typeof THEME) => {
        $config.setKey("theme", newTheme);
    };

    return (
        <>
            <ListBox
                aria-label="Available themes"
                className={cn("not-prose flex flex-row flex-wrap gap-2")}
                selectionMode="single"
                selectedKeys={selected}
                onSelectionChange={(keys) => {
                    const selectedKey = Array.from(
                        keys,
                    )[0] as keyof typeof THEME;

                    if (selectedKey) {
                        handleThemeChange(selectedKey);
                    }
                }}
            >
                {(
                    Object.entries(THEME) as Array<
                        [keyof typeof THEME, (typeof THEME)[keyof typeof THEME]]
                    >
                ).map(([themeKey, theme]) => {
                    return (
                        <ListBox.Item
                            key={themeKey}
                            id={themeKey}
                            textValue={theme.label}
                            className={cn(
                                "rounded-xl w-[220px] ",
                                "data-[selected=true]:bg-surface data-[selected=true]:border-main data-[selected=true]:border-2",
                            )}
                        >
                            <div className="flex w-full items-center gap-3 px-2 py-1">
                                <Avatar
                                    size="sm"
                                    style={{
                                        backgroundColor: theme.colors.main,
                                    }}
                                >
                                    <Avatar.Fallback
                                        style={{
                                            backgroundColor: theme.colors.main,
                                        }}
                                    />
                                </Avatar>
                                <div className="flex flex-col">
                                    <Label>{theme.label}</Label>
                                    <Description>
                                        {theme.path.replace("/themes/", "")}
                                    </Description>
                                </div>
                            </div>
                            <ListBox.ItemIndicator></ListBox.ItemIndicator>
                        </ListBox.Item>
                    );
                })}
            </ListBox>
        </>
    );
};

export default Themes;
