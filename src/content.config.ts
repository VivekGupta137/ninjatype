// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

// 3. Define your collection(s)
const content = defineCollection({
    loader: glob({
        pattern: "*.(md|mdx)",
        base: "./src/content/",
    }),
    schema: z.object({
        title: z.string(),
    }),
});

const hackerBlog = defineCollection({
    loader: glob({
        pattern: "*.(md|mdx)",
        base: "./src/content/hacker-blog/",
    }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        author: z.string().default("NinjaType Cyber Lab"),
        tags: z.array(z.string()).default([]),
        readTime: z.string().default("5 min read"),
        image: z.string().default("/images/og-image.png"),
        featured: z.boolean().default(false),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { content, hackerBlog };
