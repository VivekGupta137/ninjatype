export interface FAQItem {
    question: string;
    answer: string;
    guideHref?: string;
}

export const mainPageFAQs: FAQItem[] = [
    {
        question: 'How can I practise like a typing ninja?',
        answer: 'Use NinjaType to take a baseline typing test, practise difficult keys in Learn, and apply those movements in fresh passages. Try Ghost Race for a solo pace challenge or Multiplayer Typing Race to play with friends. Review accuracy alongside WPM and repeat similar settings when comparing progress.',
        guideHref: '/blog/how-to-get-better-at-typing/',
    },
    {
        "question": "Is this typing test free?",
        "answer": "Yes. NinjaType offers free online typing tests and typing practice without registration. Settings and completed practice history are saved in this browser; they do not automatically sync between devices."
    },
    {
        "question": "How does the typing speed test calculate WPM?",
        "answer": "Words per minute uses five characters as one word: characters divided by five, divided by elapsed minutes. Practice results distinguish raw typing speed from correct WPM. Accuracy reflects the errors remaining in your typed text; race modes count character attempts, including corrected mistakes."
    },
    {
        "question": "Can I choose a timed test or a word count?",
        "answer": "Choose Words mode for a fixed-length passage or Time mode for a timed typing test. Select a word dictionary or a quote collection in the practice controls. Keep settings consistent when comparing scores."
    },
    {
        "question": "How to get better at typing?",
        "guideHref": "/blog/how-to-get-better-at-typing/",
        "answer": "Use a repeatable loop: take a baseline test, identify one recurring mistake, practise that key or word slowly, and retest with the same settings. Use Learn for finger exercises and History to compare completed sessions. Raise your pace when accuracy is steady; no routine guarantees a particular WPM or improvement timeline."
    },
    {
        "question": "What is the average typing speed?",
        "guideHref": "/blog/average-typing-speed/#what-is-the-average-typing-speed",
        "answer": "Typing.com gives roughly 40 words per minute as a general reference. It is not a measured average for NinjaType users or a universal target: results depend on the people tested, passage, duration, keyboard and error rules. Use the same test settings to compare your own WPM and accuracy over time."
    },
    {
        "question": "What is a good typing speed?",
        "guideHref": "/blog/average-typing-speed/#what-is-a-good-typing-speed",
        "answer": "A good typing speed is one you can sustain accurately for your task. Around 40 WPM is a useful general reference, and 60 WPM can be a practical next goal for someone already comfortable at that pace. These are training reference points, not job requirements. Check any employer or examination rules directly."
    },
    {
        "question": "What is a fast typing speed?",
        "guideHref": "/blog/average-typing-speed/#what-is-a-fast-typing-speed",
        "answer": "For general keyboard practice, a sustained 80 WPM can be a useful fast-typing milestone, while 100 WPM is a higher target. These are practical training labels rather than universal classifications. Compare accuracy and test conditions too: a short common-word sprint is different from a longer passage with punctuation."
    },
    {
        "question": "What is touch typing?",
        "guideHref": "/blog/what-is-touch-typing/",
        "answer": "Touch typing means finding keys through learned movements without looking at the keyboard for each letter. On QWERTY, the home position is A, S, D, F and J, K, L, semicolon. Start with the Learn finger lessons, then apply those movements to fresh words in typing practice."
    },
    {
        "question": "What is 10-key typing?",
        "guideHref": "/blog/what-is-10-key-typing/",
        "answer": "10-key typing is numeric data entry using the ten digits on a numeric keypad, usually with the right hand. It is different from ten-finger touch typing. Numeric-entry tests often use keystrokes per hour and accuracy rather than ordinary WPM. NinjaType offers text typing practice and finger lessons, but does not currently provide a dedicated 10-key test."
    },
    {
        "question": "How to fix a keyboard not typing?",
        "guideHref": "/blog/how-to-fix-keyboard-not-typing/",
        "answer": "First click the typing area and check whether the test is waiting, paused or complete. Try a text editor to see whether the problem affects other apps. If it does, check the keyboard connection or battery, input layout and accessibility settings, and reconnect or restart when appropriate. If only NinjaType is affected, reload the page and try another browser."
    },
    {
        "question": "Are keyboard covers bad for typing?",
        "guideHref": "/blog/are-keyboard-covers-bad-for-typing/",
        "answer": "A keyboard cover can change key feel and may affect your comfort or typing accuracy, but it does not automatically make every user slower. Compare several tests with and without it using the same settings. Follow your laptop manufacturer's guidance; Apple says to remove keyboard covers before closing a Mac notebook display."
    },
    {
        "question": "Where can I see my typing test history?",
        "answer": "The History page shows saved results, WPM, accuracy, and progress over time in this browser. Clearing browser storage can remove that history. A saved valid attempt can also provide the personal-best pace for Ghost Race."
    },
    {
        "question": "Can I play typing games with friends or by myself?",
        "answer": "Use Multiplayer Typing Race to invite friends or join a public room. Use Ghost Race for a solo typing game against the average WPM of your fastest valid saved attempt. Both race modes require you to correct each word before advancing."
    },
    {
        "question": "Can I change the theme?",
        "answer": "Yes. Open Settings and choose a theme for the typing area and the rest of the app. You can also adjust practice preferences there. A physical keyboard is recommended for keyboard typing practice."
    }
];

