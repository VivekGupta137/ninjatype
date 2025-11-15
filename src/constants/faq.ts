export interface FAQItem {
    question: string;
    answer: string;
}

export const mainPageFAQs: FAQItem[] = [
    {
        question: "What is NinjaType and how does it help improve typing speed?",
        answer: "NinjaType is a free online typing practice platform designed to help you improve your typing speed (WPM - words per minute) and accuracy. With real-time feedback, performance analytics, and a distraction-free interface, you can track your progress and master touch typing through consistent practice. Our minimalist design keeps you focused on what matters most - developing muscle memory and increasing your typing efficiency."
    },
    {
        question: "How do I track my typing progress and WPM history?",
        answer: "NinjaType automatically saves your typing test results and provides comprehensive analytics on the History page. You can view your typing speed history, track your best WPM scores, analyze accuracy trends with interactive charts, and filter results by different time ranges (1 day, 7 days, 2 weeks, 1 month, or all time). Your lifetime statistics and daily best scores are always available to help you monitor improvement."
    },
    {
        question: "What typing practice modes and word sets are available?",
        answer: "NinjaType offers multiple practice modes to suit different skill levels and preferences. Choose from various word sets including 1k, 2k, and 5k common words, or practice with curated quote collections featuring motivational quotes, funny quotes, programming quotes, and even brainrot quotes. You can customize word count, enable countdown timers, and adjust settings to create your ideal typing practice experience."
    },
    {
        question: "Can I customize the appearance and themes in NinjaType?",
        answer: "Yes! NinjaType includes over 13 beautiful themes to personalize your typing experience. Choose from popular themes like Dracula, Tokyo Night, Catppuccin, Nord, Gruvbox, One Dark, Rose Pine, Solarized Dark, Monokai, Material, GitHub Dark, and AMOLED. All themes are carefully designed to reduce eye strain during extended practice sessions while maintaining a clean, minimalist aesthetic."
    },
    {
        question: "Is there a structured way to learn touch typing from scratch?",
        answer: "Absolutely! Visit our Learn Touch Typing section where you can practice with each finger individually through progressive lessons. The learning module helps you build proper finger placement and muscle memory systematically. Start with home row keys and gradually progress to mastering all keys. Track your learning progress with achievement badges and finger-specific statistics to ensure balanced skill development across all fingers."
    },
    {
        question: "Is NinjaType free to use? Do I need to create an account?",
        answer: "NinjaType is completely free to use and doesn't require any account creation or registration. Your settings and typing history are automatically saved locally in your browser, giving you privacy and convenience. You can start practicing immediately without any barriers. The application works seamlessly on desktop, tablet, and mobile devices, so you can practice your typing skills anywhere."
    },
    {
        question: "What makes NinjaType different from other typing practice websites?",
        answer: "NinjaType stands out with its minimalist, distraction-free design built using modern web technologies (Astro and React) for blazing-fast performance. Features that set us apart include: real-time keyboard visualization, comprehensive performance analytics with interactive charts, persistent state management, multiple customizable themes, progressive touch typing lessons, and a completely free, privacy-focused approach with no ads or tracking. Everything is optimized for keyboard warriors who want efficient, focused practice."
    },
    {
        question: "How can I improve my typing accuracy and reduce errors?",
        answer: "To improve typing accuracy, focus on proper technique rather than speed initially. Use NinjaType's Learn section to practice individual finger placement and develop correct muscle memory. Start with shorter word counts and gradually increase difficulty. Pay attention to the error highlighting feature that shows exactly where you made mistakes. Regular practice with the same word sets helps you identify patterns in your errors. Most importantly, resist the urge to look at your keyboard - use the on-screen keyboard visualization instead."
    },
    {
        question: "What is a good typing speed (WPM) and how long does it take to improve?",
        answer: "The average typing speed is around 40 WPM, while professional typists achieve 70-80 WPM or higher. With consistent practice on NinjaType, most users see noticeable improvement within 2-3 weeks. Beginners typically start at 20-30 WPM and can reach 50-60 WPM within a few months of daily practice. The key is consistency - practicing 15-30 minutes daily yields better results than occasional long sessions. Use NinjaType's history tracking to monitor your progress and celebrate milestones."
    },
    {
        question: "Does NinjaType work on mobile devices and tablets?",
        answer: "Yes! NinjaType is fully responsive and works seamlessly on mobile phones, tablets, and desktop computers. While physical keyboard practice is most effective for improving typing speed, you can use mobile devices to access your typing history, review statistics, and even practice with on-screen keyboards. The interface automatically adapts to your screen size, ensuring a smooth experience across all devices. All your progress syncs locally on each device through browser storage."
    },
    {
        question: "How do the countdown timer and word count modes work?",
        answer: "NinjaType offers flexible practice modes to match your goals. In word count mode, you type a specific number of words (15, 30, 50, or 100) at your own pace, perfect for focused practice sessions. In countdown timer mode, you type as many words as possible within a set time limit (15, 30, or 60 seconds), ideal for speed challenges and testing your sustained performance. Both modes provide instant feedback on WPM and accuracy, allowing you to choose the practice style that best suits your improvement strategy."
    },
    {
        question: "Can I practice typing with programming languages or special characters?",
        answer: "Yes! NinjaType includes a programming quotes collection specifically designed for developers who want to practice typing code-related syntax and terminology. This helps you get comfortable with special characters, brackets, and programming-specific vocabulary. While we focus primarily on improving overall typing proficiency, practicing with programming quotes naturally exposes you to common coding patterns and helps build muscle memory for characters frequently used in software development."
    },
    {
        question: "How does NinjaType calculate typing speed (WPM) and accuracy?",
        answer: "WPM (Words Per Minute) is calculated using the standard formula: (total characters typed / 5) / time in minutes. The number 5 represents the average word length in English. Accuracy is calculated as the percentage of correctly typed characters compared to the total characters in the text. NinjaType provides real-time updates of both metrics as you type, along with error counts. Your CPM (Characters Per Minute) is also tracked, giving you multiple perspectives on your typing performance. All metrics are saved in your history for long-term progress tracking."
    },
    {
        question: "Are there keyboard shortcuts to navigate and control NinjaType?",
        answer: "Yes! NinjaType is built for keyboard-focused users. Press Tab or click to focus the typing area and start practicing. When you complete a test, simply press Tab or Enter to restart. The interface is designed to minimize mouse usage - you can navigate most features using keyboard shortcuts. The minimalist design automatically hides distracting elements when you're actively typing, creating a truly keyboard-centric experience. This approach helps you maintain flow state and focus entirely on improving your typing skills."
    },
    {
        question: "How does NinjaType help with touch typing for beginners?",
        answer: "NinjaType's Learn Touch Typing section is specifically designed for beginners. It breaks down the keyboard into finger zones, allowing you to practice each finger independently. Start with the home row (ASDF JKL;) and gradually expand to other keys. The system provides visual feedback showing which finger should press each key, helping you build correct habits from the start. Achievement badges mark your progress, and detailed statistics show which fingers need more practice. This systematic approach ensures you develop proper touch typing technique rather than hunting and pecking."
    }
];

