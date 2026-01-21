'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
    {
        question: "What is ExitMeme.com?",
        answer: "ExitMeme.com is a no-code platform that allows you to create, mint, and launch your own Solana tokens in seconds. We handle all the complex smart contract interactions for you."
    },
    {
        question: "How much does it cost?",
        answer: "The creation fee is currently 0.1 SOL (limited time offer). Additionally, you'll need a small amount of SOL (~0.02) for the blockchain network fees."
    },
    {
        question: "Is it safe?",
        answer: "Yes, our smart contracts are audited and we prioritize security. You maintain full ownership (Mint Authority and Freeze Authority) of your tokens unless you choose to revoke them."
    },
    {
        question: "Can I create a Liquidity Pool here?",
        answer: "Absolutely. After creating your token, you can use our 'Create Liquidity Pool' tool to launch a Raydium pool and make your token tradable instantly."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-surface/30">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className="group rounded-xl border border-border bg-background overflow-hidden transition-all hover:border-primary/50"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="flex w-full items-center justify-between p-6 text-left"
                                >
                                    <span className="font-semibold text-white">{faq.question}</span>
                                    {isOpen ? (
                                        <Minus className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Plus className="h-5 w-5 text-text-muted group-hover:text-primary transition-colors" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-6 pb-6 text-text-secondary leading-relaxed border-t border-border/50 pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