export const multiplayerPageFAQs: FAQItem[] = [
    {
        question: 'Is NinjaType a TypeRacer alternative?',
        answer: 'NinjaType is an independent typing race app with free room-based multiplayer, nicknames, Words and Time modes, shared passages, and rematches. It is not affiliated with TypeRacer. Choose it when you want to create a room, invite friends, or join an available public race without an account.',
        guideHref: '/blog/typeracer-alternative/',
    },
    {
        question: 'Can I play a typing race with friends for free?',
        answer: 'Yes. Choose a nickname and create a typing race room. You’ll enter its lobby automatically, where you can share the invitation link with your friends. NinjaType multiplayer is free and does not require an account. You can also choose a public room to race other players.',
    },
    {
        question: 'How does the multiplayer typing test work?',
        answer: 'At least two players ready up and start after a shared countdown. Everyone types the same passage. Correct each word before advancing. In Words mode, the first accepted completion or the two-minute limit ends the round for everyone. In Time mode, the selected timer ends the round.',
    },
    {
        question: 'Can I see my typing speed and accuracy during a race?',
        answer: 'Your words per minute (WPM), accuracy, word progress and time remaining update on your screen while you type. WPM uses correct characters divided by five, divided by elapsed minutes. Accuracy includes mistakes you later correct. The top-five panel shows opponents’ estimated WPM and completion about every second, ranked by completion. After the race, compare everyone’s final scores and WPM or completion trend chart.',
    },
    {
        question: 'Can I choose a timed typing race and dictionary?',
        answer: 'Yes. When creating a room, choose Words mode with 15, 30 or 50 words, or Time mode with a 25, 45, 60, 120 or 300-second timer. Choose from English 1k, English 5k, English 2k short or long, English 5k medium, and Brainrot. Everyone receives the same text. Words mode ends when someone finishes; Time mode runs until the timer ends and the highest correct-character score wins. Rematches keep the room’s settings.',
    },
    {
        question: 'How do I join a friend’s typing race room?',
        answer: 'Open their invitation link or enter the exact room name, choose a nickname, and complete the security check. Room names are case-sensitive. If a race has already started, you can watch and join the next round.',
    },
    {
        question: 'Can we rematch after a typing race?',
        answer: 'Yes. Results remain in the room for up to two minutes. Once your result is collected, choose Race again. Two connected players choosing a rematch start a new countdown. Rooms have a maximum lifetime of 20 minutes, including rematches.',
    },
    {
        question: 'What happens if I lose my connection?',
        answer: 'Your place is held for up to two minutes so you can reconnect after a fresh security check. The race clock continues, and the room or results window may expire sooner. If multiplayer is unavailable, you can still use solo typing practice.',
    },
];

export const onlinePageFAQs: FAQItem[] = [
    {
        question: "What is Ghost Race in NinjaType?",
        answer: "Ghost Race is a solo race against your shadow: the average pace of your fastest valid saved typing attempt. Choose a 15, 30, or 50-word track and start after a three-second countdown. If you have no saved attempts, finish a run to set a pace you can race next time.",
    },
    {
        question: "How does my shadow race me?",
        answer: "Your best saved WPM is projected onto the current passage using the standard five-character word measure. Your shadow starts with you and keeps that pace until the finish. Finish sooner to beat it. This follows your average past speed rather than replaying individual keystrokes. Correct each word before pressing space to advance.",
    },
    {
        question: "Does Ghost Race track accuracy and penalties?",
        answer: "Accuracy measures correct character presses across your attempts, including mistakes you later correct. Mistakes must be corrected before advancing to the next word, so they cost typing time. There is no additional time penalty.",
    },
    {
        question: "Can I use Ghost Race on mobile and tablet devices?",
        answer: "Yes. The layout adapts to desktop, tablet, and mobile screens. A physical keyboard is recommended for typing practice. Saved attempts remain in the browser where you completed them.",
    },
    {
        question: "Do I need an account to use NinjaType Ghost Race?",
        answer: "No account is required. Choose a race length, select Start race, and begin typing when the countdown finishes. Completed race results are saved locally to your typing history. Your solo practice settings are kept separate.",
    },
];

export const learnPageFAQs: FAQItem[] = [
    {
        question: 'How do I learn touch typing through practice?',
        answer: 'Choose a finger lesson, find its home keys using the QWERTY guide, and practise at a pace that lets you correct mistakes calmly. Repeat unfamiliar reaches, then use fresh words in typing practice. Consistent movements and accuracy are useful first goals before increasing speed.',
        guideHref: '/blog/touch-typing-for-beginners/',
    },
    {
        "question": "What is touch typing?",
        "answer": "Touch typing means finding keys by feel rather than looking at the keyboard. These free lessons help you practise consistent finger placement on a QWERTY keyboard, with an on-screen key guide and feedback."
    },
    {
        "question": "Which typing lessons are available?",
        "answer": "NinjaType has four paired-finger lessons: index, middle, ring, and pinky. Their home keys are F and J, D and K, S and L, and A and semicolon. Each lesson practises the keys assigned to that finger pair; choose any lesson and repeat it at your own pace."
    },
    {
        "question": "Where should my fingers rest on the home row?",
        "answer": "Place the left fingers on A, S, D, F and the right fingers on J, K, L, semicolon. The bumps on F and J help you find those keys by touch. Return to the home position after reaching for another key."
    },
    {
        "question": "How should a beginner practise touch typing?",
        "answer": "Start slowly with one finger lesson, using the on-screen guide to find the keys. Aim for fewer mistakes before increasing your pace, take breaks when needed, and then try ordinary words on the main typing practice page."
    },
    {
        "question": "How long does it take to learn touch typing?",
        "answer": "There is no fixed timeline or guaranteed WPM. Your starting habits, keyboard familiarity, and practice all matter. Compare your own accuracy and speed across similar sessions rather than aiming for a promised result."
    },
    {
        "question": "How do I track lesson progress?",
        "answer": "Lesson cards show your saved best WPM, accuracy, completion, and earned stars. Learning progress is stored in this browser. The star ratings page explains the milestones, and Settings lets you manage your training data."
    }
];
