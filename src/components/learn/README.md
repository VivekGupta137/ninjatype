# Learn Touch Typing Feature

## Overview

The Learn Touch Typing feature provides a structured, progressive approach to mastering touch typing. Users practice typing with individual fingers, building muscle memory and speed through focused exercises.

## Architecture

### Store Isolation

**Important**: The learn feature uses completely separate stores from the main typing interface to prevent conflicts:

#### Learn-Specific Stores
- `store/learnKeyboard.ts` - Keyboard state for learn practice (separate from main `store/keyboard.ts`)
  - `$learnKbState` - Focus state
  - `$learnKbTypingState` - Typing progress state
  - `$learnKbSentence` - Practice sentence
  - `$learnKbTypedText` - User's typed text
  
- `store/learnAnalytics.ts` - Analytics for learn practice (separate from main `store/analytics.ts`)
  - `$learnRawWPM` - Words per minute
  - `$learnAccuracy` - Accuracy percentage

- `store/learn.ts` - Progress tracking (learn-feature specific)
  - `$learnProgress` - Finger lesson completion data with localStorage persistence

#### Learn-Specific Hooks
- `hooks/useLearnTypedText.tsx` - Custom hook for learn typing logic
  - Uses learn stores instead of main keyboard stores
  - Calculates WPM and accuracy independently
  - Handles completion detection

#### Why Separate Stores?
Without store isolation, the learn feature would conflict with the main homepage typing interface:
- Navigating to `/learn` would overwrite the user's current typing session
- Switching between tabs would cause data corruption
- Analytics would mix main and learn practice data
- Users couldn't have sessions in both interfaces simultaneously

This architecture allows complete isolation between the main typing interface and learn feature, preventing any cross-contamination of state.

### Components

#### `FingerSelection.tsx`
- **Purpose**: Main lesson selection interface
- **Location**: `/learn` route
- **Features**:
  - Displays 4 finger lesson cards (index, middle, ring, pinky)
  - Shows progress stats (best WPM, accuracy, completion status)
  - Displays earned badges for each finger
  - Shows TypeNinja achievement when all lessons completed

#### `FingerCard.tsx`
- **Purpose**: Individual finger lesson card
- **Props**:
  - `finger`: FingerType - The finger this card represents
- **Features**:
  - Visual completion indicator
  - Best WPM and accuracy display
  - Badge showcase with icons
  - Click to start lesson

#### `FingerPractice.tsx`
- **Purpose**: Interactive typing practice interface
- **Location**: `/learn/fingers?f={finger}` route
- **Props**:
  - `finger`: FingerType - The finger to practice
- **Features**:
  - Real-time WPM and accuracy tracking (using learn stores)
  - Dynamic sentence generation (finger-specific keys only)
  - Visual keyboard feedback
  - Badge display for current session
  - Progress auto-save on completion
  - Reset button for new practice session
- **Store Usage**: Uses `$learnKbState`, `$learnRawWPM`, etc. (NOT main stores)

### State Management

#### `store/learnKeyboard.ts`
- **Stores**: Keyboard state atoms isolated from main interface
- **Functions**:
  - `resetLearnKeyboardStores()` - Resets all learn keyboard state

#### `store/learnAnalytics.ts`
- **Stores**: Analytics atoms isolated from main interface
- **Functions**:
  - `resetLearnAnalytics()` - Resets WPM and accuracy

#### `store/learn.ts`
- **Store**: `$learnProgress` - Nanostores atom with localStorage persistence
- **Data Structure**:
  ```typescript
  {
    index: { bestWPM: number, bestAccuracy: number, completed: boolean },
    middle: { bestWPM: number, bestAccuracy: number, completed: boolean },
    ring: { bestWPM: number, bestAccuracy: number, completed: boolean },
    pinky: { bestWPM: number, bestAccuracy: number, completed: boolean }
  }
  ```
- **Functions**:
  - `updateFingerProgress(finger, wpm, accuracy)` - Updates and persists progress
  - `getFingerProgress(finger)` - Retrieves progress for a finger
  - `resetFingerProgress(finger)` - Resets a single finger
  - `resetAllLearnProgress()` - Clears all progress
  - `areAllFingersCompleted()` - Checks TypeNinja eligibility

### Constants

#### `constants/fingerKeys.ts`
- **Purpose**: Keyboard key assignments for touch typing
- **Exports**:
  - `FingerType` - Union type: 'index' | 'middle' | 'ring' | 'pinky'
  - `FINGER_KEYS` - Key mappings for each finger
  - `FINGER_NAMES` - Display names
  - `getFingerKeys(finger)` - Get keys for a finger
  - `isKeyForFinger(key, finger)` - Validate key assignment
  - `getAllFingers()` - Get all finger types

#### `constants/badges.ts`
- **Purpose**: Achievement system for motivation
- **Exports**:
  - `Badge` - Interface for badge data
  - `BADGES` - Array of 4 milestone badges (20, 30, 40, 50 WPM)
  - `TYPE_NINJA_BADGE` - Special completion badge
  - `getBadgeForWPM(wpm)` - Get highest earned badge
  - `hasEarnedTypeNinjaBadge(progress)` - Check completion

