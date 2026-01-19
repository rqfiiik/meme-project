import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero';
import { Stats } from '@/components/home/Stats';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FAQ } from '@/components/home/FAQ';
import { AnnouncementBar } from '@/components/home/AnnouncementBar';

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <AnnouncementBar />
            <Header />
            <main>
                <Hero />
                <Stats />
                <HowItWorks />
                <FAQ />
            </main>

            {/* Simple Footer */}
            <footer className="py-8 border-t border-border text-center text-text-muted text-sm">
                <p>&copy; 2026 CreateMeme.io. All rights reserved.</p>
            </footer>
        </div>
    );
}
