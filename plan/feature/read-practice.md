# Read Practice Feature

## Description
Provide a speech recognition practice interface where users read text aloud and receive real-time feedback on accuracy and clarity. Uses Web Speech API for speech-to-text transcription and text-to-speech for playback.

## User Flow
1. User visits `/read` page
2. Sees a sentence to read displayed on screen
3. Clicks record button (mic icon) to start recording
4. Reads the text aloud
5. Text fills in real-time as user speaks (similar to learn feature)
6. Receives real-time feedback (accuracy, clarity, overall score)
7. Can click play button to hear back what was transcribed
8. Receives completion message when finished

## Design Philosophy
- **Minimalist UI**: Follow existing theme system with minimal text/clutter
- **Performance Page Style**: Match the design of the performance page for consistency
- **Clean Typography**: Use existing font styles and spacing (28px for values, 18px for labels)
- **Theme Integration**: Respect user's selected theme (dark/light/custom)
- **Focused Experience**: Show only essential information during practice
- **Icon-based Controls**: Use icon buttons matching home page toolbar style

## Functionalities

### `/read` Page (Read Practice Interface)
- [x] Create `/read` page with clean layout
- [x] Display sentence to read (generated from word list)
- [x] Real-time text filling as user speaks (using Paragraph component)
- [x] Show stats: Accuracy, Clarity, Overall Score
- [x] Icon-based controls: Record (mic), Playback (play), Reset (rotate)
- [x] Record button turns red when recording
- [x] Completion message styled like performance page (no white background)
- [x] Browser support warning for unsupported browsers

### Speech Recognition
- [x] Integrate Web Speech API (SpeechRecognition)
- [x] Real-time transcription as user speaks
- [x] Continuous recognition mode
- [x] Track confidence scores for clarity calculation
- [x] Handle errors gracefully (no-speech, network, etc.)
- [x] Auto-restart recognition if it stops unexpectedly

### Text-to-Speech Playback
- [x] Read back transcribed text using Speech Synthesis API
- [x] Load and select appropriate voice (prefer English, local service)
- [x] Handle voice loading (wait for voiceschanged event)
- [x] Visual feedback when playing (button highlights)
- [x] Stop functionality (click again to stop)
- [x] Error handling with user-friendly messages

### Accuracy & Clarity Scoring
- [x] Calculate accuracy using Levenshtein distance algorithm
- [x] Compare transcribed text with target sentence
- [x] Normalize text for comparison (lowercase, trim spaces)
- [x] Calculate clarity from speech recognition confidence scores
- [x] Overall score: weighted average (60% accuracy, 40% clarity)
- [x] Real-time score updates

### Sentence Generation
- [x] Fetch words from `/api/words/1000` endpoint
- [x] Generate random sentence with 15 words
- [x] Use existing `createSentenceFromWords` utility
- [x] Fallback to default sentence if API fails
- [x] Reset sentence on practice reset

### State Management
- [x] Create `readKeyboardState.ts` store for read-specific state
- [x] Create `readAnalytics.ts` store for accuracy/clarity calculations
- [x] Create `readKeyboard.ts` store for sentence generation
- [x] Track recording state, transcribed text, confidence scores
- [x] Track typing state (idle, typing, completed)
- [x] Separate from main typing interface to avoid conflicts

### UI Components
- [x] Create `ReadPractice.tsx` component
- [x] Reuse `Paragraph` component for text display
- [x] Stats display matching performance page style
- [x] Icon buttons matching home page toolbar style
- [x] Completion message with performance page styling
- [x] No white backgrounds, use theme colors

### Technical Implementation
- [x] Add route for `/read`
- [x] Create `useReadSpeech` hook for speech recognition
- [x] Integrate with existing keyboard/paragraph components
- [x] Use existing theme CSS variables for consistency
- [x] Create read stores (Nanostores) for state management
- [x] Use Lucide icons for all UI elements (Mic, Play, RotateCcw)
- [x] Ensure mobile-responsive design
- [x] Handle browser compatibility (Chrome, Edge, Safari)

### UI/UX Guidelines
- [x] **No excessive text**: Use icons and numbers over explanatory text
- [x] **Icons**: Use Lucide icons only (consistent with existing codebase)
- [x] **Theme consistency**: Use existing CSS theme variables (--main-color, --sub-text-color, etc.)
- [x] **Typography**: Match performance page font styles (28px values, 18px labels)
- [x] **Spacing**: Follow existing padding/margin patterns
- [x] **Colors**: Use theme colors, no white backgrounds
- [x] **Animations**: Keep subtle and fast (fadeIn for completion)
- [x] **Focus**: Text area should be the primary focus

### Browser Support
- [x] Check for Speech Recognition API support
- [x] Check for Speech Synthesis API support
- [x] Show warning message for unsupported browsers
- [x] Graceful degradation (inform user, don't break)

### Future Extensibility
- [x] Structure allows adding more speech practice modes
- [x] Can add difficulty levels (longer sentences, faster speech)
- [x] Can add history tracking for read practice sessions
- [x] Can add voice selection for playback
- [x] Can add pronunciation hints or corrections
