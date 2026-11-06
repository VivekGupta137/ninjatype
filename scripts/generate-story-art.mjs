import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Original vector illustrations, rasterized for AMP's portrait-poster metadata.
// Keep titles in HTML, and the subject centered so 3:4 posters also crop to 9:16.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = `${root}public/images/stories`;
await mkdir(output, { recursive: true });
const frame = (body, accent = '#8df7af') => `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
<defs>
  <radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b8d0ec" stroke-opacity=".06"/></pattern>
</defs>
<rect width="720" height="960" fill="#080e16"/><rect width="720" height="960" fill="url(#grid)"/>
<ellipse cx="360" cy="310" rx="370" ry="400" fill="url(#glow)"/>
<circle cx="360" cy="330" r="260" fill="none" stroke="${accent}" stroke-opacity=".12"/>
<circle cx="360" cy="330" r="210" fill="none" stroke="${accent}" stroke-opacity=".1" stroke-dasharray="4 10"/>
${body}
<path d="M300 765h120M330 782h60" stroke="${accent}" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
</svg>`;
const window = (inside, color = '#8df7af') => `<rect x="104" y="182" width="512" height="340" rx="22" fill="#0c1723" stroke="${color}" stroke-opacity=".5" stroke-width="2"/>
<path d="M105 238h510" stroke="${color}" stroke-opacity=".22"/>
<circle cx="132" cy="210" r="5" fill="${color}"/><circle cx="150" cy="210" r="5" fill="${color}" opacity=".5"/><circle cx="168" cy="210" r="5" fill="${color}" opacity=".25"/>${inside}`;
const codeLines = (color, count = 7) => Array.from({ length: count }, (_, i) => {
    const x = 138 + (i % 3) * 18;
    const y = 270 + i * 27;
    return `<rect x="${x}" y="${y}" width="${[208, 144, 252, 176, 230, 128, 184][i]}" height="7" rx="3" fill="${color}" opacity="${i % 3 === 0 ? '.85' : '.35'}"/><rect x="${x + 278}" y="${y}" width="${[70, 48, 34][i % 3]}" height="7" rx="3" fill="#f5f7fa" opacity=".18"/>`;
}).join('');
const terminal = color => window(`${codeLines(color, 5)}<path d="m140 444 12 10-12 10m28 0h25" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`, color);
const artwork = {
    friends: frame(window(`<path d="M248 355h224" stroke="#90e6ff" stroke-opacity=".4" stroke-width="3" stroke-dasharray="7 7"/>${[240,360,480].map((x,i) => `<circle cx="${x}" cy="330" r="39" fill="#112638" stroke="${i === 1 ? '#ffd18a' : '#90e6ff'}" stroke-width="2"/><circle cx="${x}" cy="320" r="12" fill="${i === 1 ? '#ffd18a' : '#90e6ff'}"/><path d="M${x-21} 351a21 18 0 0 1 42 0" fill="${i === 1 ? '#ffd18a' : '#90e6ff'}"/><rect x="${x-30}" y="399" width="60" height="7" rx="3" fill="#90e6ff" opacity=".5"/>`).join('')}`, '#90e6ff'), '#90e6ff'),
    ghost: frame(window(`<path d="M146 327h428M146 419h428" stroke="#35485a" stroke-width="3" stroke-dasharray="6 9"/><rect x="146" y="320" width="250" height="14" rx="7" fill="#90e6ff"/><rect x="146" y="412" width="302" height="14" rx="7" fill="#90e6ff" opacity=".16"/><circle cx="396" cy="327" r="23" fill="#90e6ff"/><circle cx="448" cy="419" r="23" fill="#90e6ff" fill-opacity=".12" stroke="#90e6ff" stroke-width="2" stroke-dasharray="4 4"/><path d="M562 277v186" stroke="#f5f7fa" stroke-opacity=".4" stroke-width="3"/>`, '#90e6ff'), '#90e6ff'),
    'home-row': frame(`<rect x="108" y="248" width="504" height="190" rx="22" fill="#0c1723" stroke="#8df7af" stroke-opacity=".5" stroke-width="2"/>${['A','S','D','F','J','K','L',';'].map((letter,i) => { const x=126+i*59; const anchor=letter==='F'||letter==='J'; return `<rect x="${x}" y="280" width="53" height="70" rx="9" fill="${anchor?'#8df7af':'#192938'}" stroke="#8df7af" stroke-opacity=".4"/><text x="${x+26}" y="323" font-family="Arial, sans-serif" font-size="23" font-weight="bold" fill="${anchor?'#080e16':'#cde5d6'}" text-anchor="middle">${letter}</text>${anchor?`<path d="M${x+18} 339h16" stroke="#080e16" stroke-width="3" stroke-linecap="round"/>`:''}`; }).join('')}<rect x="243" y="372" width="234" height="38" rx="7" fill="#192938" stroke="#35485a"/>`),
    'terminal-green': frame(terminal('#8df7af')),
    'terminal-cyan': frame(terminal('#90e6ff'), '#90e6ff'),
    code: frame(window(codeLines('#8df7af'))),
    panels: frame(window(`<rect x="126" y="257" width="200" height="241" rx="8" fill="#112638" stroke="#90e6ff" stroke-opacity=".3"/>${Array.from({ length: 7 }, (_, i) => `<rect x="143" y="${282 + i * 25}" width="${[138, 96, 116][i % 3]}" height="5" rx="2" fill="#90e6ff" opacity=".55"/>`).join('')}${Array.from({ length: 6 }, (_, i) => { const x = 342 + i % 2 * 125, y = 257 + Math.floor(i / 2) * 84; return `<rect x="${x}" y="${y}" width="108" height="73" rx="8" fill="#112638" stroke="#90e6ff" stroke-opacity=".3"/><path d="M${x + 14} ${y + 49}l16-17 14 8 17-20 18 6" fill="none" stroke="#90e6ff" stroke-width="2"/>`; }).join('')}`, '#90e6ff'), '#90e6ff'),
    colors: frame(['#8df7af', '#ffd18a', '#90e6ff', '#e1e7ee'].map((color, i) => {
        const x = 130 + i % 2 * 244, y = 210 + Math.floor(i / 2) * 165;
        return `<rect x="${x}" y="${y}" width="216" height="138" rx="16" fill="#0c1723" stroke="${color}" stroke-width="2"/><circle cx="${x + 22}" cy="${y + 24}" r="5" fill="${color}"/><path d="M${x + 22} ${y + 56}h130m-130 22h95m-95 22h115" stroke="${color}" stroke-width="6" stroke-linecap="round" opacity=".8"/>`;
    }).join(''), '#90e6ff'),
    result: frame(window(`<circle cx="360" cy="354" r="66" fill="#8df7af" fill-opacity=".08" stroke="#8df7af" stroke-width="2"/><path d="m331 354 20 21 40-43" fill="none" stroke="#8df7af" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><rect x="237" y="458" width="246" height="8" rx="4" fill="#8df7af"/><circle cx="252" cy="260" r="3" fill="#8df7af"/><circle cx="468" cy="405" r="3" fill="#8df7af"/>`)),
    keyboard: frame(`<g transform="translate(0 20)"><rect x="100" y="222" width="520" height="268" rx="26" fill="#0c1723" stroke="#ffd18a" stroke-opacity=".5" stroke-width="2"/>${Array.from({ length: 30 }, (_, i) => {
        const row = Math.floor(i / 10), x = 116 + i % 10 * 49, y = 246 + row * 55;
        const active = row === 1;
        return `<rect x="${x}" y="${y}" width="43" height="43" rx="7" fill="${active ? '#ffd18a' : '#192938'}" stroke="${active ? '#ffd18a' : '#35485a'}"/>${active && [3, 6].includes(i % 10) ? `<path d="M${x + 15} ${y + 34}h13" stroke="#3a2b16" stroke-width="3" stroke-linecap="round"/>` : ''}`;
    }).join('')}<rect x="240" y="417" width="240" height="45" rx="8" fill="#192938" stroke="#35485a"/></g>`, '#ffd18a'),
    pace: frame(window(`<circle cx="290" cy="355" r="78" fill="#ffd18a" fill-opacity=".05" stroke="#ffd18a" stroke-width="3"/><path d="M290 302v53l34 22m-50-119h32" fill="none" stroke="#ffd18a" stroke-width="7" stroke-linecap="round"/>${[58, 100, 78, 124].map((w, i) => `<rect x="407" y="${291 + i * 38}" width="${w}" height="12" rx="6" fill="#ffd18a" opacity="${.35 + i * .18}"/>`).join('')}`, '#ffd18a'), '#ffd18a'),
    accuracy: frame(window([0, 1, 2].map(i => `<rect x="143" y="${265 + i * 76}" width="434" height="58" rx="10" fill="#192938"/><path d="M169 ${294 + i * 76}h200" stroke="#ffd18a" stroke-width="7" stroke-linecap="round" opacity=".6"/>${i !== 1 ? `<path d="m524 ${293 + i * 76} 8 8 16-18" fill="none" stroke="#8df7af" stroke-width="4" stroke-linecap="round"/>` : `<circle cx="536" cy="370" r="12" fill="none" stroke="#ffd18a" stroke-width="3"/>`}`).join(''), '#ffd18a'), '#ffd18a'),
    race: frame(window(`<path d="M146 327h428M146 419h428" stroke="#35485a" stroke-width="3" stroke-dasharray="6 9"/><rect x="146" y="320" width="267" height="14" rx="7" fill="#ffd18a"/><rect x="146" y="412" width="205" height="14" rx="7" fill="#90e6ff"/><circle cx="413" cy="327" r="22" fill="#ffd18a"/><circle cx="351" cy="419" r="22" fill="#90e6ff"/><path d="M562 277v186" stroke="#f5f7fa" stroke-opacity=".5" stroke-width="3"/><path d="M547 277h30v20h-30zm0 40h30v20h-30zm0 40h30v20h-30zm0 40h30v20h-30" fill="#f5f7fa" fill-opacity=".4"/>`, '#ffd18a'), '#ffd18a'),
};
for (const [name, svg] of Object.entries(artwork)) {
    await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(`${output}/${name}.jpg`);
}
await sharp(`${root}public/favicon/favicon-192x192.png`).resize(192, 192).flatten({ background: '#080e16' }).png().toFile(`${output}/publisher.png`);
console.log(`Generated ${Object.keys(artwork).length} portrait illustrations and the publisher logo.`);
