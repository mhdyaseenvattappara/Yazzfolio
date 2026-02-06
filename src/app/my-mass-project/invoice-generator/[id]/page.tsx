'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, limit, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { InvoicePublicView } from './invoice-public-view';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Invoice } from '@/lib/data';

export default function InvoicePublicPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    const findAdmin = async () => {
      if (!firestore) return;
      try {
        const q = query(collection(firestore, 'admin_users'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAdminId(snap.docs[0].id);
        }
      } catch (err) {
        console.error("Error finding admin:", err);
      } finally {
        setIsSearching(false);
      }
    };
    findAdmin();
  }, [firestore]);

  const invoiceRef = useMemoFirebase(() => {
    if (!firestore || !adminId || !id) return null;
    return doc(firestore, `admin_users/${adminId}/invoices`, id as string);
  }, [firestore, adminId, id]);

  const { data: invoice, isLoading } = useDoc<Invoice>(invoiceRef);

  if (isSearching || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4">
        <h1 className="text-2xl font-black">Document Not Found</h1>
        <p className="text-muted-foreground">The requested invoice could not be located in our secure vault.</p>
      </div>
    );
  }

  return <InvoicePublicView invoice={invoice} />;
}