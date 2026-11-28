import { useState } from "react";
import { ColorArea, ColorPicker, ColorSlider, ColorSwatch, Input, Label, TextField } from "@heroui/react";
import { normalizeHex, type CustomColorKey } from "@/lib/customTheme";

interface Props {
    colorKey: CustomColorKey;
    label: string;
    description: string;
    color: string;
    hex: string;
    showErrors: boolean;
    onChange: (value: string) => void;
}

/** Keep incomplete hex text separate from the last valid color used by the picker and preview. */
export default function ThemeColorControl({ colorKey, label, description, color, hex, showErrors, onChange }: Props) {
    const [touched, setTouched] = useState(false);
    const invalid = (touched || showErrors) && !normalizeHex(hex);
    const errorId = `ctb-${colorKey}-error`;
    return (
        <div className="ctb-color">
            <div className="ctb-color-heading"><strong>{label}</strong><span>{description}</span></div>
            <div className="ctb-color-controls">
                <ColorPicker value={color} onChange={value => onChange(value.toString("hex"))}>
                    <ColorPicker.Trigger className="key-btn key-btn--secondary ctb-picker-trigger" aria-label={`Choose ${label} color`} type="button">
                        <ColorSwatch size="sm" shape="square" />
                    </ColorPicker.Trigger>
                    <ColorPicker.Popover className="ctb-picker-popover">
                        <ColorArea aria-label={`${label} saturation and brightness`} colorSpace="hsb" xChannel="saturation" yChannel="brightness" className="ctb-color-area">
                            <ColorArea.Thumb />
                        </ColorArea>
                        <ColorSlider aria-label={`${label} hue`} channel="hue" colorSpace="hsb" className="ctb-color-slider">
                            <Label>Hue</Label><ColorSlider.Output />
                            <ColorSlider.Track><ColorSlider.Thumb /></ColorSlider.Track>
                        </ColorSlider>
                    </ColorPicker.Popover>
                </ColorPicker>
                <TextField value={hex} onChange={onChange} isInvalid={invalid} className="ctb-hex-field">
                    <Label className="ctb-hex-label">{label} hex</Label>
                    <Input name={colorKey} className="ctb-hex" maxLength={7} spellCheck={false} autoCapitalize="none" autoCorrect="off" onBlur={() => setTouched(true)} aria-describedby={invalid ? errorId : undefined} />
                    {invalid && <span id={errorId} className="ctb-error">Enter #RGB or #RRGGBB.</span>}
                </TextField>
            </div>
        </div>
    );
}
