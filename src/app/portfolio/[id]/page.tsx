
import { getUnauthenticatedFirestore } from '@/firebase/server-auth';
import type { PortfolioItem } from '@/lib/data';
import { projectsData as fallbackProjects } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Timestamp } from 'firebase-admin/firestore';
import { PortfolioItemView } from './portfolio-item-view';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const firestoreParams: { id: string }[] = [];
  try {
    const db = getUnauthenticatedFirestore();
    const adminUsersSnapshot = await db.collection('admin_users').limit(1).get();
    
    if (!adminUsersSnapshot.empty) {
      const adminUserId = adminUsersSnapshot.docs[0].id;
      const portfolioSnapshot = await db.collection(`admin_users/${adminUserId}/portfolio_items`).get();
      
      if (!portfolioSnapshot.empty) {
        portfolioSnapshot.docs.forEach(doc => {
          firestoreParams.push({ id: doc.id });
        });
      }
    }
  } catch (error) {
    console.error("Error fetching Firestore params for portfolio:", error);
  }

  const fallbackParams = fallbackProjects.map(project => ({
    id: project.id,
  }));
  
  const allParams = [...firestoreParams, ...fallbackParams];
  const uniqueParams = Array.from(new Map(allParams.map(p => [p.id, p])).values());

  return uniqueParams;
}

async function getProject(id: string): Promise<PortfolioItem | null> {
    try {
        const db = getUnauthenticatedFirestore();
        const adminUsersSnapshot = await db.collection('admin_users').limit(1).get();
        
        if (!adminUsersSnapshot.empty) {
            const adminUserId = adminUsersSnapshot.docs[0].id;
            const projectDoc = await db.collection(`admin_users/${adminUserId}/portfolio_items`).doc(id).get();

            if (projectDoc.exists) {
                const data = projectDoc.data() as PortfolioItem;
                const convertTimestamp = (ts: any) => {
                    if (ts instanceof Timestamp) {
                        return ts.toDate().toISOString();
                    }
                    return ts;
                };

                return {
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt),
                } as unknown as PortfolioItem;
            }
        }
    } catch (error) {
        console.error(`Failed to fetch project ${id}:`, error);
    }

    const project = fallbackProjects.find(p => p.id === id);
    return project ? project as unknown as PortfolioItem : null;
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <PortfolioItemView project={project} />;
}
