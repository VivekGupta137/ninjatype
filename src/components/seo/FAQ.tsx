import React from "react";
import { Accordion } from "@heroui/react";
import { ChevronDown, CircleQuestionMarkIcon } from "lucide-react";
import type { FAQItem } from "@/constants/faq";
import { Modal, Button } from "@heroui/react";

interface FAQProps {
    faqs: FAQItem[];
}

const FAQHero = ({ faqs }: FAQProps) => {
    return (
        <Modal>
            <Button size="lg" isIconOnly className={"fixed bottom-8 right-8"}>
                <CircleQuestionMarkIcon className="size-8" />
            </Button>
            <Modal.Backdrop>
                <Modal.Container size="cover">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Icon>
                                <CircleQuestionMarkIcon />
                            </Modal.Icon>
                            <Modal.Heading>
                                Frequently Asked Questions
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <Accordion allowsMultipleExpanded variant="surface">
                                {faqs.map((faq, index) => (
                                    <Accordion.Item key={index}>
                                        <Accordion.Heading
                                            itemScope
                                            itemType="https://schema.org/Question"
                                        >
                                            <Accordion.Trigger>
                                                {faq.question}
                                                <Accordion.Indicator>
                                                    <ChevronDown />
                                                </Accordion.Indicator>
                                            </Accordion.Trigger>
                                        </Accordion.Heading>
                                        <Accordion.Panel>
                                            <Accordion.Body
                                                itemProp="acceptedAnswer"
                                                itemType="https://schema.org/Answer"
                                            >
                                                {faq.answer}
                                            </Accordion.Body>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export default FAQHero;
