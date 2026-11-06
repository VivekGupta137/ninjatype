import { readFileSync } from 'node:fs';
import { THEME } from '@/constants/themes';
import { SHARE_THEME_IDS, type CardPalettes } from './shareThemes';

/** Build-time only. Read the same CSS files ThemeWatcher loads in the app. */
export function loadCardPalettes(): CardPalettes {
    return Object.fromEntries(SHARE_THEME_IDS.map(theme => {
        const css = readFileSync(new URL(`../../public${THEME[theme].path}`, import.meta.url), 'utf8');
        const color = (name: string) => {
            const value = css.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{3,8})\\s*;`))?.[1];
            if (!value) throw new Error(`Missing card theme color: ${theme} / ${name}`);
            return value;
        };
        return [theme, { bg: color('bg-color'), surface: color('alt-bg-color'), text: color('text-color'), main: color('main-color'), muted: color('sub-text-color'), border: color('sub-alt-text-color') }];
    })) as CardPalettes;
}
