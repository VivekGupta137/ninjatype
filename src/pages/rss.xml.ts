import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getBlogPosts } from "@/lib/blog";

export async function GET(context: APIContext) {
    const blogPosts = await getBlogPosts();

    // Core content items
    const contentItems = [
        {
            title: "NinjaType - Free Online Typing Test",
            link: "/",
            description:
                "Improve your typing speed and accuracy with NinjaType. A minimalist, distraction-free typing interface with real-time WPM tracking, performance analytics, and customizable themes.",
            pubDate: new Date("2026-03-19"),
        },
        {
            title: "NinjaType Hacker Typer — Hollywood Cyber Terminal Simulator",
            link: "/hacker-typer",
            description:
                "Interactive Hollywood cyber terminal simulator. Stream real Linux kernel code, track network topology, and simulate payload injection with Access Granted override.",
            pubDate: new Date("2026-10-07"),
        },
        {
            title: "Ghost Race - Beat Your Best Typing Pace",
            link: "/ghost-race/",
            description:
                "Race a ghost of your best saved typing pace. Track your WPM, accuracy, and progress, then set a new personal best.",
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
        ...blogPosts.map((post) => ({
            title: post.title,
            link: post.url,
            description: post.description,
            pubDate: new Date(post.publishDate),
        })),
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
