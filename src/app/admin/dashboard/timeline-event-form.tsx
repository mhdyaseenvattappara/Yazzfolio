
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { TimelineEvent } from '@/lib/data';

const formSchema = z.object({
  year: z.string().min(4, 'Year is required'),
  event: z.string().min(10, 'Event description is required'),
});

type TimelineEventFormValues = z.infer<typeof formSchema>;

interface TimelineEventFormProps {
  event: TimelineEvent | null;
  onSuccess: () => void;
}

export function TimelineEventForm({ event, onSuccess }: TimelineEventFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: event?.year || '',
      event: event?.event || '',
    },
  });

  const onSubmit = (values: TimelineEventFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const eventId = event?.id || doc(collection(firestore, `admin_users/${user.uid}/timeline_events`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/timeline_events`, eventId);
    
    const dataToSave = {
      id: eventId,
      adminUserId: user.uid,
      year: values.year,
      event: values.event,
      updatedAt: serverTimestamp(),
      createdAt: event?.createdAt || serverTimestamp(),
    };

    setDoc(docRef, dataToSave, { merge: true })
      .then(() => {
        toast({
          title: 'Success!',
          description: `Timeline event has been ${event ? 'updated' : 'created'}.`,
        });
        onSuccess();
      })
      .catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not save the timeline event.',
        });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="event"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {event ? 'Save Changes' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
}
