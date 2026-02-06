'use client';

import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, CheckCircle2, Wand2, Plus, X, GalleryHorizontal } from 'lucide-react';
import type { PortfolioItem } from '@/lib/data';
import { projectCategories } from '@/lib/data';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState } from 'react';
import { suggestTags } from '@/ai/flows/suggest-tags-flow';
import { analyzeProjectImage } from '@/ai/flows/analyze-project-image-flow';
import { uploadToImgBB } from '@/lib/imgbb';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const galleryItemSchema = z.object({
  imageUrl: z.string().url('A valid image URL is required'),
});

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('A valid image URL is required').optional().or(z.literal('')),
  tags: z.string().min(1, 'At least one tag is required.'),
  gallery: z.array(galleryItemSchema).optional(),
});

type PortfolioFormValues = z.infer<typeof formSchema>;

interface PortfolioItemFormProps {
  project: PortfolioItem | null;
  onSuccess: () => void;
}

export function PortfolioItemForm({ project, onSuccess }: PortfolioItemFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      category: project?.category || 'UI/UX Design',
      imageUrl: project?.imageUrl || '',
      tags: project?.tags.join(', ') || '',
      gallery: project?.gallery || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "gallery"
  });

  const handleAIAnalyze = async () => {
    let imageData: string | null = null;

    if (mainImageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(mainImageFile);
        });
    } else if (form.getValues('imageUrl')) {
        imageData = form.getValues('imageUrl');
    }

    if (!imageData) {
      toast({
        variant: 'destructive',
        title: 'Image Required',
        description: 'Please upload a project image first for AI analysis.',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeProjectImage({ image: imageData });
      if (result) {
        form.setValue('title', result.title, { shouldValidate: true });
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
          title: 'AI Analysis Complete',
          description: 'Suggested title and overview have been applied.',
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: 'destructive',
        title: 'AI analysis failed',
        description: 'Could not analyze the image at this time.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestTags = async () => {
    const title = form.getValues('title');
    const description = form.getValues('description');

    if (!title || !description) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide a title and description for AI analysis.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestTags({ title, description });
      if (result.tags) {
        form.setValue('tags', result.tags.join(', '), { shouldValidate: true });
        toast({
          title: 'AI tags generated',
          description: 'Optimized tags have been applied to your project.',
        });
      }
    } catch (error) {
      console.error('Error suggesting tags:', error);
      toast({
        variant: 'destructive',
        title: 'AI analysis failed',
        description: 'Could not generate tags at this time.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const onSubmit = async (values: PortfolioFormValues) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Session Error', description: 'Your session has expired. Please log in again.' });
        return;
    }
    
    setIsSubmitting(true);

    const projectId = project?.id || doc(collection(firestore, `admin_users/${user.uid}/portfolio_items`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/portfolio_items`, projectId);

    const finishSubmission = (finalImageUrl: string) => {
        const dataToSave = {
            id: projectId,
            adminUserId: user.uid,
            title: values.title,
            description: values.description,
            category: values.category,
            imageUrl: finalImageUrl,
            gallery: values.gallery || [],
            tags: values.tags.split(',').map(tag => tag.trim()).filter(t => t !== ''),
            updatedAt: serverTimestamp(),
            createdAt: project?.createdAt || serverTimestamp(),
            likes: project?.likes || 0,
        };

        try {
            setDocumentNonBlocking(docRef, dataToSave, { merge: true });
            toast({
                title: project ? 'Project Updated' : 'Project Published',
                description: `"${values.title}" has been saved to your portfolio.`,
            });
            onSuccess();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not write project data to the database.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (mainImageFile) {
        try {
            setUploadProgress(10);
            const url = await uploadToImgBB(mainImageFile, (p) => setUploadProgress(10 + (p * 0.9)));
            setUploadProgress(100);
            finishSubmission(url);
        } catch (error: any) {
            setIsSubmitting(false);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'Image host returned an error. Try again.',
            });
        }
    } else if (values.imageUrl) {
        finishSubmission(values.imageUrl);
    } else {
        setIsSubmitting(false);
        form.setError('imageUrl', { type: 'manual', message: 'An image is required.' });
    }
  };

  const handleGalleryImageUpload = async (index: number, file: File) => {
      try {
          const url = await uploadToImgBB(file);
          form.setValue(`gallery.${index}.imageUrl`, url, { shouldValidate: true });
          toast({ title: 'Gallery Image Uploaded', description: 'Item added to carousel.' });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload gallery image.' });
      }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-4 no-scrollbar">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 py-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <div className="mb-2">
                <FormLabel className="text-base font-bold">Visual Asset (Hero)</FormLabel>
              </div>
              <FormControl>
                <ImageUpload
                  initialImageUrl={field.value}
                  onFileChange={setMainImageFile}
                  onUrlChange={(url) => field.onChange(url)}
                  uploadProgress={uploadProgress}
                  isUploading={isSubmitting && !!mainImageFile}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem>
                <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-base font-bold">Project Name</FormLabel>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAIAnalyze}
                        disabled={isAnalyzing || (!mainImageFile && !form.getValues('imageUrl'))}
                        className="h-8 rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all active:scale-95"
                    >
                        {isAnalyzing ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-3 w-3" />
                        )}
                        AI Suggest
                    </Button>
                </div>
                <FormControl>
                    <Input placeholder="Enter project title..." {...field} className="h-12 rounded-xl" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-base font-bold">Categorize Industry</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {projectCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
            <FormItem>
            <FormLabel className="text-base font-bold">Overview</FormLabel>
            <FormControl>
                <Textarea 
                    placeholder="Describe the goals, process, and results..." 
                    {...field} 
                    className="min-h-[150px] resize-none rounded-xl" 
                />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
                <div className="flex items-center justify-between mb-1">
                    <FormLabel className="text-base font-bold">Detailed Skills / Tools</FormLabel>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestTags}
                        disabled={isSuggesting}
                        className="h-8 rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all active:scale-95"
                    >
                        {isSuggesting ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-3 w-3" />
                        )}
                        AI Suggest Tags
                    </Button>
                </div>
              <FormControl>
                <Input {...field} placeholder="e.g. Figma, Webflow, Adobe PS" className="h-12 rounded-xl" />
              </FormControl>
              <FormDescription>Separate multiple tags with commas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GalleryHorizontal className="w-5 h-5 text-primary" />
                    <FormLabel className="text-base font-bold">Project Gallery (Carousel)</FormLabel>
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ imageUrl: '' })}
                    className="rounded-full"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Image
                </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field, index) => (
                    <Card key={field.id} className="relative overflow-hidden group">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Image #{index + 1}</span>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => remove(index)}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <ImageUpload
                                initialImageUrl={form.getValues(`gallery.${index}.imageUrl`)}
                                onFileChange={(file) => file && handleGalleryImageUpload(index, file)}
                                onUrlChange={(url) => form.setValue(`gallery.${index}.imageUrl`, url)}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {fields.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground">
                    No carousel images added.
                </div>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting} className="rounded-full">
                Discard
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-10 h-12 rounded-full">
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? 'Processing...' : project ? 'Update Project' : 'Publish Project'}
            </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
