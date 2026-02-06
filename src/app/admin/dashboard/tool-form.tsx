
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Tool } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toolIconMap } from '@/components/tool-icons';
import { useEffect } from 'react';


const formSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  icon: z.string().min(1, 'An icon is required'),
});

type ToolFormValues = z.infer<typeof formSchema>;

interface ToolFormProps {
  tool: Tool | null;
  onSuccess: () => void;
}

const availableIcons = Object.keys(toolIconMap);

export function ToolForm({ tool, onSuccess }: ToolFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tool?.name || '',
      icon: tool?.icon || '',
    },
  });

  const toolName = form.watch('name');

  useEffect(() => {
    if (toolName) {
      const lowerCaseToolName = toolName.toLowerCase();
      // Find an icon name that is a substring of the input, case-insensitive
      const foundIcon = availableIcons.find(icon => 
        lowerCaseToolName.includes(icon.toLowerCase())
      );
      
      if (foundIcon) {
        // Only set the value if it's not already set to avoid re-renders
        if (form.getValues('icon') !== foundIcon) {
          form.setValue('icon', foundIcon, { shouldValidate: true });
        }
      }
    }
  }, [toolName, form]);

  const onSubmit = (values: ToolFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const toolId = tool?.id || doc(collection(firestore, `admin_users/${user.uid}/tools`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/tools`, toolId);
    
    const dataToSave = {
      id: toolId,
      adminUserId: user.uid,
      name: values.name,
      icon: values.icon,
      updatedAt: serverTimestamp(),
      createdAt: tool?.createdAt || serverTimestamp(),
    };

    setDoc(docRef, dataToSave, { merge: true })
      .then(() => {
        toast({
          title: 'Success!',
          description: `Tool has been ${tool ? 'updated' : 'created'}.`,
        });
        onSuccess();
      })
      .catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not save the tool.',
        });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIcons.map(iconName => {
                    const IconComponent = toolIconMap[iconName];
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
          {tool ? 'Save Changes' : 'Create Tool'}
        </Button>
      </form>
    </Form>
  );
}
