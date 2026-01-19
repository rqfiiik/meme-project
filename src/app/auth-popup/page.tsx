'use client';

import { useEffect } from 'react';

export default function AuthPopup() {
    useEffect(() => {
        // Send message to parent window
        if (window.opener) {
            window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
            window.close();
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <p>Authentication successful. You can close this window now.</p>
        </div>
    );
}
