
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is obsolete and now redirects to the admin dashboard.
export default function InvoiceDashboardPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/dashboard');
    }, [router]);
    return null;
}