export const learnPageFAQs: FAQItem[] = [
    {
        question: "What is touch typing and why should I learn it?",
        answer: "Touch typing is the ability to type without looking at the keyboard, using muscle memory to locate keys through proper finger placement. Learning touch typing significantly increases your typing speed, improves accuracy, reduces physical strain, and boosts productivity. It's an essential skill for programmers, writers, students, and anyone who works with computers regularly. With proper technique, you can achieve 60-100+ WPM while maintaining high accuracy."
    },
    {
        question: "How does the finger-based learning system work?",
        answer: "NinjaType's Learn Touch Typing section breaks down the keyboard into zones assigned to each finger. You can practice with individual fingers (left pinky, left ring, left middle, left index, thumbs, right index, right middle, right ring, right pinky) to build muscle memory systematically. Each finger has specific keys it should press - for example, your left index finger handles F, G, R, T, V, B, and related keys. This targeted practice helps you master proper technique one finger at a time."
    },
    {
        question: "What is the home row and why is it important?",
        answer: "The home row consists of the keys A, S, D, F (left hand) and J, K, L, ; (right hand). These are the resting positions where your fingers should return after pressing any key. The F and J keys usually have small bumps to help you find the home row without looking. Proper home row positioning is the foundation of touch typing - it ensures consistent finger placement and enables you to reach all other keys efficiently. Start by mastering the home row before progressing to other keys."
    },
    {
        question: "How long does it take to learn touch typing?",
        answer: "Most people can learn basic touch typing in 2-4 weeks with consistent daily practice of 30-60 minutes. However, reaching high speeds (70+ WPM) typically takes 2-3 months of regular practice. The key is consistency and proper technique from the start. NinjaType's progressive finger-based lessons help you build skills systematically. Don't rush - focus on accuracy first, and speed will naturally follow as muscle memory develops. Track your progress with our achievement badges and statistics."
    },
    {
        question: "What are the achievement badges and how do they work?",
        answer: "Achievement badges in the Learn section help you track milestones for each finger as you progress through lessons. Badges are earned based on typing speed (WPM) and accuracy thresholds specific to each finger's practice sessions. They provide motivation and clear goals, helping you identify which fingers need more practice. Earning badges ensures balanced skill development across all fingers, which is crucial for achieving high overall typing speeds with proper technique."
    },
    {
        question: "Should I look at the keyboard while learning touch typing?",
        answer: "No! The entire point of touch typing is to type without looking at the keyboard. While it may feel slower initially, resist the urge to look down. Use NinjaType's on-screen keyboard visualization to guide you instead. The visual feedback shows which key you should press next and helps you learn finger-to-key associations. With consistent practice and proper finger placement on the home row, you'll develop muscle memory that makes looking at the keyboard unnecessary."
    },
    {
        question: "What's the best practice routine for learning touch typing?",
        answer: "Start with 15-30 minute daily practice sessions focusing on accuracy over speed. Begin with individual finger exercises on the Learn page to build proper technique for each finger. Practice the home row keys first, then gradually expand to other rows. Take short breaks to prevent fatigue. Once comfortable with individual fingers, move to the main typing test to integrate all fingers. Review your statistics regularly to identify weak areas. Consistency is more important than long practice sessions - daily practice yields better results than occasional marathon sessions."
    },
    {
        question: "Which fingers are responsible for which keys on the keyboard?",
        answer: "Each finger has specific keys assigned to it. Left pinky: Q, A, Z, Tab, Shift, Ctrl. Left ring: W, S, X. Left middle: E, D, C. Left index: R, T, F, G, V, B. Thumbs: Spacebar. Right index: Y, U, H, J, N, M. Right middle: I, K, comma. Right ring: O, L, period. Right pinky: P, semicolon, slash, Enter, Shift. Understanding these assignments is crucial for developing proper touch typing technique. NinjaType's Learn section lets you practice each finger individually to master these key assignments."
    },
    {
        question: "How can I improve my weakest fingers in touch typing?",
        answer: "NinjaType's finger-specific practice sessions are perfect for targeting weak fingers. The statistics for each finger show your WPM and accuracy, making it easy to identify which fingers need more work. Typically, the pinky and ring fingers are weakest because they're used less in daily activities. Practice those fingers individually with focused exercises, starting slowly and prioritizing accuracy. Gradually increase speed as muscle memory develops. The achievement badge system helps you set goals for each finger and track improvement over time."
    },
    {
        question: "Is it too late to learn touch typing as an adult?",
        answer: "It's never too late to learn touch typing! While children may pick it up faster, adults have the advantage of understanding the learning process and can be more disciplined in practice. Many professionals learn touch typing in their 30s, 40s, or even later and see significant productivity gains. The key is to commit to proper technique from the start, even if it means temporarily typing slower than your old hunt-and-peck method. NinjaType's systematic approach works for learners of all ages. Most adults who practice consistently see dramatic improvement within a month."
    },
    {
        question: "What mistakes should I avoid when learning touch typing?",
        answer: "Common mistakes include: looking at the keyboard (use the on-screen visualization instead), rushing speed before mastering accuracy, inconsistent finger placement, practicing with incorrect technique, skipping difficult keys or fingers, and practicing irregularly. Don't try to memorize key positions - focus on muscle memory through repetition. Avoid typing with flat hands; keep wrists elevated and fingers curved. Don't practice when tired, as bad habits form easily. Use NinjaType's finger-based lessons to ensure you're practicing correctly from the beginning. Remember: slow, accurate practice beats fast, error-prone practice."
    },
    {
        question: "How do I maintain proper posture while learning to type?",
        answer: "Proper posture prevents fatigue and injury during typing practice. Sit with your back straight and feet flat on the floor. Keep your elbows at a 90-degree angle with forearms parallel to the floor. Your wrists should hover slightly above the keyboard, not resting on it. Position your monitor at eye level about an arm's length away. Keep fingers curved and resting lightly on the home row when not typing. Take regular breaks to stretch your hands, wrists, and shoulders. Good posture combined with NinjaType's proper finger technique creates an ergonomic typing experience."
    },
    {
        question: "Can I unlearn bad typing habits with NinjaType?",
        answer: "Yes! Many people come to NinjaType with years of hunt-and-peck habits, and successfully retrain themselves. The process requires patience - you'll initially type slower with proper technique than with your old method. This is normal and temporary. Start with NinjaType's Learn section to build correct finger-to-key associations from scratch. Practice individual fingers to override old habits with new muscle memory. Commit to never looking at the keyboard, even when it feels slow. Within 2-4 weeks of consistent practice, proper technique will feel natural, and your speed will surpass your old method."
    },
    {
        question: "How do I track my touch typing improvement on NinjaType?",
        answer: "NinjaType provides comprehensive tracking for your learning journey. In the Learn section, each finger has individual statistics showing WPM and accuracy for that finger's practice sessions. Achievement badges mark your progress toward mastery. On the main typing page, your overall WPM and accuracy are tracked. The History page shows your complete typing test results over time with interactive charts, allowing you to see trends in your improvement. Filter by date ranges to see short-term and long-term progress. This multi-level tracking helps you identify both strengths and areas needing more practice."
    },
    {
        question: "What are the star ratings in the Learn section and how do I earn them?",
        answer: "Star ratings in NinjaType's Learn section represent achievement levels for each finger. As you practice individual fingers and improve your WPM and accuracy, you earn stars that indicate your mastery level. Stars are based on performance thresholds specific to each finger's key assignments. Earning stars provides clear milestones and motivation to continue practicing. The star system helps you see at a glance which fingers you've mastered and which need more work. Aim to earn stars for all fingers to ensure balanced touch typing skills across your entire hand."
    }
];
