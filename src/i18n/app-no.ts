/**
 * Norwegian (Bokmål) UI strings for the interactive typing app (Phase B).
 * These are the per-locale translations for all dynamic chrome:
 * toolbar, results, learn app, game modes (multiplayer + solo), etc.
 *
 * Keys are EXACT English strings (case, punctuation, spaces) as they appear
 * in tr(locale, en, de) call sites. Never invent keys; only add keys that
 * exist in the codebase.
 *
 * Audience: Norwegian speakers (Bokmål).
 * Avoid: "blindskrift" (= Braille), "blindeskrift" — use "touch typing" (as-is),
 * "skrive blindt", or "10-fingersystemet" instead.
 *
 * Metric: ord per minutt (ord i minuttet) + tegn per minutt.
 */

export default {
    // Learn app — header / intro
    "a little practice, a lasting skill": "litt øvelse, en varig ferdighet",
    "Learn touch typing.": "Lær touch typing.",
    "Learn touch typing, one finger at a time.": "Lær touch typing, en finger om gangen.",
    "Find your keys. Build a rhythm. Let muscle memory take over.": "Finn tastene dine. Bygg en rytme. La muskelminnet ta over.",

    // Learn app — progress tracking
    "your learning progress": "ditt læringsframskritt",
    "levels mastered": "nivåer mestret",
    "TypeNinja unlocked. Keep refining your touch.": "TypeNinja låst opp. Fortsett med å finpusse teknikken.",
    "Small steps. Steadier hands.": "Små steg. Mer stabile hender.",
    "your next step": "ditt neste steg",
    "explore a lesson": "utforsk en leksjon",

    // Learn app — lesson selection
    "Level": "Nivå",
    "Practice again": "Øv igjen",
    "Continue learning": "Fortsett å lære",
    "Start practicing": "Begynn å øve",
    "10 words": "10 ord",
    "stars + 95% accuracy to unlock": "stjerner + 95 % nøyaktighet for å låse opp",
    "Preview finger placement": "Forhåndsvisning av fingerplassering",
    "practice keys": "øvingstaster",
    "home position": "grunnstilling",
    "Your practice path": "Din øvingsvei",
    "Four finger pairs. Three focused levels each.": "Fire fingerpar. Tre fokuserte nivåer hver.",

    // Learn app — practice tips
    "Practice tips": "Øvingstips",
    "Accuracy before speed.": "Nøyaktighet før hastighet.",
    "Keep your eyes on the screen and let your fingers find their way.": "Hold øynene på skjermen og la fingrene finne sin vei.",
    "Your progress saves automatically.": "Framskrittet lagres automatisk.",
    "How star ratings work": "Hvordan stjernebedømminger fungerer",
    "Read the star guide →": "Les stjerneveiviseren →",
    "Each level awards up to 5 stars from your speed and accuracy. Reach 5 stars with 95% accuracy in one session to unlock the next level.": "Hvert nivå gir opptil 5 stjerner fra hastigheten og nøyaktigheten din. Oppnå 5 stjerner med 95 % nøyaktighet i en session for å låse opp neste nivå.",
    "Manage learning progress": "Administrer læringsframskritt",

    // Learn app — keyboard/keys
    "Home keys": "Grunnstillingtaster",
    "Key feedback view": "Tasteretromelding",
    "Key latency": "Tasterforsinkelse",
    "keys": "taster",
    "Latency": "Forsinkelse",
    "Per-key delay and errors": "Forsinkelse per tast og feil",
    "Slower keys glow brighter. Errors are marked on the key.": "Langsommere taster lyser sterkere. Feil er merket på tasten.",
    "Review keys below": "Gjennomgå taster nedenfor",
    "Hover a key for details": "Hold musepekeren over en tast for detaljer",

    // Finger names (these are set in fingerKeysNO.ts but referenced in UI)
    "finger": "finger",

    // Practice/test app — main controls
    "Practice": "Øving",
    "Test duration": "Testvaraktighet",
    "Increase test length": "Øk testlengde",
    "Decrease test length": "Reduser testlengde",
    "Longer": "Lengre",
    "Shorter": "Kortere",
    "Typing exercise": "Skrivøving",
    "Typing practice input": "Inndata for skrivøving",
    "click to focus": "klikk for å fokusere",
    "Click here to continue": "Klikk her for å fortsette",
    "Reset Sentence": "Tilbakestill setning",
    "Word count": "Ordtelling",
    "words": "ord",
    "Words completed": "Ord fullført",
    "Duration": "Varighet",
    "seconds": "sekunder",

    // Typing test results — speed/accuracy metrics
    "Speed": "Hastighet",
    "accuracy": "nøyaktighet",
    "Accuracy": "Nøyaktighet",
    "Errors": "Feil",
    "Session statistics": "Sessionsstatistikk",
    "Session speed and accuracy": "Sessionshastighet og nøyaktighet",
    "Typing speed over time": "Skrivehastighet over tid",
    "Raw speed and momentary pace across the test.": "Råhastighet og momentan hastighet gjennom testen.",
    "Session details": "Sessionsdetaljer",
    "This test:": "Denne testen:",
    "Correct speed": "Korrekt hastighet",
    "% of raw": "% av råhastighet",
    "Characters / min": "Tegn / min",
    "Average key delay": "Gjennomsnittlig tasterforsinkelse",

    // Results / full report
    "Full report": "Fullstendig rapport",
    "Typing session results": "Resultater fra skriveøkten",
    "This attempt was too short to measure.": "Denne forsøken var for kort til å måle.",
    "This short attempt is a starting point. Try a full minute at a comfortable pace before drawing conclusions.": "Denne korte forsøken er et startpunkt. Prøv en full minutt i komfortabel hastighet før du trekker konklusjoner.",
    "You finished at 97% accuracy or better. Try Ghost Race against your saved pace, keeping accuracy ahead of finishing position.": "Du avsluttet med 97 % nøyaktighet eller bedre. Prøv Ghost Race mot din lagrede hastighet, og prioriter nøyaktighet over målgang.",

    // Practice recommendations
    "Suggested next practice": "Foreslått neste øving",
    "What to practise next": "Hva du skal øve på neste",
    "Needs practice → steady": "Trenger øving → stabil",
    "Choose accuracy over a faster score": "Velg nøyaktighet fremfor raskere poengsum",
    "Slow down a touch": "Sakk ned litt",
    "Take your control into a pace challenge": "Ta kontrollen inn i en hastighetsutfordring",
    "Try a one-minute test": "Prøv en énminutters test",
    "Try Ghost Race": "Prøv Ghost Race",
    "Build a longer baseline": "Bygg et lengre grunnlag",

    // Streak insights
    "Best streak": "Beste streak",
    "Current streak": "Nåværende streak",
    "Practice streak insights": "Innsikt om øvingsstreak",
    "Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.": "Fullført en test, leksjon eller race hver dag for å bygge din streak. Framskritt lagres i denne nettleseren.",
    "You've practised today. Nicely done.": "Du har øvd i dag. Bra jobbet.",
    "Today's practice counts": "Dagens øving teller",
    "Practised today": "Øvd i dag",
    "Not practised yet today": "Ikke øvd ennå i dag",

    // Test modes / settings
    "Test mode": "Testmodus",
    "Typing test settings": "Skrivtestinnstillinger",
    "All lessons": "Alle leksjoner",
    "Choose a level": "Velg et nivå",
    "Finger lessons": "Fingerleksjoner",
    "Finger level progress": "Framskritt for fingernivå",
    "Motivate": "Motivere",
    "Coders": "Programmørere",
    "Funny": "Morsomt",
    "Quote set": "Sitatsett",
    "Practise with these settings": "Øv med disse innstillingene",
    "First with these settings": "Først med disse innstillingene",

    // History / previous attempts
    "Review history": "Gjennomgå historikk",
    "History": "Historikk",
    "View history": "Vis historikk",
    "Personal best": "Personlig rekord",
    "Previous typing attempt": "Tidligere skriveforsøk",
    "Previous attempt": "Tidligere forsøk",
    "last attempt": "siste forsøk",
    "this level": "dette nivået",
    "this level's best": "dette nivåets beste",

    // All-time best
    "All-time best": "Beste noen gang",
    "All-time best speed": "Beste hastighet noen gang",

    // Learning guidance
    "A fresh level. Start with a light touch.": "Et nytt nivå. Start med lett trykk.",
    "Always come home.": "Kom alltid hjem.",
    "let your fingers find the way": "la fingrene finne veien",
    "your home position": "din grunnstilling",

    // Ghost Race app
    "Ghost race": "Ghost Race",
    "Typing race": "Skriverace",

    // Help/reference
    "Help": "Hjelp",
    "How to play a typing race with friends": "Hvordan spille et skriverace med venner",
    "Learning navigation": "Læringsnavigasjon",

    // Multiplayer / lobby (these may use a different T() pattern in components, but included here)
    "or press": "eller trykk",

    // Footer / nav
    "Settings": "Innstillinger",
    "Share result": "Del resultat",
    "Share streak": "Del streak",
    "About": "Om",
    "Terms of Service": "Vilkår for tjeneste",
    "Privacy Policy": "Personvernregler",
    "Advertise": "Annonsere",

    // Special cues and feedback
    "Clean": "Rent",
    "Clean run": "Rein kjøring",
    "Solid": "Solid",
    "Recommended": "Anbefalt",

    // Keystroke / feedback labels
    "stars": "stjerner",
    "stars this level": "stjerner på dette nivået",
    "level": "nivå",

    // Session modes / labels
    " · locked": " · låst",
    " · retake": " · omgjør",

} as const;
