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
    }
];
