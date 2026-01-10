"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
    id: number;
    text: string;
    sender: "bot" | "user";
};

const FAQ_OPTIONS = [
    { q: "How do I calculate GPA?", a: "Go to the 'GPA Calculator' page, select your grades for each subject, and click 'Calculate GPA'." },
    { q: "What is a passing grade?", a: "A 'C' grade (2.0) or higher is a pass. 'D' is a conditional pass, and 'E' is a fail." },
    { q: "Total credits for BSE?", a: "You need a total of 125 credits to graduate from the Bachelor of Software Engineering programme." },
    { q: "How to check eligibility?", a: "Use the 'Eligibility Check' tool in your dashboard to see if you qualify for the next level or graduation." },
    { q: "Forgot password?", a: "Please contact the OUSL IT support or ask an Admin to reset your password." },
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hi! I'm your OUSL Assistant. How can I help you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), text: text, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Response Logic
        setTimeout(() => {
            let botText = "I'm not sure about that. Try asking about 'GPA', 'Credits', 'Eligibility', or 'Prerequisites'.";
            const lowerInput = text.toLowerCase();

            // Check if it matches an FAQ exactly first (for chip clicks)
            const faq = FAQ_OPTIONS.find(f => f.q === text);
            if (faq) {
                botText = faq.a;
            } else {
                // Heuristic matching
                if (lowerInput.includes("gpa")) {
                    botText = "Your GPA is calculated based on your grades and credit values. You can use the GPA Calculator in your dashboard to track it.";
                } else if (lowerInput.includes("credit") || lowerInput.includes("deficiency")) {
                    botText = "You need 125 credits to graduate. Check the 'Credit Deficiency' page to see what you're missing.";
                } else if (lowerInput.includes("eligibility") || lowerInput.includes("graduate")) {
                    botText = "To graduate, you need to complete all compulsory courses, the final project, and industrial training.";
                } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
                    botText = "Hello there! Ready to plan your semester?";
                } else if (lowerInput.includes("prerequisite") || lowerInput.includes("pre-req")) {
                    botText = "Prerequisites are courses you must complete before taking advanced ones. The system will warn you if you select a course without meeting them.";
                } else if (lowerInput.includes("save") || lowerInput.includes("data")) {
                    botText = "Your data is saved automatically when you use the GPA Calculator. You can access it anytime you log in.";
                }
            }

            const botMsg: Message = { id: Date.now() + 1, text: botText, sender: "bot" };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 border border-gray-100 overflow-hidden animate-blob transition-all duration-300 transform origin-bottom-right flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold">OUSL Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-tl-none shadow-sm p-3 text-sm flex gap-1">
                                    <span className="animate-bounce">●</span>
                                    <span className="animate-bounce animation-delay-200">●</span>
                                    <span className="animate-bounce animation-delay-400">●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* FAQ Chips */}
                    <div className="p-2 bg-gray-50 border-t border-gray-100 overflow-x-auto flex gap-2 no-scrollbar">
                        {FAQ_OPTIONS.map((faq, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(faq.q)}
                                className="whitespace-nowrap bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                {faq.q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={() => handleSend()}
                            className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-md"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-2xl"
            >
                {isOpen ? "✕" : "💬"}
            </button>
        </div>
    );
}
