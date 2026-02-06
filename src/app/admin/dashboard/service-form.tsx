
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
import type { Service } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconMap } from '@/lib/data';

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  icon: z.string().min(1, 'An icon is required'),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  service: Service | null;
  onSuccess: () => void;
}

const availableIcons = Object.keys(iconMap).filter(key => 
  ['Palette', 'Code', 'PenTool', 'Briefcase', 'Star', 'LayoutGrid', 'Cog', 'Pencil', 'Clapperboard', 'Brush', 'MousePointerClick', 'Server', 'Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'InDesign'].includes(key)
);


export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: service?.title || '',
      description: service?.description || '',
      icon: service?.icon || '',
    },
  });

  const onSubmit = (values: ServiceFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const serviceId = service?.id || doc(collection(firestore, `admin_users/${user.uid}/services`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/services`, serviceId);
    
    const dataToSave = {
      id: serviceId,
      adminUserId: user.uid,
      title: values.title,
      description: values.description,
      icon: values.icon,
      updatedAt: serverTimestamp(),
      createdAt: service?.createdAt || serverTimestamp(),
    };

    setDoc(docRef, dataToSave, { merge: true })
      .then(() => {
        toast({
          title: 'Success!',
          description: `Service has been ${service ? 'updated' : 'created'}.`,
        });
        onSuccess();
      })
      .catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not save the service.',
        });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIcons.map(iconName => {
                    const IconComponent = iconMap[iconName];
                    return (
                        <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {iconName}
                            </div>
                        </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {service ? 'Save Changes' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
}