### Utilities

#### `util/sentence.ts`
- **Purpose**: Generate practice text
- **New Functions**:
  - `generateFingerWord(finger)` - Creates 3-6 char word from finger keys
  - `generateFingerSentence(finger, wordCount)` - Creates full practice sentence
- **Configuration**: Uses `WORD_GENERATION_CONFIG` constant

### Routing

#### `/learn` (pages/learn/index.astro)
- **Component**: FingerSelection (client:load)
- **Layout**: BaseLayout with Header and Footer
- **Purpose**: Lesson selection hub

#### `/learn/fingers?f={finger}` (pages/learn/fingers.astro)
- **Component**: FingerPractice (client:load)
- **Layout**: BaseLayout with Header and Footer
- **Query Param**: `f` - finger type (validated)
- **SSG**: Uses getStaticPaths for prerendering 4 static routes
- **Error Handling**: Redirects to /learn if invalid finger param

## User Flow

1. **Discovery**: User clicks school icon in header
2. **Selection**: Views 4 finger cards, clicks one to start
3. **Practice**: Types generated sentence using finger-specific keys
4. **Tracking**: Real-time WPM/accuracy, badges earned during session
5. **Completion**: Progress auto-saved when sentence completed (≥70% accuracy)
6. **Progression**: Repeat for all fingers to unlock TypeNinja badge

## Key Design Decisions

### Store Isolation Architecture
- **Decision**: Create separate stores for learn feature
- **Rationale**: Prevents conflicts with main typing interface
- **Benefits**: 
  - Users can switch between main and learn without data loss
  - Independent analytics tracking
  - Cleaner separation of concerns
  - Easier testing and debugging

### Synchronous Initialization
- Uses `useMemo` in FingerPractice to generate sentence during render phase
- Prevents flash of incorrect content from keyboard stores
- Ensures finger-specific text displays immediately on page load

### Reused UI Components
- Reuses existing Paragraph component for consistency
- Uses same keyboard state patterns (KBSTATE, KBTYPINGSTATE)
- Maintains visual consistency with main interface

### Progress Persistence
- Uses nanostores `onSet` pattern for automatic localStorage sync
- No manual save calls needed
- Handles schema validation and error recovery

### Completion Threshold
- 70% accuracy required to mark lesson as completed
- Encourages quality over speed
- Configurable via `COMPLETION_ACCURACY_THRESHOLD` constant

## Styling

All styles are in `src/styles/global.css` under the "Learn Touch Typing" section:
- Theme-aware using CSS variables (--main-color, --bg-color, etc.)
- Responsive design with mobile breakpoints
- Hover effects and transitions
- Badge animations

## Testing Checklist

- [ ] All 4 finger routes prerender correctly
- [ ] Finger-specific keys only appear in practice text
- [ ] Learn stores don't conflict with main typing interface
- [ ] Can type on homepage and learn simultaneously (different tabs)
- [ ] Progress saves to localStorage
- [ ] Badge system awards correctly based on WPM
- [ ] TypeNinja badge appears when all fingers completed
- [ ] Reset button generates new random sentence
- [ ] Back button returns to selection page
- [ ] Theme changes apply correctly
- [ ] Mobile responsive on all screen sizes

## Future Enhancements

### Potential Features (Not Implemented)
- Difficulty levels (more/fewer words)
- Combination practice (multiple fingers)
- Speed challenges (timed races)
- Progress graphs over time
- Custom key mappings (Dvorak, Colemak)
- Sound effects and animations
- Daily streaks and reminders

### Extensibility Points
- `generateFingerSentence` - Can add difficulty parameter
- Badge system - Easy to add more milestones
- Progress store - Can track additional metrics (time spent, attempts)
- Routing - Can add new learn modes (`/learn/words`, `/learn/speed`)

## Maintenance Notes

### Store Architecture
- **Never** use main stores (`$kbState`, `$rawWPM`) in learn components
- **Always** use learn stores (`$learnKbState`, `$learnRawWPM`) for learn feature
- Keep stores in separate files to prevent accidental imports
- Document any new stores clearly with purpose and scope

### Adding New Badges
1. Add badge to `BADGES` array in `badges.ts`
2. Update badge display logic in `FingerCard.tsx` if needed
3. Ensure icon is imported from lucide-react

### Changing Key Mappings
1. Update `FINGER_KEYS` in `fingerKeys.ts`
2. Test sentence generation
3. Verify all keys still work in keyboard component

### Modifying Completion Requirements
1. Change `COMPLETION_ACCURACY_THRESHOLD` in `learn.ts`
2. Update documentation and user-facing text
3. Consider backward compatibility with existing progress

### Debugging Tips
- **Store conflicts**: Check if component imports learn stores or main stores
- **localStorage**: Check key `learn-progress` in browser DevTools
- **Keyboard state**: Use React DevTools to inspect store subscriptions
- **Console warnings**: Invalid finger types, key mapping issues
- **Analytics**: Verify `useLearnTypedText` hook is calculating correctly
