import { THEME } from '@/constants/themes';

// Stable wire IDs: never reorder; append new themes to preserve existing links.
export const SHARE_THEME_IDS = ['amoled', 'monokaiClassic', 'dracula', 'nord', 'solarized', 'oneDark', 'githubDark', 'gruvbox', 'tokyoNight', 'catppuccin', 'material', 'rosePine'] as const;
export type ShareTheme = typeof SHARE_THEME_IDS[number];
export type CardPalette = { bg: string; surface: string; text: string; main: string; muted: string; border: string };
export type CardPalettes = Record<ShareTheme, CardPalette>;
export const isShareTheme = (value: unknown): value is ShareTheme => typeof value === 'string' && (SHARE_THEME_IDS as readonly string[]).includes(value);
export const DEFAULT_CARD_PALETTE: CardPalette = { ...THEME.amoled.colors, surface: '#121212', muted: '#808080', border: '#404040' };
