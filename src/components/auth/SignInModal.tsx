'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { signIn } from 'next-auth/react';
import { X, Mail, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import './SignInModal.css';

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle Open/Close Animation States
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Use setTimeout instead of RAF to ensure browser painting cycle completes
            // providing a small buffer for the 'closing' state (opacity 0) to be rendered first
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Match CSS transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (shouldRender) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [shouldRender]);

    // Handle popup message
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'AUTH_SUCCESS') {
                window.location.reload();
                onClose();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onClose, router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signIn('google', {
                redirect: false,
                callbackUrl: '/auth-popup'
            });

            if (result?.url) {
                const width = 500;
                const height = 600;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;

                window.open(
                    result.url,
                    'google-auth',
                    `width=${width},height=${height},top=${top},left=${left}`
                );
            } else {
                console.error("Failed to get auth URL");
            }
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !shouldRender) return null;

    // Use Portal to render outside of Header stacking context
    return createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center modal-overlay ${isAnimating ? 'open' : 'closing'}`}>
            {/* Backdrop with blur and darken effect - controlled by modal-overlay class now */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 shadow-2xl modal-content ${isAnimating ? 'open' : 'closing'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Sign in to manage your tokens and settings.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        ) : (
                            <>
                                <GoogleIcon className="h-5 w-5" />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a] px-2 text-text-muted">Or continue with</span>
                        </div>
                    </div>


                    {/* Admin/Credentials Form */}
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsLoading(true);

                        const emailInput = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                        const passwordInput = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

                        try {
                            const res = await signIn('credentials', {
                                email: emailInput,
                                password: passwordInput,
                                redirect: false,
                            });

                            if (res?.error) {
                                // Handle error (could show a toast or inline error)
                                console.error(res.error);
                            } else {
                                // Success - close modal and refresh
                                window.location.reload();
                                onClose();
                            }
                        } catch (error) {
                            console.error(error);
                        } finally {
                            setIsLoading(false);
                        }
                    }} className="space-y-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In with Email'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-text-muted">
                    By confirming, you agree to our <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
                </p>
            </div>
        </div>,
        document.body
    );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
