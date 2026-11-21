/**
 * Swedish UI strings for the interactive typing app (Phase B).
 * These are the per-locale translations for all dynamic chrome:
 * toolbar, results, learn app, game modes (multiplayer + solo), etc.
 *
 * Keys are EXACT English strings (case, punctuation, spaces) as they appear
 * in tr(locale, en, de) call sites. Never invent keys; only add keys that
 * exist in the codebase.
 *
 * Audience: Swedish speakers (Sweden).
 * Metric: ord per minut (ord/minut) + tecken.
 * Avoid: "blindskrift" (means Braille), "skrivhastighet" alone (hardware write speeds).
 */

export default {
    // Learn app — header / intro
    "a little practice, a lasting skill": "lite träning, en varaktig färdighet",
    "Learn touch typing.": "Lär dig tangentbordsträning.",
    "Learn touch typing, one finger at a time.": "Lär dig tangentbordsträning, en finger i taget.",
    "Find your keys. Build a rhythm. Let muscle memory take over.": "Hitta dina tangenter. Bygg en rytm. Låt muskelminnet ta över.",

    // Learn app — progress tracking
    "your learning progress": "ditt lärande framsteg",
    "levels mastered": "nivåer behärskade",
    "TypeNinja unlocked. Keep refining your touch.": "TypeNinja olåst. Fortsätt förbättra din teknik.",
    "Small steps. Steadier hands.": "Små steg. Stabilare händer.",
    "your next step": "ditt nästa steg",
    "explore a lesson": "utforska en lektion",

    // Learn app — lesson selection
    "Level": "Nivå",
    "Practice again": "Öva igen",
    "Continue learning": "Fortsätt lära",
    "Start practicing": "Börja öva",
    "10 words": "10 ord",
    "stars + 95% accuracy to unlock": "stjärnor + 95 % noggrannhet för att låsa upp",
    "Preview finger placement": "Förhandsgranska fingerplacering",
    "practice keys": "övningstangenter",
    "home position": "hemställning",
    "Your practice path": "Din övningsväg",
    "Four finger pairs. Three focused levels each.": "Fyra fingerpar. Tre fokuserade nivåer vardera.",

    // Learn app — practice tips
    "Practice tips": "Övningstips",
    "Accuracy before speed.": "Noggrannhet före hastighet.",
    "Keep your eyes on the screen and let your fingers find their way.": "Håll ögonen på skärmen och låt fingrarna hitta vägen.",
    "Your progress saves automatically.": "Ditt framsteg sparas automatiskt.",
    "How star ratings work": "Hur stjärnor fungerar",
    "Read the star guide →": "Läs stjärnguiden →",
    "Each level awards up to 5 stars from your speed and accuracy. Reach 5 stars with 95% accuracy in one session to unlock the next level.": "Varje nivå ger upp till 5 stjärnor baserat på din hastighet och noggrannhet. Nå 5 stjärnor med 95 % noggrannhet i en session för att låsa upp nästa nivå.",
    "Manage learning progress": "Hantera lärande framsteg",

    // Learn app — keyboard/keys
    "Home keys": "Hemtangenter",
    "Key feedback view": "Tangentvyvy",
    "Key latency": "Tangentfördröjning",
    "keys": "tangenter",
    "Latency": "Fördröjning",
    "Per-key delay and errors": "Fördröjning per tangent och fel",
    "Slower keys glow brighter. Errors are marked on the key.": "Långsammare tangenter lyser starkare. Fel är markerade på tangenten.",
    "Review keys below": "Granska tangenter nedan",
    "Hover a key for details": "Hovra över en tangent för detaljer",

    // Finger names (these are set in fingerKeysSV.ts but referenced in UI)
    "finger": "finger",

    // Practice/test app — main controls
    "Practice": "Öva",
    "Test duration": "Testlängd",
    "Increase test length": "Öka testlängden",
    "Decrease test length": "Minska testlängden",
    "Longer": "Längre",
    "Shorter": "Kortare",
    "Typing exercise": "Skrivövning",
    "Typing practice input": "Skrivövning inmatning",
    "click to focus": "klicka för att fokusera",
    "Click here to continue": "Klicka här för att fortsätta",
    "Reset Sentence": "Återställ mening",
    "Word count": "Ordräkning",
    "words": "ord",
    "Words completed": "Ord slutförda",
    "Duration": "Varaktighet",
    "seconds": "sekunder",

    // Typing test results — speed/accuracy metrics
    "Speed": "Hastighet",
    "accuracy": "noggrannhet",
    "Accuracy": "Noggrannhet",
    "Errors": "Fel",
    "Session statistics": "Sessionsstatistik",
    "Session speed and accuracy": "Sessionshastighet och noggrannhet",
    "Typing speed over time": "Skrivhastighet över tid",
    "Raw speed and momentary pace across the test.": "Rå hastighet och momentan takt under testet.",
    "Session details": "Sessionsdetaljer",
    "This test:": "Det här testet:",
    "Correct speed": "Korrekt hastighet",
    "% of raw": "% av rå",
    "Characters / min": "Tecken / min",
    "Average key delay": "Genomsnittlig tangentfördröjning",

    // Results / full report
    "Full report": "Fullständig rapport",
    "Typing session results": "Resultat från skrivning session",
    "This attempt was too short to measure.": "Det här försöket var för kort för att mäta.",
    "This short attempt is a starting point. Try a full minute at a comfortable pace before drawing conclusions.": "Det här korta försöket är en utgångspunkt. Försök en full minut i en bekväm takt innan du drar slutsatser.",
    "You finished at 97% accuracy or better. Try Ghost Race against your saved pace, keeping accuracy ahead of finishing position.": "Du slutförde med 97 % noggrannhet eller bättre. Försök Ghost Race mot din sparade takt, håll noggrannheten framför mållinjen.",

    // Practice recommendations
    "Suggested next practice": "Föreslagen nästa övning",
    "What to practise next": "Vad ska man öva nästa",
    "Needs practice → steady": "Behöver öva → stabil",
    "Choose accuracy over a faster score": "Välj noggrannhet före snabbare poäng",
    "Slow down a touch": "Sakta ner lite",
    "Take your control into a pace challenge": "Ta din kontroll in i en taktkutning",
    "Try a one-minute test": "Försök ett enminuterstest",
    "Try Ghost Race": "Försök Ghost Race",
    "Build a longer baseline": "Bygg en längre baslinje",

    // Streak insights
    "Best streak": "Bästa serie",
    "Current streak": "Nuvarande serie",
    "Practice streak insights": "Insikter om övningsserier",
    "Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.": "Slutför ett test, lektion eller race varje dag för att bygga din serie. Framsteg sparas i denna webbläsare.",
    "You've practised today. Nicely done.": "Du har tränat idag. Bra gjort.",
    "Today's practice counts": "Dagens träning räknas",
    "Practised today": "Tränad idag",
    "Not practised yet today": "Inte tränad ännu idag",

    // Test modes / settings
    "Test mode": "Testläge",
    "Typing test settings": "Skrivtestinställningar",
    "All lessons": "Alla lektioner",
    "Choose a level": "Välj en nivå",
    "Finger lessons": "Fingerlektioner",
    "Finger level progress": "Fingernivaframsteg",
    "Motivate": "Motivera",
    "Coders": "Kodare",
    "Funny": "Rolig",
    "Quote set": "Citatserie",
    "Practise with these settings": "Öva med dessa inställningar",
    "First with these settings": "Först med dessa inställningar",

    // History / previous attempts
    "Review history": "Granska historik",
    "History": "Historik",
    "View history": "Visa historik",
    "Personal best": "Personligt bästa",
    "Previous typing attempt": "Tidigare skrivförsök",
    "Previous attempt": "Tidigare försök",
    "last attempt": "senaste försöket",
    "this level": "denna nivå",
    "this level's best": "denna nivås bästa",

    // All-time best
    "All-time best": "Bästa någonsin",
    "All-time best speed": "Bästa hastighet någonsin",

    // Learning guidance
    "A fresh level. Start with a light touch.": "En ny nivå. Börja med ett lätt tryck.",
    "Always come home.": "Kom alltid hem.",
    "let your fingers find the way": "låt fingrarna hitta vägen",
    "your home position": "din hemställning",

    // Ghost Race app
    "Ghost race": "Ghost Race",
    "Typing race": "Skrivrace",

    // Help/reference
    "Help": "Hjälp",
    "How to play a typing race with friends": "Hur man spelar ett skrivrace med vänner",
    "Learning navigation": "Lärnavigatör",

    // Multiplayer / lobby (these may use a different T() pattern in components, but included here)
    "or press": "eller tryck",

    // Footer / nav
    "Settings": "Inställningar",
    "Share result": "Dela resultat",
    "Share streak": "Dela serie",
    "About": "Om",
    "Terms of Service": "Användarvillkor",
    "Privacy Policy": "Integritetspolicy",
    "Advertise": "Annonsera",

    // Special cues and feedback
    "Clean": "Rent",
    "Clean run": "Ren körning",
    "Solid": "Solid",
    "Recommended": "Rekommenderad",

    // Keystroke / feedback labels
    "stars": "stjärnor",
    "stars this level": "stjärnor denna nivå",
    "level": "nivå",

    // Session modes / labels
    " · locked": " · låst",
    " · retake": " · gör om",

} as const;
