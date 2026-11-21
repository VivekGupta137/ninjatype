import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import { Modal, TextField, Label, Input, ToggleButton, ToggleButtonGroup, useOverlayState } from "@heroui/react";
import { Eye, Megaphone, Upload } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { $adPreview } from "@/store/adPreview";
import {
    LOGO_TYPES, MAX_DESCRIPTION, MAX_LOGO_BYTES, MAX_NAME, normalizePreview, validatePreview, writePreview,
    type AdPackage, type AdPreviewErrors,
} from "@/lib/adPreview";
import { SponsorCard } from "./SponsorSpotlight";
import "@/styles/ui.css";
import "@/styles/adpreview.css";

const PACKAGES: { id: AdPackage; option: string; label: string }[] = [
    { id: "results", option: "Option 1", label: "Results spotlight" },
    { id: "brand", option: "Option 2", label: "Always-on brand" },
];

/** Creates (and later removes) a container inside an existing page element. */
function useSlot(selector: string, className: string, place: "append" | "prepend", enabled: boolean) {
    const [slot, setSlot] = useState<HTMLElement | null>(null);
    useEffect(() => {
        const host = enabled ? document.querySelector<HTMLElement>(selector) : null;
        if (!host) { setSlot(null); return; }
        const el = document.createElement("div");
        el.className = className;
        place === "prepend" ? host.prepend(el) : host.append(el);
        setSlot(el);
        return () => { el.remove(); setSlot(null); };
    }, [selector, className, place, enabled]);
    return slot;
}

const stripPreviewParam = () => {
    const url = new URL(location.href);
    if (url.searchParams.has("preview")) { url.searchParams.delete("preview"); history.replaceState(history.state, "", url); }
};

