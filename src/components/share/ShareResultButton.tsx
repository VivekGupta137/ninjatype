import { useId, useState } from 'react';
import { Description, FieldError, Input, Label, Modal, Switch, TextField, useOverlayState } from '@heroui/react';
import { Share2, ArrowUpRight } from 'lucide-react';
import { sharePath, usernameError, validateShareResult, type ResultSnapshot } from '@/lib/shareResult';
import KeyButton from '@/components/ui/KeyButton';
import '../../styles/share.css';
import { $config } from '@/store/config';

/** Share trigger + a small modal to name the card. No global state. */
export default function ShareResultButton({ result, defaultUsername = '', label, accessibleLabel }: { result: ResultSnapshot; defaultUsername?: string; label?: string; accessibleLabel?: string }) {
    const modal = useOverlayState();
    const id = useId();
    const [username, setUsername] = useState(defaultUsername);
    const [error, setError] = useState('');
    const [includeAccuracy, setIncludeAccuracy] = useState(true);
    if (!validateShareResult({ ...result, v: 1, username: 'Ninja' })) return null;
    const name = accessibleLabel ?? label ?? 'Share result';
    const open = () => {
        let remembered = '';
        try { remembered = localStorage.getItem('ninjatype.share-name') ?? ''; } catch { /* storage is optional */ }
        setUsername(defaultUsername || (usernameError(remembered) ? '' : remembered));
        setError(''); setIncludeAccuracy(result.accuracy !== undefined);
        modal.open();
    };
    const submit = () => {
        const problem = usernameError(username);
        if (problem) { setError(problem); return; }
        try {
            const path = sharePath({ ...result, v: 1, username, accuracy: includeAccuracy ? result.accuracy : undefined, theme: $config.get().theme });
            try { localStorage.setItem('ninjatype.share-name', username.normalize('NFC').trim()); } catch { /* optional */ }
            window.location.assign(path);
        } catch { setError('This result could not be shared. Please try another test.'); }
    };
    return <>
        <KeyButton className="share-result-key" isIconOnly={!label} aria-label={name} aria-haspopup="dialog" onPress={open}><Share2 size={16} aria-hidden="true" />{label}</KeyButton>
        <Modal state={modal}>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog aria-labelledby={`${id}-title`}>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon><Share2 /></Modal.Icon>
                            <Modal.Heading id={`${id}-title`}>{result.streak ? 'A habit worth sharing.' : 'A score worth sharing.'}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="share-composer-body">
                            {result.streak && <p className="share-modal-line">{result.streak} {result.streak === 1 ? 'day' : 'days'} streak · all-time best typing speed</p>}
                            <p className="share-modal-score"><strong>{result.wpm}</strong> WPM {includeAccuracy && result.accuracy !== undefined && <span>· {result.accuracy}% accuracy</span>}</p>
                            <form id={`${id}-form`} onSubmit={event => { event.preventDefault(); submit(); }} className="share-modal-form">
                                <TextField value={username} onChange={value => { setUsername(value); setError(''); }} isRequired maxLength={40} isInvalid={!!error} autoComplete="nickname" autoFocus>
                                    <Label>Your display name</Label>
                                    <Input placeholder="e.g. Keyboard ninja" />
                                    <Description>Up to 40 characters. Your name and scores will be visible to anyone with the link.</Description>
                                    {error && <FieldError>{error}</FieldError>}
                                </TextField>
                                <Switch isSelected={includeAccuracy} isDisabled={result.accuracy === undefined} onChange={setIncludeAccuracy}>
                                    <Switch.Control><Switch.Thumb /></Switch.Control>
                                    <Switch.Content><Label>Include accuracy</Label></Switch.Content>
                                </Switch>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <KeyButton variant="ghost" onPress={modal.close}>Cancel</KeyButton>
                            <KeyButton variant="primary" type="submit" form={`${id}-form`}>Create my card<ArrowUpRight size={16} aria-hidden="true" /></KeyButton>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    </>;
}
