import type { APIRoute } from "astro";
import words1k from "@/data/words-1k.json";
import words2kShort from "@/data/words-2k-short.json";
import words2kLong from "@/data/words-2k-long.json";
import words5kMed from "@/data/words-5k-med.json";
import words5k from "@/data/words-5k.json";
import motivationalQuotes from "@/data/motivational-quotes.json";
import brainrot from "@/data/brainrot.json";
import programmingQuotes from "@/data/programming-quotes.json";
import funnyQuotes from "@/data/funny-quotes.json";

export const GET: APIRoute = async ({ props }) => {
    return new Response(
        JSON.stringify({
            ...props.extraProps,
            ...props.source,
        }),
        {
            status: 200,
        }
    );
};

export function getStaticPaths() {
    return [
        {
            params: { count: "1k" },
            props: {
                source: words1k,
                extraProps: {
                    type: "wordlist",
                    description:
                        "A list of the 1000 most common English words.",
                    length: words1k.words.length,
                },
            },
        },
        {
            params: { count: "5k" },
            props: {
                source: words5k,
                extraProps: {
                    type: "wordlist",
                    description:
                        "A list of the 5000 most common English words.",
                    length: words5k.words.length,
                },
            },
        },
        {
            params: { count: "2k-short" },
            props: {
                source: words2kShort,
                extraProps: {
                    type: "wordlist",
                    description:
                        "A list of the 2000 most common English words (shortened).",
                    length: words2kShort.words.length,
                },
            },
        },
        {
            params: { count: "2k-long" },
            props: {
                source: words2kLong,
                extraProps: {
                    type: "wordlist",
                    description:
                        "A list of the 2000 most common English words (expanded).",
                    length: words2kLong.words.length,
                },
            },
        },
        {
            params: { count: "5k-medium" },
            props: {
                source: words5kMed,
                extraProps: {
                    type: "wordlist",
                    description:
                        "A list of the 5000 most common English words (medium length).",

                    length: words5kMed.words.length,
                },
            },
        },
        {
            params: { count: "motivational-quotes" },
            props: {
                source: motivationalQuotes,
                extraProps: {
                    type: "quotelist",
                    description: "A collection of motivational quotes.",
                    length: motivationalQuotes.quotes.length,
                },
            },
        },
        {
            params: { count: "programming-quotes" },
            props: {
                source: programmingQuotes,
                extraProps: {
                    type: "quotelist",
                    description: "A collection of programming quotes.",
                    length: programmingQuotes.quotes.length,
                },
            },
        },
        {
            params: { count: "funny-quotes" },
            props: {
                source: funnyQuotes,
                extraProps: {
                    type: "quotelist",
                    description: "A collection of funny quotes.",
                    length: funnyQuotes.quotes.length,
                },
            },
        },
        {
            params: { count: "brainrot" },
            props: {
                source: brainrot,
                extraProps: {
                    type: "wordlist",
                    description: "A collection of brainrot meme words.",
                    length: brainrot.words.length,
                },
            },
        },
    ];
}
