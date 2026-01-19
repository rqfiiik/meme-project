import { Trophy, Users, Zap, Code2 } from 'lucide-react';

const STATS = [
    { label: 'Tokens Created', value: '750+', icon: Trophy },
    { label: 'Active Users', value: '2.5K+', icon: Users },
    { label: 'Total Volume', value: '$12M+', icon: Zap },
    { label: 'Code Required', value: '0%', icon: Code2 },
];

export function Stats() {
    return (
        <section className="py-12 border-y border-border/50 bg-surface/20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center justify-center text-center space-y-2">
                            <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
