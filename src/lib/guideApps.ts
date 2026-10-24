export const GUIDE_APPS = {
    practice: { label: 'Typing practice', href: '/', cta: 'Start a typing test', description: 'Measure your pace, work on accuracy, and build a repeatable practice routine.' },
    learn: { label: 'Touch typing lessons', href: '/learn/', cta: 'Open finger lessons', description: 'Learn consistent finger placement and practise one part of the keyboard at a time.' },
    multiplayer: { label: 'Multiplayer typing', href: '/multiplayer-typing-race/', cta: 'Create or join a typing race', description: 'Practise with friends, pace your races, and compare results together.' },
    'ghost-race': { label: 'Ghost Race', href: '/ghost-race/', cta: 'Race your saved best pace', description: 'Challenge your own pace and work through a typing-speed plateau.' },
    'hacker-typer': { label: 'Hacker Typer', href: '/hacker-typer/', cta: 'Open Hacker Typer', description: 'Explore the simulated terminal, then switch to drills that measure real typing.' },
} as const;
export type GuideApp = keyof typeof GUIDE_APPS;
