import { useMemo } from 'react';
import Paragraph from '@/components/keyboard/Paragraph';
import { typingWindow, wordOffsets } from '@/lib/multiplayer/typingWindow';
export default function RaceParagraph({ text, typedText, active, timed }: { text: string; typedText: string; active: boolean; timed: boolean }) {
    const offsets = useMemo(() => timed ? wordOffsets(text) : [], [text, timed]);
    const visible = timed ? typingWindow(text, typedText, offsets) : { start: 0, text, typedText };
    return <Paragraph key={visible.start} paragraphText={visible.text} typedText={visible.typedText} isActive={active} />;
}
