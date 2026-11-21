/**
 * Japanese UI strings for the /ja/ content tree (Phase B).
 * The interactive typing app is now fully localized for Japanese.
 * Strings cover the localized marketing pages, blog shell, legal footer, and full app chrome.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * (タイピング練習 is the highest-volume keyword; KPM is the native metric).
 */
export const ja = {
    brand: "Ninja Type",
    tagline: "タイピング練習、静かに、はかどる",
    /** Phase B: app chrome is fully Japanese. */
    appLanguageNote: "練習アプリとレッスンは完全に日本語です。ローマ字入力で練習できます。",
    nav: {
        test: "タイピングテスト",
        learn: "タイピング練習",
        blog: "ブログ",
        startTest: "テストを始める",
    },
    footer: {
        heading: "落ち着いてタイピング練習ができる場所。",
        explore: "見てみる",
        legal: "法務",
        privacy: "プライバシー",
        terms: "利用規約",
        about: "NinjaTypeについて",
        links: [
            { label: "タイピングテスト", href: "/ja/typing-test/" },
            { label: "タイピング練習", href: "/ja/typing-practice/" },
            { label: "比較ページ", href: "/ja/lp/e-typing-alternative/" },
            { label: "ブログ", href: "/ja/blog/" },
        ],
        appLinks: [
            { label: "タイピングテスト", href: "/ja/typing-test/" },
            { label: "タイピング練習（指別レッスン）", href: "/ja/typing-practice/" },
            { label: "対戦型タイピングゲーム", href: "/ja/taisen-taipingu/" },
            { label: "タイピングゲーム（ゴーストレース）", href: "/ja/taipingu-geemu/" },
        ],
        finePrint:
            "NinjaTypeは独立したサービスで、ここで言及されるサービスとは提携関係にありません。その他の製品名はそれぞれの所有者に帰属します。",
    },
    blog: {
        indexTitle: "NinjaType日本語ブログ — タイピング速度・練習・ガイド",
        indexDescription:
            "タイピング速度測定から実践的な練習方法まで完全ガイド：日本での平均速度の目安、初心者向けレッスン、毎日10分で上達するメニュー、WPMとKPMの正しい違い、ローマ字入力の練習法について、わかりやすく解説。",
        indexHeading: "正しい方法で<br />タイピングを上達させる。",
        indexIntro:
            "日本語ガイド：速度を測る、正しく練習する、正直に比較する。KPMとWPMの違いもここから。",
        practiceNote: "ガイドの内容をすぐ実践する。",
        practiceTestCta: "タイピングテストを始める",
        practiceLearnCta: "レッスンを開く",
        readMore: "ガイドを読む",
        allPosts: "すべてのガイド",
        publishedOn: "公開",
        updatedOn: "更新",
        backToBlog: "ブログに戻る",
        relatedTitle: "あわせて読みたい",
    },
};
