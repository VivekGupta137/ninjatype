// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

// 3. Define your collection(s)
const content = defineCollection({
    loader: glob({
        pattern: "**/*.(md|mdx)",
        base: "./src/content/",
    }),
    schema: z.object({
        title: z.string(),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { content };
