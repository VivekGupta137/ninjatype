import KeyButton from '@/components/ui/KeyButton';
import { useStore } from '@nanostores/react';
import { ArrowRight, Ghost, Keyboard } from 'lucide-react';
import { $onlineLobbyState, $onlineCountdown, $onlineTargetWords, $onlinePlayers, $onlineBenchmark, startOnlineRace } from '@/store/online';
import { tr, type LearnLocale } from '@/lib/learnLocale';

export default function OnlineLobby({ locale = 'en' }: { locale?: LearnLocale }) {
    const today = useStore($onlineBenchmark) === 'today';
    const phase = useStore($onlineLobbyState);
    const countdown = useStore($onlineCountdown);
    const target = useStore($onlineTargetWords);
    const shadow = useStore($onlinePlayers).find(player => !player.isYou);
    if (phase === 'countdown') return <div className="online-start-overlay online-countdown" role="status" aria-live="polite"><kbd className="analytics-key">{countdown || tr(locale, 'go', 'los')}</kbd><p>{tr(locale, 'Same start. Your own rhythm.', 'Gleicher Start. Dein eigener Rhythmus.')}</p></div>;
    if (phase !== 'idle') return null;
    return <div className="online-start-overlay"><span className="shadow-start-icon">{shadow ? <Ghost size={26} /> : <Keyboard size={26} />}</span><h2>{shadow ? (today ? tr(locale, 'Chase today’s best.', 'Jage den heutigen Bestwert.') : tr(locale, 'Chase your all-time best.', 'Jage deinen Allzeit-Bestwert.')) : (today ? tr(locale, 'Set today’s first pace.', 'Setze dein erstes Tages-Tempo.') : tr(locale, 'Set your first pace.', 'Setze dein erstes Tempo.'))}</h2><p>{shadow ? `${target} ${tr(locale, 'words', 'Wörter')}. ${tr(locale, 'Your', 'Dein')} ${shadow.avgWpm} WPM ${tr(locale, 'shadow', 'Schatten')}. ${tr(locale, 'Ready when you are.', 'Bereit, wenn du es bist.')}` : (today ? tr(locale, 'Finish a run to create today’s shadow.', 'Beende einen Lauf, um den heutigen Schatten zu erstellen.') : tr(locale, 'Finish a run to create a shadow you can race next time.', 'Beende einen Lauf, um einen Schatten für das nächste Rennen zu erstellen.'))}</p><KeyButton variant="primary" onPress={() => startOnlineRace()}>{shadow ? tr(locale, 'Start race', 'Rennen starten') : tr(locale, 'Record first run', 'Ersten Lauf erfassen')}<ArrowRight size={16} /></KeyButton></div>;
}
