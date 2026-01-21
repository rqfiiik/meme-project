'use client';

import { Button } from "@/components/ui/Button";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

export function BlogCTA() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="my-16 md:my-24 bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl shadow-primary/20"
        >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Ready to Launch Your Own Token?
                </h3>
                <p className="text-white/90 text-lg md:text-xl font-medium">
                    Create, mint, and trade your custom meme coin on Solana in less than 30 seconds. No coding required.
                </p>
                <div className="pt-4">
                    <Link href="/create-token">
                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-12 text-base shadow-lg hover:transform hover:scale-105 transition-all">
                            <Rocket className="mr-2 h-5 w-5" />
                            Create Your Coin Now
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-white rounded-full blur-[80px]" />
                <div className="absolute -bottom-[100px] -left-[100px] w-[300px] h-[300px] bg-purple-900 rounded-full blur-[80px]" />
            </div>
        </motion.div>
    );
}
