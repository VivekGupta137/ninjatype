import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ['f', 'j'], description: 'Build your foundation with the fingers that cover the most keys.', cue: 'Feel the small bumps on F and J. These are your anchors.' },
    middle: { homeKeys: ['d', 'k'], description: 'Find a steady rhythm with short, straight reaches.', cue: 'Rest on D and K. Reach up and down, then return home.' },
    ring: { homeKeys: ['s', 'l'], description: 'Give your ring fingers a little more independence.', cue: 'Rest on S and L. Keep your other fingers relaxed as you reach.' },
    pinky: { homeKeys: ['a', ';'], description: 'Build control and confidence at the edges of the keyboard.', cue: 'Rest on A and semicolon. Use a light touch and avoid stretching.' },
};
