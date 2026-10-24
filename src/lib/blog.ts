import { getCollection } from 'astro:content';

/** Existing Hacker Typer articles keep their canonical URLs in the shared index. */
export async function getBlogPosts() {
    const [posts, hackerPosts] = await Promise.all([getCollection('blog'), getCollection('hackerBlog')]);
    return [
        ...posts.map(post => ({ ...post.data, id: post.id, url: `/blog/${post.id}/` })),
        ...hackerPosts.map(post => ({ ...post.data, id: post.id, app: 'hacker-typer' as const, category: 'Hacker Typer', url: `/hacker-typer/blog/${post.id}/` })),
    ].sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate));
}
