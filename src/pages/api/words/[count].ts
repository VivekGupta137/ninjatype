import type { APIRoute } from "astro";
import words1k from "@/data/words-1k.json";
import wordsDe1k from "@/data/words-de-1k.json";
import wordsFr1k from "@/data/words-fr-1k.json";
import wordsIt1k from "@/data/words-it-1k.json";
import wordsNl1k from "@/data/words-nl-1k.json";
import wordsNo1k from "@/data/words-no-1k.json";
import wordsDa1k from "@/data/words-da-1k.json";
import wordsSv1k from "@/data/words-sv-1k.json";
import wordsJa1k from "@/data/words-ja-1k.json";
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
            params: { count: "de-1k" },
            props: {
                source: wordsDe1k,
                extraProps: {
                    type: "wordlist",
                    description:
                        "Die häufigsten deutschen Wörter — Leipzig Wortschatz-Korpus.",
                    length: wordsDe1k.words.length,
                },
            },
        },
        {
            params: { count: "fr-1k" },
            props: {
                source: wordsFr1k,
                extraProps: {
                    type: "wordlist",
                    description: "Les mots français les plus fréquents — corpus Leipzig Wortschatz.",
                    length: wordsFr1k.words.length,
                },
            },
        },
        {
            params: { count: "it-1k" },
            props: {
                source: wordsIt1k,
                extraProps: {
                    type: "wordlist",
                    description: "Le parole italiane più frequenti — corpus Leipzig Wortschatz.",
                    length: wordsIt1k.words.length,
                },
            },
        },
        {
            params: { count: "nl-1k" },
            props: {
                source: wordsNl1k,
                extraProps: {
                    type: "wordlist",
                    description: "De meest voorkomende Nederlandse woorden — Leipzig Wortschatz-corpus.",
                    length: wordsNl1k.words.length,
                },
            },
        },
        {
            params: { count: "no-1k" },
            props: {
                source: wordsNo1k,
                extraProps: {
                    type: "wordlist",
                    description: "De vanligste norske ordene (bokmål) — Leipzig Wortschatz-korpus.",
                    length: wordsNo1k.words.length,
                },
            },
        },
        {
            params: { count: "da-1k" },
            props: {
                source: wordsDa1k,
                extraProps: {
                    type: "wordlist",
                    description: "Almindelige danske ord.",
                    length: wordsDa1k.words.length,
                },
            },
        },
        {
            params: { count: "sv-1k" },
            props: {
                source: wordsSv1k,
                extraProps: {
                    type: "wordlist",
                    description: "De vanligaste svenska orden — Leipzig Wortschatz-korpus.",
                    length: wordsSv1k.words.length,
                },
            },
        },
        {
            params: { count: "ja-1k" },
            props: {
                source: wordsJa1k,
                extraProps: {
                    type: "wordlist",
                    description: "よく使われる日本語のローマ字 (romaji) の単語。",
                    length: wordsJa1k.words.length,
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
