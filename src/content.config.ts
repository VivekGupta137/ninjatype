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
        updatedDate: z.string().optional(),
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

const blog = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Typing practice'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogDe = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-de/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Tipptraining'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogFr = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-fr/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Dactylographie'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogJa = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-ja/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('タイピング練習'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogNl = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-nl/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Typevaardigheid'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogIt = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-it/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Dattilografia'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogSv = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-sv/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Tangentbordsträning'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogDa = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-da/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Maskinskrivning'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

const blogNo = defineCollection({
    loader: glob({ pattern: '*.(md|mdx)', base: './src/content/blog-no/' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string(),
        modifiedDate: z.string().optional(),
        category: z.string().default('Skrivetrening'),
        app: z.enum(['practice', 'learn', 'multiplayer', 'ghost-race', 'hacker-typer']).default('practice'),
        author: z.string().default('NinjaType'),
        readTime: z.string().default('5 min read'),
        image: z.string().default('/images/og-image.png'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
    }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { content, hackerBlog, blog, blogDe, blogFr, blogJa, blogNl, blogIt, blogSv, blogDa, blogNo };
