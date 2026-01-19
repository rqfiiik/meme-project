'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function ProfileForm({ user }: { user: any }) {
    const [username, setUsername] = useState(user.username || "");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                    Unique Username
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        className="w-full bg-black/50 border border-border rounded-lg pl-10 p-2 text-white placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>
                <p className="text-xs text-text-muted mt-1">
                    This will be your public identity on the platform.
                </p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {isLoading ? 'Saving...' : 'Save Changes'}
            </button>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
