/** Rasterize our fixed SVG template, using text nodes and no remote resources. */
export async function cardPNG(svg: SVGSVGElement, width: number, height: number): Promise<Blob> {
    const still = svg.cloneNode(true) as SVGSVGElement;
    for (const avatar of still.querySelectorAll('image[data-export-href]')) {
        avatar.setAttribute('href', avatar.getAttribute('data-export-href')!);
        avatar.removeAttribute('data-export-href');
    }
    const source = new XMLSerializer().serializeToString(still);
    // data: images are already permitted by the site's production CSP.
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image export is not supported in this browser.');
    context.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed.')), 'image/png'));
}

export function downloadCard(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    // Give Safari time to start the download before revoking the object URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
