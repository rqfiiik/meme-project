export function AdBanner() {
    return (
        <div className="my-12 p-8 bg-surface border border-border rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Advertisement</span>
            <div className="max-w-md">
                <h3 className="text-xl font-bold text-white mb-2">Launch Your Own Token Today</h3>
                <p className="text-sm text-text-secondary mb-4">
                    Create, mint, and launch a Solana meme coin in seconds with CreateMeme.io.
                </p>
                <a href="/create-token" className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                    Start Now
                </a>
            </div>
        </div>
    );
}
