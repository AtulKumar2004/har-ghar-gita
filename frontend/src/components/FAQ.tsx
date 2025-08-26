import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
    id: string;
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    {
        id: "f1",
        question: "Is this program free for all?",
        answer:
            "Yes, the program is free for all.You just need to register to the above form",
    },
    {
        id: "f2",
        question: "When can I expect to hear back from devotees?",
        answer:
            "Once registration gets completed,within 1 week you will be added to our whatsapp group for the book reading sessions.",
    },
    {
        id: "f3",
        question: "How will the book reading sessions take place?",
        answer:
            "The book reading sessions will take place on zoom where all members will have to read shlokas and the purport for the same",
    },
    {
        id: "f4",
        question: "What benefits can I expect from the sessions?",
        answer:
            "You will develop spiritual intelligence to know what is right what is wrong, what is the purpose of this human form of life, by developing the habit of reading Srila Prabhupada's books.This devotional knowledge is completely transcedental and can be taken up by any surrendered soul",
    },
    {
        id: "f5",
        question: "What is the deadline for registering for the sessions?",
        answer:
            "There is no tentative deadline as such.You can register anytime but the classes will commence from the month of September 2025",
    },
    {
        id: "f6",
        question: "Are you all planning to cover all Srila Prabhupada books?",
        answer:
            "Yes,currently we are targeting to complete the study of 70 volumes of Srila Prabhupada's books",
    }
];

interface AccordionItemProps {
    item: FAQItem;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
    item,
    isOpen,
    onClick,
}) => {
    return (
        <div
            className="border-b p-5 border-gray-200 hover:bg-yellow-200 cursor-pointer"
            onClick={onClick}
        >
            <div className="w-full flex justify-between items-center text-left font-semibold text-gray-800">
                {item.question}
                <span
                    aria-hidden
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                        }`}
                >
                    <ChevronDown />
                </span>
            </div>
            <div
                id={`panel-${item.id}`}
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
            >
                <p className="text-gray-600 text-sm">{item.answer}</p>
            </div>
        </div>
    );
};

const FAQAccordion: React.FC = () => {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="flex justify-center items-center">
            <div className="max-w-5xl mx-10 bg-yellow-100 shadow-md rounded-2xl my-6 p-6">
                <h2 className="text-xl font-bold text-center mb-6">
                    Frequently Asked Questions
                </h2>
                {faqs.map((item) => (
                    <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openId === item.id}
                        onClick={() => toggleAccordion(item.id)}
                    />
                ))}
            </div>
        </div>

    );
};

export default FAQAccordion;
