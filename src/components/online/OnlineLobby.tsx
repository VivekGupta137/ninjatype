import { useStore } from '@nanostores/react';
import { ArrowRight, Ghost, Keyboard } from 'lucide-react';
import { $onlineLobbyState, $onlineCountdown, $onlineTargetWords, $onlinePlayers, startOnlineRace } from '@/store/online';

export default function OnlineLobby() {
    const phase = useStore($onlineLobbyState);
    const countdown = useStore($onlineCountdown);
    const target = useStore($onlineTargetWords);
    const shadow = useStore($onlinePlayers).find(player => !player.isYou);
    if (phase === 'countdown') return <div className="online-start-overlay online-countdown" role="status" aria-live="polite"><kbd className="analytics-key">{countdown || 'go'}</kbd><p>Same start. Your own rhythm.</p></div>;
    if (phase !== 'idle') return null;
    return <div className="online-start-overlay"><span className="shadow-start-icon">{shadow ? <Ghost size={26} /> : <Keyboard size={26} />}</span><h2>{shadow ? 'Chase your best.' : 'Set your first pace.'}</h2><p>{shadow ? `${target} words. Your ${shadow.avgWpm} WPM shadow. Ready when you are.` : 'Finish a run to create a shadow you can race next time.'}</p><button type="button" className="online-primary-action" onClick={() => startOnlineRace()}>{shadow ? 'Start race' : 'Record first run'}<ArrowRight size={16} /></button></div>;
}
