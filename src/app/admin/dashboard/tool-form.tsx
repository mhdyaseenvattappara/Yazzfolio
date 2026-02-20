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
  icon: z.string().optional(),
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
      form.clearErrors('icon');

      if (newType === 'custom') {
          const current = form.getValues('icon') || '';
          const isUrl = current.startsWith('http') || current.startsWith('data:');
          if (!isUrl) {
              if (tool?.icon && (tool.icon.startsWith('http') || tool.icon.startsWith('data:'))) {
                  form.setValue('icon', tool.icon);
              } else {
                  form.setValue('icon', '');
              }
          }
      } else {
          setImageFile(null);
          const current = form.getValues('icon') || '';
          if (current.startsWith('http')) {
              form.setValue('icon', '');
          }
      }
  }

  const onSubmit = async (values: ToolFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const currentIconValue = values.icon || '';
    const hasCustomUrl = currentIconValue.startsWith('http') || currentIconValue.startsWith('data:');
    
    if (iconType === 'custom' && !imageFile && !hasCustomUrl) {
        form.setError('icon', { message: 'Please upload an image for custom tool icon.' });
        return;
    }

    if (iconType === 'preset' && !currentIconValue) {
        form.setError('icon', { message: 'Please select an icon from the library.' });
        return;
    }

    setIsSubmitting(true);
    let finalIcon = currentIconValue;

    try {
        if (iconType === 'custom' && imageFile) {
            setUploadProgress(20);
            const uploadedUrl = await uploadToImgBB(imageFile, (p) => setUploadProgress(20 + (p * 0.8)));
            finalIcon = uploadedUrl;
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
          description: `"${values.name}" has been ${tool ? 'updated' : 'added'} successfully.`,
        });
        onSuccess();
    } catch (error: any) {
        console.error("Tool Save Error:", error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message || 'Could not write to database.',
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
              <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Tool Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Adobe Illustrator" {...field} className="h-12 rounded-xl bg-muted/20 border-border/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
            <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Software Icon</FormLabel>
            <Tabs value={iconType} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 mb-4 bg-muted/30">
                    <TabsTrigger value="preset" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Palette className="w-4 h-4" /> Library
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
                                value={field.value && availableIcons.includes(field.value) ? field.value : ''}
                            >
                                <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/50">
                                    <SelectValue placeholder="Select from library..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[300px] rounded-xl">
                                {availableIcons.map(iconName => {
                                    const IconComponent = toolIconMap[iconName];
                                    return (
                                        <SelectItem key={iconName} value={iconName} className="rounded-lg py-3">
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
                        initialImageUrl={iconType === 'custom' && form.getValues('icon')?.startsWith('http') ? form.getValues('icon') : null}
                        onFileChange={setImageFile}
                        onUrlChange={(url) => {
                            form.setValue('icon', url);
                            form.clearErrors('icon');
                        }}
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

        <Button type="submit" disabled={isSubmitting} className="h-14 rounded-2xl text-lg font-black tracking-tight shadow-xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all">
          {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
          ) : (
              tool ? 'Update Tool' : 'Add to Stack'
          )}
        </Button>
      </form>
    </Form>
  );
}