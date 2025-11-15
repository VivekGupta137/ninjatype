import { useState } from 'react';
import type { FAQItem } from '@/constants/faq';

interface FAQProps {
    faqs: FAQItem[];
}

const FAQ = ({ faqs }: FAQProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!faqs || faqs.length === 0) {
        return null;
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <section className="faq-section" aria-label="Frequently Asked Questions">
            {/* Toggle Button */}
            <button
                className="faq-toggle-button"
                onClick={() => setIsOpen(true)}
                aria-label="Open FAQ"
                type="button"
            >
                ?
            </button>

            {/* Overlay Modal */}
            <div
                className={`faq-overlay ${isOpen ? 'faq-overlay-open' : ''}`}
                onClick={handleOverlayClick}
            >
                <div className="faq-modal">
                    <div className="faq-modal-header">
                        <h2 className="faq-modal-title">Frequently Asked Questions</h2>
                        <button
                            className="faq-close-button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close FAQ"
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className="faq-container">
                        <div className="faq-items-list">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="faq-item"
                                    itemScope
                                    itemType="https://schema.org/Question"
                                >
                                    <h3 className="faq-question" itemProp="name">
                                        {faq.question}
                                    </h3>
                                    <div
                                        className="faq-answer"
                                        itemScope
                                        itemProp="acceptedAnswer"
                                        itemType="https://schema.org/Answer"
                                    >
                                        <p itemProp="text">{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