export default function AdPreview({ autoOpen }: { autoOpen: boolean }) {
    const ad = useStore($adPreview);
    const form = useOverlayState();
    const demo = useOverlayState();
    const [pkg, setPkg] = useState<AdPackage>("results");
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("");
    const [logoName, setLogoName] = useState("");
    const [errors, setErrors] = useState<AdPreviewErrors>({});
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (autoOpen) form.open(); }, [autoOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        document.body.classList.toggle("adp-active", !!ad);
        return () => document.body.classList.remove("adp-active");
    }, [ad]);

    const brand = ad?.pkg === "brand";
    const headerSlot = useSlot(".header-brand", "adp-header", "append", brand);
    const footerSlot = useSlot(".site-footer", "adp-footer", "prepend", brand);

    const openForm = () => {
        if (ad) { setPkg(ad.pkg); setName(ad.name); setUrl(ad.url); setDescription(ad.description); setLogo(ad.logo); setLogoName(""); }
        setErrors({});
        form.open();
    };

    const pickLogo = (file: File | undefined) => {
        if (!file) return;
        if (!LOGO_TYPES.includes(file.type) || file.size > MAX_LOGO_BYTES) {
            setLogo(""); setLogoName("");
            setErrors(e => ({ ...e, logo: "Upload a PNG, JPG, SVG, WebP or GIF up to 300 KB." }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => { setLogo(String(reader.result)); setLogoName(file.name); setErrors(e => ({ ...e, logo: undefined })); };
        reader.readAsDataURL(file);
    };

    const submit = () => {
        const next = validatePreview({ pkg, name, logo, url, description });
        setErrors(next);
        if (Object.keys(next).length) return;
        const data = normalizePreview({ pkg, name, logo, url, description });
        writePreview(data);
        $adPreview.set(data);
        stripPreviewParam();
        form.close();
    };

    const exit = () => { writePreview(null); $adPreview.set(null); stripPreviewParam(); };

    return (
        <>
            {ad && (
                <div className="adp-bar" role="region" aria-label="Ad preview">
                    <span className="adp-bar-text"><Eye size={14} aria-hidden="true" />Previewing <b>{PACKAGES.find(p => p.id === ad.pkg)?.label}</b></span>
                    <span className="adp-bar-actions">
                        {ad.pkg === "results" && <KeyButton size="sm" onPress={demo.open}>See it</KeyButton>}
                        <KeyButton size="sm" onPress={openForm}>Edit</KeyButton>
                        <KeyButton size="sm" variant="ghost" onPress={exit}>Exit</KeyButton>
                    </span>
                    {ad.pkg === "results" && <span className="adp-bar-hint">Finish a typing test or Ghost Race to see it on the results screen.</span>}
                </div>
            )}

            {brand && ad && headerSlot && createPortal(
                <>
                    <span className="adp-x" aria-hidden="true">×</span>
                    <a className="adp-header-link" href={ad.url} target="_blank" rel="sponsored noopener noreferrer" aria-label={`Sponsor: ${ad.name}`}>
                        <img src={ad.logo} alt="" />
                        <small>Sponsor</small>
                    </a>
                </>, headerSlot)}
            {brand && ad && footerSlot && createPortal(
                <a className="adp-footer-link" href={ad.url} target="_blank" rel="sponsored noopener noreferrer">
                    <span>Sponsored by</span><img src={ad.logo} alt="" /><b>{ad.name}</b>
                </a>, footerSlot)}

            <Modal state={form}>
                <Modal.Backdrop>
                    <Modal.Container scroll="inside">
                        <Modal.Dialog className="adp-modal">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Icon><Megaphone /></Modal.Icon>
                                <Modal.Heading>Preview your ad</Modal.Heading>
                                <p className="adp-sub">See how your ad looks on NinjaType. Nothing is sent or saved; it only shows in this tab.</p>
                            </Modal.Header>
                            <Modal.Body className="adp-body">
                                <ToggleButtonGroup
                                    className="key-group adp-pkgs" aria-label="Package" selectionMode="single" disallowEmptySelection
                                    selectedKeys={new Set([pkg])}
                                    onSelectionChange={keys => { const v = Array.from(keys)[0] as AdPackage | undefined; if (v) setPkg(v); }}
                                >
                                    {PACKAGES.map(p => (
                                        <ToggleButton key={p.id} id={p.id} className="key-btn"><span className="adp-opt">{p.option}</span>{p.label}</ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                                <p className="adp-pkg-note">{pkg === "results" ? "A sponsor card on the results screen after a typing test or Ghost Race." : "Your logo next to the NinjaType logo and in the footer."}</p>

                                <TextField value={name} onChange={setName} isInvalid={!!errors.name} maxLength={MAX_NAME}>
                                    <Label>Brand name</Label>
                                    <Input placeholder="Acme Keyboards" />
                                    {errors.name && <p className="adp-error" role="alert">{errors.name}</p>}
                                </TextField>

                                <div className="adp-field">
                                    <Label>Logo</Label>
                                    <input ref={fileRef} type="file" accept={LOGO_TYPES.join(",")} className="sr-only" onChange={e => pickLogo(e.target.files?.[0])} aria-label="Upload logo" />
                                    <div className="adp-logo-row">
                                        <KeyButton size="sm" onPress={() => fileRef.current?.click()}><Upload size={14} />{logo ? "Change" : "Upload"}</KeyButton>
                                        {logo ? <img className="adp-logo-thumb" src={logo} alt="Your logo" /> : <span className="adp-hint">PNG, JPG, SVG, WebP or GIF · up to 300 KB</span>}
                                        {logoName && <span className="adp-hint">{logoName}</span>}
                                    </div>
                                    {errors.logo && <p className="adp-error" role="alert">{errors.logo}</p>}
                                </div>

                                <TextField value={url} onChange={setUrl} isInvalid={!!errors.url}>
                                    <Label>Website link</Label>
                                    <Input placeholder="acme.com" inputMode="url" />
                                    {errors.url && <p className="adp-error" role="alert">{errors.url}</p>}
                                </TextField>

                                {pkg === "results" && (
                                    <TextField value={description} onChange={setDescription} isInvalid={!!errors.description} maxLength={MAX_DESCRIPTION}>
                                        <Label>Short description</Label>
                                        <Input placeholder="Mechanical keyboards built for typists" />
                                        {errors.description && <p className="adp-error" role="alert">{errors.description}</p>}
                                    </TextField>
                                )}
                            </Modal.Body>
                            <Modal.Footer className="adp-footer-actions">
                                <KeyButton variant="primary" size="lg" onPress={submit}><Eye size={16} />Show preview</KeyButton>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <Modal state={demo}>
                <Modal.Backdrop>
                    <Modal.Container>
                        <Modal.Dialog className="adp-modal">
                            <Modal.CloseTrigger />
                            <Modal.Header><Modal.Heading>Results spotlight</Modal.Heading><p className="adp-sub">This is how it appears on the results screen.</p></Modal.Header>
                            <Modal.Body className="adp-body">{ad?.pkg === "results" && <SponsorCard ad={ad} />}</Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}
