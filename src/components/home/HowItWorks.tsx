import { Wallet, Settings, Rocket, ImageIcon } from 'lucide-react';

const STEPS = [
    {
        icon: Wallet,
        title: 'Connect Your Wallet',
        description: 'Use Phantom, Solflare or any other Solana wallet to connect to the platform.'
    },
    {
        icon: Settings,
        title: 'Configure Your Token',
        description: 'Enter the name, symbol, supply and decimals for your new meme coin.'
    },
    {
        icon: ImageIcon,
        title: 'Add Branding',
        description: 'Upload your token logo and add a description to make it stand out.'
    },
    {
        icon: Rocket,
        title: 'Launch Instantly',
        description: 'Deploy your token to the Solana blockchain in one click for ~0.02 SOL.'
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        How it works
                    </h2>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Launching a meme coin used to be hard. We made it simple.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connection Line (Desktop only) */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border -z-10" />

                    {STEPS.map((step, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center space-y-4 group">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-2xl bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_30px_-5px_rgba(92,2,228,0.3)] transition-all duration-300">
                                    <step.icon className="h-10 w-10 text-primary" />
                                </div>
                                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-text-muted">
                                    {i + 1}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white pt-4">{step.title}</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
