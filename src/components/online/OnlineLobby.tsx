import { useStore } from "@nanostores/react";
import { ArrowRight } from "lucide-react";
import { $onlineLobbyState, $onlineCountdown, $onlineTargetWords, $onlinePlayers, startOnlineRace } from "@/store/online";

const OnlineLobby = () => {
    const phase = useStore($onlineLobbyState);
    const countdown = useStore($onlineCountdown);
    const target = useStore($onlineTargetWords);
    const opponentCount = useStore($onlinePlayers).filter(player => !player.isYou).length;
    if (phase === 'countdown') return <div className="online-start-overlay online-countdown" role="status" aria-live="polite"><kbd className="analytics-key">{countdown || 'go'}</kbd><p>Same start. Your own rhythm.</p></div>;
    if (phase !== 'idle') return null;
    return <div className="online-start-overlay"><div className="online-start-keys" aria-hidden="true"><kbd className="analytics-key">f</kbd><kbd className="analytics-key">j</kbd></div><h2>{opponentCount ? 'A fresh track awaits.' : 'Set your first pace.'}</h2><p>{opponentCount ? `${target} words. ${opponentCount} past ${opponentCount === 1 ? 'attempt' : 'attempts'}. Ready when you are.` : 'Finish a run to race against it next time.'}</p><button type="button" className="online-primary-action" onClick={() => startOnlineRace()}>{opponentCount ? 'Start race' : 'Record a run'}<ArrowRight size={16} /></button></div>;
};

export default OnlineLobby;
