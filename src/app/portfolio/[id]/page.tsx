'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, limit, getDocs } from 'firebase/firestore';
import { useState, useEffect, use } from 'react';
import { PortfolioItemView } from './portfolio-item-view';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { PortfolioItem } from '@/lib/data';
import { projectsData as fallbackProjects } from '@/lib/data';

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id as string;
  const firestore = useFirestore();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    const findAdmin = async () => {
      if (!firestore) return;
      try {
        const adminUsersRef = collection(firestore, 'admin_users');
        const q = query(adminUsersRef, limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setAdminId(snapshot.docs[0].id);
        } else {
            setAdminId('fallback');
        }
      } catch (err) {
        console.error("Error finding admin:", err);
        setAdminId('fallback');
      } finally {
        setIsSearching(false);
      }
    };
    findAdmin();
  }, [firestore]);

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !adminId || adminId === 'fallback' || !id) return null;
    return doc(firestore, `admin_users/${adminId}/portfolio_items`, id);
  }, [firestore, adminId, id]);

  const { data: projectFromDb, isLoading } = useDoc<PortfolioItem>(projectRef);

  // Determine the final project data: prefer DB, then check fallback list
  const project = projectFromDb || (adminId === 'fallback' || (!isLoading && !projectFromDb) ? fallbackProjects.find(p => p.id === id) : null);

  if (isSearching || (isLoading && adminId !== 'fallback')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4">
        <h1 className="text-2xl font-black">Project Not Found</h1>
        <p className="text-muted-foreground">The requested work could not be located in our archive.</p>
      </div>
    );
  }

  return <PortfolioItemView project={project as PortfolioItem} />;
}
