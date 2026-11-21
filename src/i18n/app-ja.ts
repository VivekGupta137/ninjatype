/**
 * Japanese UI strings for the interactive typing app (Phase B).
 * These are the per-locale translations for all dynamic chrome:
 * toolbar, results, learn app, game modes (multiplayer + solo), etc.
 *
 * Keys are EXACT English strings (case, punctuation, spaces) as they appear
 * in tr(locale, en, de) call sites. Never invent keys; only add keys that
 * exist in the codebase.
 *
 * Audience: Japanese speakers; romaji input (latin letter typing).
 * Metric: KPM（キーストローク・パー・ミニット）+ 文字/秒 first, WPM secondary.
 */

export default {
    // Learn app — header / intro
    "a little practice, a lasting skill": "少しの練習が、長く続く力になる",
    "Learn touch typing.": "タイピング練習をしよう。",
    "Learn touch typing, one finger at a time.": "一本の指から始めるタイピング練習。",
    "Find your keys. Build a rhythm. Let muscle memory take over.": "キーの位置を探す。リズムをつくる。筋肉の記憶に任せる。",

    // Learn app — progress tracking
    "your learning progress": "あなたの練習の進捗",
    "levels mastered": "マスターしたレベル",
    "TypeNinja unlocked. Keep refining your touch.": "TypeNinja ロック解除。タイピング技術を磨き続けよう。",
    "Small steps. Steadier hands.": "小さな一歩。安定した手。",
    "your next step": "あなたの次のステップ",
    "explore a lesson": "レッスンを探す",

    // Learn app — lesson selection
    "Level": "レベル",
    "Practice again": "もう一度練習する",
    "Continue learning": "学習を続ける",
    "Start practicing": "練習を始める",
    "10 words": "10 語",
    "stars + 95% accuracy to unlock": "星 + 95% の正確さでロック解除",
    "Preview finger placement": "指の配置をプレビュー",
    "practice keys": "練習用キー",
    "home position": "ホームポジション",
    "Your practice path": "あなたの練習パス",
    "Four finger pairs. Three focused levels each.": "4 つの指のペア。各 3 つの集中レベル。",

    // Learn app — practice tips
    "Practice tips": "練習のコツ",
    "Accuracy before speed.": "速さより正確さ。",
    "Keep your eyes on the screen and let your fingers find their way.": "画面から目を離さず、指に任せる。",
    "Your progress saves automatically.": "進捗は自動保存されます。",
    "How star ratings work": "星評価の仕組み",
    "Read the star guide →": "星ガイドを読む →",
    "Each level awards up to 5 stars from your speed and accuracy. Reach 5 stars with 95% accuracy in one session to unlock the next level.": "各レベルは、速度と正確さから最大 5 つの星を授与します。1 つのセッションで 95% の正確さで 5 つの星に到達して、次のレベルをロック解除します。",
    "Manage learning progress": "学習進度を管理する",

    // Learn app — keyboard/keys
    "Home keys": "ホームキー",
    "Key feedback view": "キーフィードバックビュー",
    "Key latency": "キー遅延",
    "keys": "キー",
    "Latency": "遅延",
    "Per-key delay and errors": "キーごとの遅延とエラー",
    "Slower keys glow brighter. Errors are marked on the key.": "遅いキーはより明るく輝きます。エラーはキーに表示されます。",
    "Review keys below": "下のキーを確認",
    "Hover a key for details": "詳細はキーにマウスを置く",

    // Finger names (these are set in fingerKeysJA.ts but referenced in UI)
    "finger": "指",

    // Practice/test app — main controls
    "Practice": "練習",
    "Test duration": "テスト期間",
    "Increase test length": "テスト時間を増やす",
    "Decrease test length": "テスト時間を減らす",
    "Longer": "もっと長い",
    "Shorter": "もっと短い",
    "Typing exercise": "タイピング演習",
    "Typing practice input": "タイピング練習入力",
    "click to focus": "クリックしてフォーカス",
    "Click here to continue": "ここをクリックして続ける",
    "Reset Sentence": "文をリセット",
    "Word count": "単語数",
    "words": "語",
    "Words completed": "完了した単語",
    "Duration": "期間",
    "seconds": "秒",

    // Typing test results — speed/accuracy metrics
    "Speed": "速度",
    "accuracy": "正確さ",
    "Accuracy": "正確さ",
    "Errors": "エラー",
    "Session statistics": "セッション統計",
    "Session speed and accuracy": "セッション速度と正確さ",
    "Typing speed over time": "経時的なタイピング速度",
    "Raw speed and momentary pace across the test.": "テスト全体での生速度と瞬間ペース。",
    "Session details": "セッション詳細",
    "This test:": "このテスト:",
    "Correct speed": "正しい速度",
    "% of raw": "生の % ",
    "Characters / min": "文字/分",
    "Average key delay": "平均キー遅延",

    // Results / full report
    "Full report": "完全なレポート",
    "Typing session results": "タイピングセッションの結果",
    "This attempt was too short to measure.": "この試行は測定するには短すぎます。",
    "This short attempt is a starting point. Try a full minute at a comfortable pace before drawing conclusions.": "この短い試行は開始点です。結論を出す前に、快適なペースで 1 分間実行してください。",
    "You finished at 97% accuracy or better. Try Ghost Race against your saved pace, keeping accuracy ahead of finishing position.": "97% 以上の正確さで終了しました。Ghost Race で保存されたペースを試して、正確さを終了位置より前に保つ。",

    // Practice recommendations
    "Suggested next practice": "推奨される次の練習",
    "What to practise next": "次に練習するべきこと",
    "Needs practice → steady": "練習が必要→安定",
    "Choose accuracy over a faster score": "より速いスコアより正確さを選ぶ",
    "Slow down a touch": "少し遅くする",
    "Take your control into a pace challenge": "ペースチャレンジでコントロール",
    "Try a one-minute test": "1 分テストを試す",
    "Try Ghost Race": "Ghost Race を試す",
    "Build a longer baseline": "長いベースラインを構築",

    // Streak insights
    "Best streak": "最高ストリーク",
    "Current streak": "現在のストリーク",
    "Practice streak insights": "練習ストリークの洞察",
    "Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.": "毎日テスト、レッスン、またはレースを完了してストリークを構築します。進捗はこのブラウザに保存されます。",
    "You've practised today. Nicely done.": "今日は練習しました。よくできました。",
    "Today's practice counts": "今日の練習がカウント",
    "Practised today": "今日練習した",
    "Not practised yet today": "今日はまだ練習していない",

    // Test modes / settings
    "Test mode": "テストモード",
    "Typing test settings": "タイピングテスト設定",
    "All lessons": "すべてのレッスン",
    "Choose a level": "レベルを選ぶ",
    "Finger lessons": "指別レッスン",
    "Finger level progress": "指別レベルの進捗",
    "Motivate": "やる気を出す",
    "Coders": "プログラマー",
    "Funny": "面白い",
    "Quote set": "引用セット",
    "Practise with these settings": "これらの設定で練習する",
    "First with these settings": "これらの設定で初めて",

    // History / previous attempts
    "Review history": "履歴を確認",
    "History": "履歴",
    "View history": "履歴を表示",
    "Personal best": "個人最高記録",
    "Previous typing attempt": "前回のタイピング試行",
    "Previous attempt": "前回の試行",
    "last attempt": "最後の試行",
    "this level": "このレベル",
    "this level's best": "このレベルの最高記録",

    // All-time best
    "All-time best": "過去最高",
    "All-time best speed": "過去最高速度",

    // Learning guidance
    "A fresh level. Start with a light touch.": "新しいレベル。やさしく始めましょう。",
    "Always come home.": "いつもホームに戻る。",
    "let your fingers find the way": "指に道を見つけさせる",
    "your home position": "あなたのホームポジション",

    // Ghost Race app
    "Ghost race": "ゴーストレース",
    "Typing race": "タイピングレース",

    // Help/reference
    "Help": "ヘルプ",
    "How to play a typing race with friends": "友人とタイピングレースをプレイする方法",
    "Learning navigation": "学習ナビゲーション",

    // Multiplayer / lobby
    "or press": "またはを押す",

    // Footer / nav
    "Settings": "設定",
    "Share result": "結果を共有",
    "Share streak": "ストリークを共有",
    "About": "について",
    "Terms of Service": "利用規約",
    "Privacy Policy": "プライバシーポリシー",
    "Advertise": "広告",

    // Special cues and feedback
    "Clean": "クリーン",
    "Clean run": "クリーンな実行",
    "Solid": "しっかりした",
    "Recommended": "推奨",

    // Keystroke / feedback labels
    "stars": "星",
    "stars this level": "このレベルの星",
    "level": "レベル",

    // Session modes / labels
    " · locked": " · ロック",
    " · retake": " · もう一度",

} as const;
