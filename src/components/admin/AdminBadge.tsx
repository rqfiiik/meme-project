'use client';

import { useEffect, useState } from 'react';

export function AdminBadge() {
    const [isAdminBypass, setIsAdminBypass] = useState(false);

    useEffect(() => {
        fetch('/api/admin/status')
            .then(res => res.json())
            .then(data => {
                if (data.bypass) setIsAdminBypass(true);
            })
            .catch(() => { });
    }, []);

    if (!isAdminBypass) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg font-bold border-2 border-white animate-pulse">
            ADMIN BYPASS MODE
        </div>
    );
}
