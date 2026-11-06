import { decodeShareResult, sharePath, type ShareResult } from './shareResult';

export const SHARE_IMAGE_FORMATS = ['landscape', 'square', 'story'] as const;
export type ShareImageFormat = typeof SHARE_IMAGE_FORMATS[number];

export function shareImagePath(result: ShareResult, format: ShareImageFormat = 'landscape'): string {
    return `${sharePath(result)}&type=png${format === 'landscape' ? '' : `&format=${format}`}`;
}

export function readShareImageRequest(url: URL) {
    const params = url.searchParams;
    if (params.getAll('type').length !== 1 || params.get('type') !== 'png' ||
        params.getAll('result').length !== 1 || params.getAll('format').length > 1) return null;
    const result = decodeShareResult(params.get('result') ?? '');
    const format = params.get('format') ?? 'landscape';
    if (!result || !SHARE_IMAGE_FORMATS.includes(format as ShareImageFormat)) return null;
    return { result, format: format as ShareImageFormat };
}
