/**
 * French UI strings for the interactive typing app (Phase B).
 * These are the per-locale translations for all dynamic chrome:
 * toolbar, results, learn app, game modes (multiplayer + solo), etc.
 *
 * Keys are EXACT English strings (case, punctuation, spaces) as they appear
 * in tr(locale, en, de) call sites. Never invent keys; only add keys that
 * exist in the codebase.
 *
 * Audience: French speakers (FR, Belgium, Switzerland French region).
 * Avoid contaminated terms (see AGENTS.md §3.4): « vitesse de frappe » alone
 * (football), « jeux de frappe » alone (mixed intent). Use AZERTY terminology
 * where appropriate.
 *
 * Metric: mots/minute (mots par minute) + caractères.
 */

export default {
    // Learn app — header / intro
    "a little practice, a lasting skill": "un peu de pratique, une compétence durable",
    "Learn touch typing.": "Apprendre la dactylographie.",
    "Learn touch typing, one finger at a time.": "Apprendre la dactylographie, un doigt à la fois.",
    "Find your keys. Build a rhythm. Let muscle memory take over.": "Trouve tes touches. Construis un rythme. Laisse la mémoire musculaire prendre le relais.",

    // Learn app — progress tracking
    "your learning progress": "ton progrès d'apprentissage",
    "levels mastered": "niveaux maîtrisés",
    "TypeNinja unlocked. Keep refining your touch.": "TypeNinja débloqué. Affine ta technique.",
    "Small steps. Steadier hands.": "Petits pas. Mains plus stables.",
    "your next step": "ton prochain pas",
    "explore a lesson": "explorer une leçon",

    // Learn app — lesson selection
    "Level": "Niveau",
    "Practice again": "Réentraîne-toi",
    "Continue learning": "Poursuis l'apprentissage",
    "Start practicing": "Commence à t'entraîner",
    "10 words": "10 mots",
    "stars + 95% accuracy to unlock": "étoiles + 95 % de précision pour déverrouiller",
    "Preview finger placement": "Aperçu du positionnement des doigts",
    "practice keys": "touches d'entraînement",
    "home position": "position de base",
    "Your practice path": "Ton parcours d'entraînement",
    "Four finger pairs. Three focused levels each.": "Quatre paires de doigts. Trois niveaux ciblés chacun.",

    // Learn app — practice tips
    "Practice tips": "Conseils d'entraînement",
    "Accuracy before speed.": "Précision avant la vitesse.",
    "Keep your eyes on the screen and let your fingers find their way.": "Garde les yeux sur l'écran et laisse tes doigts trouver leur chemin.",
    "Your progress saves automatically.": "Ton progrès est enregistré automatiquement.",
    "How star ratings work": "Comment fonctionnent les évaluations par étoiles",
    "Read the star guide →": "Lire le guide des étoiles →",
    "Each level awards up to 5 stars from your speed and accuracy. Reach 5 stars with 95% accuracy in one session to unlock the next level.": "Chaque niveau récompense jusqu'à 5 étoiles selon ta vitesse et ta précision. Atteins 5 étoiles avec 95 % de précision en une session pour déverrouiller le niveau suivant.",
    "Manage learning progress": "Gérer le progrès d'apprentissage",

    // Learn app — keyboard/keys
    "Home keys": "Touches de base",
    "Key feedback view": "Vue de retour d'information sur les touches",
    "Key latency": "Latence des touches",
    "keys": "touches",
    "Latency": "Latence",
    "Per-key delay and errors": "Délai par touche et erreurs",
    "Slower keys glow brighter. Errors are marked on the key.": "Les touches plus lentes brillent davantage. Les erreurs sont marquées sur la touche.",
    "Review keys below": "Examine les touches ci-dessous",
    "Hover a key for details": "Survole une touche pour plus de détails",

    // Finger names (these are set in fingerKeysFR.ts but referenced in UI)
    "finger": "doigt",

    // Practice/test app — main controls
    "Practice": "Entraînement",
    "Test duration": "Durée du test",
    "Increase test length": "Augmenter la durée du test",
    "Decrease test length": "Réduire la durée du test",
    "Longer": "Plus long",
    "Shorter": "Plus court",
    "Typing exercise": "Exercice de dactylographie",
    "Typing practice input": "Entrée de pratique de dactylographie",
    "click to focus": "cliquer pour se concentrer",
    "Click here to continue": "Clique ici pour continuer",
    "Reset Sentence": "Réinitialiser la phrase",
    "Word count": "Compte des mots",
    "words": "mots",
    "Words completed": "Mots complétés",
    "Duration": "Durée",
    "seconds": "secondes",

    // Typing test results — speed/accuracy metrics
    "Speed": "Vitesse",
    "accuracy": "précision",
    "Accuracy": "Précision",
    "Errors": "Erreurs",
    "Session statistics": "Statistiques de session",
    "Session speed and accuracy": "Vitesse et précision de la session",
    "Typing speed over time": "Vitesse de dactylographie au fil du temps",
    "Raw speed and momentary pace across the test.": "Vitesse brute et allure momentanée au fil du test.",
    "Session details": "Détails de la session",
    "This test:": "Ce test :",
    "Correct speed": "Vitesse correcte",
    "% of raw": "% de la vitesse brute",
    "Characters / min": "Caractères / min",
    "Average key delay": "Délai moyen des touches",

    // Results / full report
    "Full report": "Rapport complet",
    "Typing session results": "Résultats de la session de dactylographie",
    "This attempt was too short to measure.": "Cette tentative était trop courte pour mesurer.",
    "This short attempt is a starting point. Try a full minute at a comfortable pace before drawing conclusions.": "Cette courte tentative est un point de départ. Essaie une minute complète à un rythme confortable avant de tirer des conclusions.",
    "You finished at 97% accuracy or better. Try Ghost Race against your saved pace, keeping accuracy ahead of finishing position.": "Tu as fini avec 97 % de précision ou mieux. Essaie Ghost Race contre ton rythme enregistré, en gardant la précision avant la position finale.",

    // Practice recommendations
    "Suggested next practice": "Pratique suggérée ensuite",
    "What to practise next": "Quoi s'entraîner ensuite",
    "Needs practice → steady": "Nécessite une pratique → stable",
    "Choose accuracy over a faster score": "Choisis la précision plutôt qu'un score plus rapide",
    "Slow down a touch": "Ralentis un peu",
    "Take your control into a pace challenge": "Mets ton contrôle dans un défi de rythme",
    "Try a one-minute test": "Essaie un test d'une minute",
    "Try Ghost Race": "Essaie Ghost Race",
    "Build a longer baseline": "Construis une base plus longue",

    // Streak insights
    "Best streak": "Meilleure série",
    "Current streak": "Série actuelle",
    "Practice streak insights": "Informations sur la série de pratique",
    "Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.": "Complète un test, une leçon ou une course chaque jour pour construire ta série. Le progrès est enregistré dans ce navigateur.",
    "You've practised today. Nicely done.": "Tu t'es entraîné aujourd'hui. Bien joué.",
    "Today's practice counts": "La pratique d'aujourd'hui compte",
    "Practised today": "Entraîné aujourd'hui",
    "Not practised yet today": "Pas encore entraîné aujourd'hui",

    // Test modes / settings
    "Test mode": "Mode de test",
    "Typing test settings": "Paramètres du test de dactylographie",
    "All lessons": "Toutes les leçons",
    "Choose a level": "Choisir un niveau",
    "Finger lessons": "Leçons par doigt",
    "Finger level progress": "Progrès du niveau de doigt",
    "Motivate": "Motiver",
    "Coders": "Programmeurs",
    "Funny": "Amusant",
    "Quote set": "Ensemble de citations",
    "Practise with these settings": "S'entraîner avec ces paramètres",
    "First with these settings": "Premier avec ces paramètres",

    // History / previous attempts
    "Review history": "Consulter l'historique",
    "History": "Historique",
    "View history": "Voir l'historique",
    "Personal best": "Meilleur personnel",
    "Previous typing attempt": "Tentative de dactylographie précédente",
    "Previous attempt": "Tentative précédente",
    "last attempt": "dernière tentative",
    "this level": "ce niveau",
    "this level's best": "le meilleur de ce niveau",

    // All-time best
    "All-time best": "Meilleur de tous les temps",
    "All-time best speed": "Meilleure vitesse de tous les temps",

    // Learning guidance
    "A fresh level. Start with a light touch.": "Un nouveau niveau. Commence avec une touche légère.",
    "Always come home.": "Reviens toujours à la maison.",
    "let your fingers find the way": "laisse tes doigts trouver le chemin",
    "your home position": "ta position de base",

    // Ghost Race app
    "Ghost race": "Ghost Race",
    "Typing race": "Course de dactylographie",

    // Help/reference
    "Help": "Aide",
    "How to play a typing race with friends": "Comment jouer à une course de dactylographie avec des amis",
    "Learning navigation": "Navigation d'apprentissage",

    // Multiplayer / lobby (these may use a different T() pattern in components, but included here)
    "or press": "ou appuie sur",

    // Footer / nav
    "Settings": "Paramètres",
    "Share result": "Partager le résultat",
    "Share streak": "Partager la série",
    "About": "À propos",
    "Terms of Service": "Conditions d'utilisation",
    "Privacy Policy": "Politique de confidentialité",
    "Advertise": "Publicité",

    // Special cues and feedback
    "Clean": "Propre",
    "Clean run": "Course propre",
    "Solid": "Solide",
    "Recommended": "Recommandé",

    // Keystroke / feedback labels
    "stars": "étoiles",
    "stars this level": "étoiles à ce niveau",
    "level": "niveau",

    // Session modes / labels
    " · locked": " · verrouillé",
    " · retake": " · reprendre",

} as const;
