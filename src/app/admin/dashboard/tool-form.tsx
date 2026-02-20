
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
import { Loader2, Palette, Upload } from 'lucide-react';
import type { Tool } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toolIconMap } from '@/components/tool-icons';
import { useEffect, useState } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadToImgBB } from '@/lib/imgbb';

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

  const [iconType, setIconType] = useState<'preset' | 'custom'>(
    tool?.icon && (tool.icon.startsWith('http') || tool.icon.startsWith('data:')) ? 'custom' : 'preset'
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tool?.name || '',
      icon: tool?.icon || '',
    },
  });

  const toolName = form.watch('name');

  // Auto-suggest logic: only runs when in preset mode and name changes
  useEffect(() => {
    if (toolName && iconType === 'preset' && !tool) {
      const lowerCaseToolName = toolName.toLowerCase();
      const foundIcon = availableIcons.find(icon => 
        lowerCaseToolName.includes(icon.toLowerCase())
      );
      
      if (foundIcon) {
        if (form.getValues('icon') !== foundIcon) {
          form.setValue('icon', foundIcon, { shouldValidate: true });
        }
      }
    }
  }, [toolName, form, iconType, tool]);

  const handleTabChange = (val: string) => {
      const newType = val as 'preset' | 'custom';
      setIconType(newType);
      
      // If we switch to custom and don't have a URL, but the tool previously had one, restore it
      if (newType === 'custom') {
          const current = form.getValues('icon');
          const isUrl = current.startsWith('http') || current.startsWith('data:');
          if (!isUrl && tool?.icon && (tool.icon.startsWith('http') || tool.icon.startsWith('data:'))) {
              form.setValue('icon', tool.icon);
          }
      }
  }

  const onSubmit = async (values: ToolFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    // Check if we are in custom mode but have no image or URL
    if (iconType === 'custom' && !imageFile && !values.icon.startsWith('http')) {
        form.setError('icon', { message: 'Please upload an image for custom tool icon.' });
        return;
    }

    setIsSubmitting(true);
    let finalIcon = values.icon;

    try {
        if (iconType === 'custom' && imageFile) {
            setUploadProgress(20);
            finalIcon = await uploadToImgBB(imageFile, (p) => setUploadProgress(20 + (p * 0.8)));
        }

        const toolId = tool?.id || doc(collection(firestore, `admin_users/${user.uid}/tools`)).id;
        const docRef = doc(firestore, `admin_users/${user.uid}/tools`, toolId);
        
        const dataToSave = {
          id: toolId,
          adminUserId: user.uid,
          name: values.name,
          icon: finalIcon,
          updatedAt: serverTimestamp(),
          createdAt: tool?.createdAt || serverTimestamp(),
        };

        await setDoc(docRef, dataToSave, { merge: true });
        toast({
          title: 'Success!',
          description: `Tool has been ${tool ? 'updated' : 'created'}.`,
        });
        onSuccess();
    } catch (error: any) {
        console.error("Tool Save Error:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not save the tool.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Figma, Webflow..." {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
            <FormLabel>Software Icon</FormLabel>
            <Tabs value={iconType} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-4">
                    <TabsTrigger value="preset" className="rounded-lg gap-2">
                        <Palette className="w-4 h-4" /> Library
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="rounded-lg gap-2">
                        <Upload className="w-4 h-4" /> Custom Upload
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preset" className="mt-0">
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value} 
                                value={availableIcons.includes(field.value) ? field.value : ''}
                            >
                                <FormControl>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Select from library..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px]">
                                {availableIcons.map(iconName => {
                                    const IconComponent = toolIconMap[iconName];
                                    return (
                                        <SelectItem key={iconName} value={iconName}>
                                            <div className="flex items-center gap-3">
                                                <IconComponent className="h-5 w-5" />
                                                <span className="font-medium">{iconName}</span>
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
                </TabsContent>

                <TabsContent value="custom" className="mt-0">
                    <ImageUpload
                        initialImageUrl={iconType === 'custom' && form.getValues('icon').startsWith('http') ? form.getValues('icon') : null}
                        onFileChange={setImageFile}
                        onUrlChange={(url) => form.setValue('icon', url)}
                        uploadProgress={uploadProgress}
                        isUploading={isSubmitting && !!imageFile}
                        aspectRatio={1}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={() => (
                            <FormItem>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </TabsContent>
            </Tabs>
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl text-lg font-bold shadow-lg">
          {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
          ) : (
              tool ? 'Update Tool' : 'Add to Stack'
          )}
        </Button>
      </form>
    </Form>
  );
}
