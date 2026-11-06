import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ResultCard, { CARD_FORMATS, type CardFormat } from './ResultCard';
import SharedResult from './SharedResult';
import { visibleShareResult, type ShareResult } from '@/lib/shareResult';
import { loadCardPalettes } from '@/lib/shareThemePalettes.server';

const result: ShareResult = { v: 1, username: 'Ninja', wpm: 87, accuracy: 98.5, challenge: 'time', speed: 'raw', duration: 60 };

test('every social format is standalone SVG with accessible scores and no external resources', () => {
    for (const format of Object.keys(CARD_FORMATS) as CardFormat[]) {
        const html = renderToStaticMarkup(<ResultCard result={result} format={format} />);
        expect(html).toContain(`width="${CARD_FORMATS[format].width}" height="${CARD_FORMATS[format].height}"`);
        expect(html).toContain('87 raw WPM, 98.5% accuracy.');
        expect(html).toContain('ninjatype.com');
        expect(html).toContain('Hi I can now type at');
        expect(html).toContain('home-position markers');
        expect(html).toContain('not a verified score');
        expect(html).not.toMatch(/<script|foreignObject|href="(?:https?:|javascript:)/i);
        expect(html).toContain('href="data:image/svg+xml;charset=utf-8,');
    }
});

test('even a caller bypassing validation cannot inject HTML through card text', () => {
    const html = renderToStaticMarkup(<ResultCard result={{ ...result, username: '<script>alert(1)</script>', detail: '<image href="https://evil.example"/>' }} />);
    expect(html).not.toContain('<script>');
    expect(html.match(/<image /g)).toHaveLength(1);
    expect(html).not.toContain('href="https://evil.example');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;image');
});

test('share island starts deterministically during SSR, without browser access', () => {
    const html = renderToStaticMarkup(<SharedResult palettes={loadCardPalettes()} />);
    expect(html).toContain('Opening the result card');
    expect(html).not.toContain('undefined');
});

test('hidden accuracy is absent from visible and accessible card text in every theme and format', () => {
    for (const palette of Object.values(loadCardPalettes())) {
        for (const format of Object.keys(CARD_FORMATS) as CardFormat[]) {
            const html = renderToStaticMarkup(<ResultCard result={{ ...result, accuracy: undefined }} palette={palette} format={format} />);
            expect(html).not.toContain('accuracy');
            expect(html).not.toContain('98.5');
            expect(html).toContain(`fill="${palette.bg}"`);
            expect(html).toContain(`fill="${palette.main}"`);
            expect(html).toContain('60 seconds.');
            expect(html).toContain('Timed typing');
        }
    }
});


test('Gaze is deterministic, animated in the preview, and supplies a still export frame', () => {
    const card = () => renderToStaticMarkup(<ResultCard result={result} />);
    expect(card()).toBe(card());
    const html = card();
    const animated = decodeURIComponent(html.match(/ href="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)![1]);
    const still = decodeURIComponent(html.match(/data-export-href="data:image\/svg\+xml;charset=utf-8,([^"]+)"/)![1]);
    expect(animated).toContain('@keyframes dbgaLook');
    expect(animated).toContain('prefers-reduced-motion: no-preference');
    expect(still).not.toContain('@keyframes');
    expect(still).toContain('shape-');
    expect(renderToStaticMarkup(<ResultCard result={{ ...result, avatarVariant: 1 }} />)).not.toBe(html);
});


test('excluded dictionary and practice type are absent from the image and its description', () => {
    for (const format of Object.keys(CARD_FORMATS) as CardFormat[]) {
        const hidden = visibleShareResult({ ...result, dictionary: '1k' }, { accuracy: false, dictionary: false, challenge: false });
        const html = renderToStaticMarkup(<ResultCard result={hidden} format={format} />);
        for (const text of ['98.5', 'accuracy', '1K Common', 'dictionary', 'Timed typing', 'practice type']) expect(html).not.toContain(text);
        expect(html).toContain('60 seconds.');
    }
});
