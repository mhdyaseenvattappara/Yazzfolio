
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { collection, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { TimelineEvent } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TimelineEventForm } from './timeline-event-form';

export function TimelineManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const timelineCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `admin_users/${user.uid}/timeline_events`), orderBy('year', 'asc'));
  }, [firestore, user]);

  const { data: timelineEvents, isLoading: isLoadingTimeline } = useCollection<TimelineEvent>(timelineCollectionRef);

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = (eventId: string) => {
    if (!user || !firestore) return;
    if (confirm('Are you sure you want to delete this timeline event?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/timeline_events`, eventId);
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success!',
                description: 'Timeline event has been deleted.',
            });
        })
        .catch((error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not delete the timeline event.',
            });
        });
    }
  };

  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Manage Timeline</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                </DialogHeader>
                <TimelineEventForm
                    event={editingEvent}
                    onSuccess={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
        
        <div className="rounded-lg border bg-card">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingTimeline ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                    <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : timelineEvents && timelineEvents.length > 0 ? (
                timelineEvents.map((event) => (
                    <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.year}</TableCell>
                    <TableCell>{event.event}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                    No timeline events found. Add one to get started.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
