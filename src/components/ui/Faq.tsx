import { Accordion, Modal, useOverlayState } from "@heroui/react";
import { ChevronDown, CircleQuestionMark } from "lucide-react";
import KeyButton from "./KeyButton";
import "@/styles/ui.css";

export interface FaqEntry { question: string; answer: string; }

export function FaqList({ faqs }: { faqs: FaqEntry[] }) {
    return (
        <Accordion variant="surface">
            {faqs.map(({ question, answer }) => (
                <Accordion.Item key={question}>
                    <Accordion.Heading>
                        <Accordion.Trigger>{question}<Accordion.Indicator><ChevronDown /></Accordion.Indicator></Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel><Accordion.Body>{answer}</Accordion.Body></Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}

/** Bordered FAQ block, as used on /help (heading, short description, optional action, accordion). */
export function FaqSection({ title, description, faqs, action }: { title: string; description?: string; faqs: FaqEntry[]; action?: React.ReactNode }) {
    return (
        <section className="faq-section">
            <div className="faq-section-head">
                <div><h3>{title}</h3>{description && <p>{description}</p>}</div>
                {action}
            </div>
            <FaqList faqs={faqs} />
        </section>
    );
}

/** Round "?" key that opens the FAQ in a modal (the practice-help-trigger pattern). `floating` pins it bottom-right. */
export function HelpTrigger({ title = "Help", faqs, floating }: { title?: string; faqs: FaqEntry[]; floating?: boolean }) {
    const state = useOverlayState();
    return (
        <>
            <KeyButton isIconOnly variant="ghost" className={floating ? "help-trigger--floating" : ""} aria-label={`${title} and frequently asked questions`} onPress={state.open}>
                <CircleQuestionMark size={22} aria-hidden="true" />
            </KeyButton>
            <Modal state={state}>
                <Modal.Backdrop>
                    <Modal.Container scroll="inside">
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Icon><CircleQuestionMark /></Modal.Icon>
                                <Modal.Heading>{title}</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body><FaqList faqs={faqs} /></Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}
