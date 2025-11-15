# Learn Touch Typing

## Description
Provide a simple, focused interface for users to learn touch typing by practicing with each finger individually. Build muscle memory through progressive lessons with real-time feedback and achievement badges.

## User Flow
1. User visits `/learn` page
2. Sees options for each finger (Index, Middle, Ring, Pinky)
3. Clicks a finger option → navigates to `/learn/fingers?f=index` (or middle, ring, pinky)
4. Practices typing with randomly generated sentences using only keys for that finger
5. Receives real-time feedback (WPM, accuracy)
6. Earns badges at milestones (20, 30, 40, 50+ WPM)
7. Completes all finger lessons → earns ultimate "TypeNinja" badge

## Design Philosophy
- **Minimalist UI**: Follow existing theme system with minimal text/clutter
- **Clean Typography**: Use existing font styles and spacing
- **Theme Integration**: Respect user's selected theme (dark/light/custom)
- **Focused Experience**: Show only essential information during practice
- **Subtle Feedback**: Use color accents from theme for feedback

## Functionalities

### `/learn` Page (Lesson Selection)
- [x] Create `/learn` page with minimal, clean layout
- [x] Display 4 simple clickable cards for each finger:
  - Index Finger
  - Middle Finger
  - Ring Finger
  - Pinky Finger
- [x] Each card shows only:
  - Finger name
  - Best WPM (if completed)
  - Subtle completion indicator
- [x] Minimal header text (e.g., "Choose a finger")
- [x] Use existing theme colors and spacing
- [x] Add routing to `/learn/fingers?f={fingerName}`

### `/learn/fingers` Page (Practice Interface)
- [x] Create `/learn/fingers` page with query parameter support (`?f=index`, `?f=middle`, etc.)
- [x] Reuse existing `KeyboardContainer` component for familiar experience
- [x] Minimal header showing only finger name (e.g., "Index Finger")
- [x] Display keys for this finger subtly highlighted on keyboard
- [x] Clean practice area with generated text
- [x] Stats displayed minimally (small, non-intrusive WPM/accuracy)

### Sentence Generation
- [x] Define key mappings for each finger:
  - Index: `f`, `g`, `r`, `t`, `v`, `b` (left) | `j`, `h`, `u`, `y`, `n`, `m` (right)
  - Middle: `d`, `e`, `c` (left) | `k`, `i`, `,` (right)
  - Ring: `s`, `w`, `x` (left) | `l`, `o`, `.` (right)
  - Pinky: `a`, `q`, `z`, `Shift`, `Ctrl` (left) | `;`, `p`, `/`
- [x] Create random sentence generator using only letters for selected finger
- [x] Focus on varied key combinations to build muscle memory
- [x] Generate sentences that emphasize finger movement patterns

### Real-time Feedback
- [x] Display WPM and accuracy in small, unobtrusive text (top corner or subtle inline)
- [x] Update metrics in real-time as user types
- [x] Use theme colors for visual feedback on keyboard (correct/incorrect keys)
- [x] Minimal animations, no distracting effects
- [x] Keep focus on the typing area

### Badge System (Optional/Minimal)
- [x] Create simple badge data structure with milestones:
  - 20 WPM: "Speed Learner"
  - 30 WPM: "Quick Fingers"
  - 40 WPM: "Cheetah Typist"
  - 50+ WPM: "TypeMaster"
  - All fingers complete: "TypeNinja"
- [x] Show single Lucide icon for achieved badge (no text clutter)
- [x] Subtle badge unlock notification (small toast or fade-in)
- [x] Store badge progress in local storage
- [x] Display badges minimally on `/learn` page (small Lucide icons only)

### Progress Tracking
- [x] Store **best WPM** for each finger (primary metric)
- [x] Store **best accuracy** for each finger (secondary metric)
- [x] Persist data in local storage with structure:
  ```ts
  {
    index: { bestWPM: 45, bestAccuracy: 98, completed: true },
    middle: { bestWPM: 38, bestAccuracy: 95, completed: true },
    ring: { bestWPM: 0, bestAccuracy: 0, completed: false },
    pinky: { bestWPM: 0, bestAccuracy: 0, completed: false }
  }
  ```
- [x] Show best WPM on each finger card on `/learn` page
- [x] No verbose progress bars or detailed stats (keep it minimal)
- [x] Consider a lesson "completed" after first attempt with >70% accuracy

### Technical Implementation
- [x] Add routes for `/learn` and `/learn/fingers`
- [x] Create minimal FingerSelection component for `/learn` page
- [x] Create FingerPractice component for `/learn/fingers` page
- [x] Build sentence generator utility for finger-specific letters
- [x] Integrate with existing keyboard state management
- [x] Use existing theme CSS variables for consistency
- [x] Create learn progress store (Zustand/Nanostores) for tracking best scores
- [x] Design minimal badge system (Lucide icons only, no verbose text)
- [x] Use Lucide icons for all UI elements (check marks, badges, navigation)
- [x] Ensure mobile-responsive design with same minimalist approach
- [x] Reuse existing components where possible (Keyboard, Stats display patterns)

### UI/UX Guidelines
- [x] **No excessive text**: Use icons and numbers over explanatory text
- [x] **Icons**: Use Lucide icons only (consistent with existing codebase)
- [x] **Theme consistency**: Use existing CSS theme variables (background, text, accent colors)
- [x] **Typography**: Match existing font styles and sizes
- [x] **Spacing**: Follow existing padding/margin patterns from main typing interface
- [x] **Colors**: Use theme accent colors for highlights/feedback (green for correct, red for incorrect)
- [x] **Animations**: Keep subtle and fast (follow existing app's animation patterns)
- [x] **Focus**: Practice area should be the primary focus, everything else secondary

### Future Extensibility
- [x] Structure allows adding more learning modes (e.g., `/learn/words`, `/learn/speed`)
- [x] Badge system can be expanded with more milestones
- [x] Can add difficulty levels per finger (while maintaining minimal UI)
