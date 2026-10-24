import { version } from '../../package.json';
import { getBlogPosts } from '@/lib/blog';
import { GUIDE_APPS, type GuideApp } from '@/lib/guideApps';
import { mainPageFAQs, learnPageFAQs, multiplayerPageFAQs, onlinePageFAQs } from '@/constants/faq';

const appDetails: Record<GuideApp, string> = {
    practice: 'Free word-count and timed typing tests with dictionaries and quote collections. Results distinguish raw WPM from correct WPM and report accuracy. Settings and completed history are saved in this browser.',
    learn: 'Four QWERTY paired-finger lessons: index (F/J), middle (D/K), ring (S/L), and pinky (A/semicolon) home positions. Follow the key guide, practise assigned keys, and track local lesson progress and stars.',
    multiplayer: 'Create a room, invite friends, or join a public room. At least two players ready up before a shared countdown. Words races end on the first accepted finish or a two-minute limit; Time races end at the selected timer. Compare WPM and accuracy and rematch.',
    'ghost-race': 'A solo typing race against the average WPM of the fastest valid saved attempt. Choose 15, 30, or 50 words. The shadow projects a steady past pace onto a fresh passage, rather than replaying keystrokes. A first completed run establishes a benchmark when no saved attempt is available.',
    'hacker-typer': 'An entertainment simulator that displays generated terminal activity and code. It does not perform actual hacking or measure real coding or typing skill. Use Practice or Learn for measured typing exercises.',
};
const faqGroups = [
    { name: 'Typing practice', faqs: mainPageFAQs },
    { name: 'Touch typing lessons', faqs: learnPageFAQs },
    { name: 'Multiplayer typing race', faqs: multiplayerPageFAQs },
    { name: 'Ghost Race', faqs: onlinePageFAQs },
];

/** Static-build references share the same guide and FAQ sources as the app. */
export async function getLLMReference(site: URL, expanded = false): Promise<string> {
    const absolute = (path: string) => new URL(path, site).href;
    const posts = await getBlogPosts();
    const apps = Object.entries(GUIDE_APPS) as Array<[GuideApp, typeof GUIDE_APPS[GuideApp]]>;
    const lines = [
        '# NinjaType',
        '',
        '> Free online typing tests, touch typing lessons, multiplayer typing races, and a solo Ghost Race challenge.',
        '',
        `Official website: ${absolute('/')}`,
        `Application version: ${version}`,
        '',
        'No account is required. Settings, practice history, and learning progress are stored in the browser and do not automatically sync between devices. Multiplayer sends room and race information to the service, and the site uses analytics. A physical keyboard is recommended for typing practice.',
        '',
        '## Apps',
        '',
        ...apps.map(([id, app]) => `- [${app.label}](${absolute(app.href)}): ${appDetails[id]}`),
        '',
        '## Help and progress',
        '',
        `- [Help and frequently asked questions](${absolute('/help/')}): FAQs grouped by app, with relevant training guides.`,
        `- [Typing history](${absolute('/history/')}): Saved WPM, accuracy, and progress in this browser.`,
        `- [Settings](${absolute('/settings/')}): Themes, practice preferences, and training-data management.`,
        `- [Star ratings](${absolute('/stars/')}): Learn about typing achievement milestones.`,
        '',
        '## Blog guides',
        '',
        `- [All typing guides](${absolute('/blog/')}): Browse the guide library by app.`,
    ];
    for (const [id, app] of apps) {
        const guides = posts.filter(post => post.app === id);
        if (!guides.length) continue;
        lines.push('', `### ${app.label}`, '');
        lines.push(...guides.map(guide => `- [${guide.title}](${absolute(guide.url)}): ${guide.url.startsWith('/hacker-typer/blog/') ? 'Archived article about the Hacker Typer simulator.' : guide.description}`));
    }
    if (expanded) {
        lines.push('', '## Frequently asked questions', '', 'These answers use the same source as the app and Help page. The guide links above lead to the full articles.', '');
        for (const group of faqGroups) {
            lines.push(`### ${group.name}`, '');
            for (const faq of group.faqs) lines.push(`#### ${faq.question}`, '', faq.answer, '');
        }
        lines.push('## Product and measurement notes', '',
            'Practice and race modes do not use identical accuracy definitions. Main practice evaluates errors remaining in the typed text; race accuracy includes incorrect character attempts even when corrected. Race words must be corrected before advancing.', '',
            'Ghost Race uses average saved WPM, not an exact historical keystroke replay. Tests with different dictionaries, lengths, or time settings are not directly interchangeable benchmarks.', '',
            'The browser app uses Astro, React, and TypeScript with Nanostores for state. Static pages are built for Cloudflare Pages; multiplayer uses a Cloudflare Worker. Local browser data can be lost when storage is cleared. No fixed learning timeline or WPM improvement is guaranteed.', '');
    }
    lines.push('', '## Optional', '',
        `- [About NinjaType](${absolute('/about/')})`,
        `- [Contact](${absolute('/contact/')})`,
        `- [Support](${absolute('/support/')})`,
        `- [Contributors](${absolute('/contributors/')})`,
        `- [RSS feed](${absolute('/rss.xml')})`,
        `- [${expanded ? 'Concise AI reference' : 'Expanded app reference and FAQs'}](${absolute(expanded ? '/llms.txt' : '/llms-full.txt')})`,
        '- [Project source](https://github.com/VivekGupta137/ninjatype)',
        '', 'The legacy /online/ route redirects to /ghost-race/, and /multiplayer/ redirects to /multiplayer-typing-race/. Use the canonical app URLs above.', '');
    return lines.join('\n');
}
