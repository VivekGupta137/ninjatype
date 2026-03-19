import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
    // Get all content items (this can be expanded when you add blog posts)
    const contentItems = [
        {
            title: "NinjaType - Free Online Typing Test",
            link: "/",
            description:
                "Improve your typing speed and accuracy with NinjaType. A minimalist, distraction-free typing interface with real-time WPM tracking, performance analytics, and customizable themes.",
            pubDate: new Date("2026-03-19"),
        },
        {
            title: "Online Typing Race - Live Rank, WPM, Accuracy & Results",
            link: "/online",
            description:
                "Practice on NinjaType Online mode with live typing race analytics, real-time rank updates, WPM tracking, accuracy insights, and penalty-adjusted finish times.",
            pubDate: new Date("2026-03-19"),
        },
        {
            title: "Learn Touch Typing Free - Progressive Typing Lessons",
            link: "/learn",
            description:
                "Learn touch typing for free with NinjaType's progressive lessons. Practice each finger individually, improve typing speed and accuracy, and master proper keyboard technique.",
            pubDate: new Date("2024-01-01"),
        },
        {
            title: "Typing Speed History - Track Your WPM Progress",
            link: "/history",
            description:
                "Track your typing speed history and WPM progress with detailed statistics and charts. View lifetime best scores, daily records, and accuracy trends.",
            pubDate: new Date("2026-03-19"),
        },
        {
            title: "About NinjaType",
            link: "/about",
            description:
                "Learn about NinjaType, a free online typing test and speed practice platform. No registration required.",
            pubDate: new Date("2026-03-19"),
        },
    ];

    return rss({
        title: "NinjaType - Typing Practice Updates",
        description:
            "Latest updates and features from NinjaType - Free online typing test and speed practice platform",
        site: context.site?.toString() || "https://ninjatype.com",
        items: contentItems.map((item) => ({
            title: item.title,
            pubDate: item.pubDate,
            description: item.description,
            link: item.link,
        })),
        customData: `<language>en-us</language>`,
        stylesheet: "/rss/styles.xsl",
    });
}
