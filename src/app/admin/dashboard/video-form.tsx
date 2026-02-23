'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Video } from '@/lib/data';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  videoUrl: z.string().url('A valid video URL is required'),
  thumbnailUrl: z.string().url('A valid thumbnail URL is required').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
});

type VideoFormValues = z.infer<typeof formSchema>;

interface VideoFormProps {
  video: Video | null;
  onSuccess: () => void;
}

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video?.title || '',
      description: video?.description || '',
      videoUrl: video?.videoUrl || '',
      thumbnailUrl: video?.thumbnailUrl || '',
      isFeatured: video?.isFeatured || false,
      order: video?.order || 0,
    },
  });

  const onSubmit = async (values: VideoFormValues) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const videoId = video?.id || doc(collection(firestore, `admin_users/${user.uid}/videos`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/videos`, videoId);

    const finishSubmission = (finalThumbUrl: string) => {
        const dataToSave = {
            id: videoId,
            adminUserId: user.uid,
            ...values,
            thumbnailUrl: finalThumbUrl,
            updatedAt: serverTimestamp(),
            createdAt: video?.createdAt || serverTimestamp(),
        };

        try {
            setDocumentNonBlocking(docRef, dataToSave, { merge: true });
            toast({
                title: video ? 'Video Updated' : 'Video Added',
                description: `"${values.title}" has been saved.`,
            });
            onSuccess();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Save Failed', description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (thumbFile) {
        try {
            setUploadProgress(20);
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(thumbFile);
            });
            setUploadProgress(50);
            const url = await uploadToCloudinary(base64);
            setUploadProgress(100);
            finishSubmission(url);
        } catch (error: any) {
            setIsSubmitting(false);
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        }
    } else {
        finishSubmission(values.thumbnailUrl || '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Thumbnail</FormLabel>
              <FormControl>
                <ImageUpload
                  initialImageUrl={field.value}
                  onFileChange={setThumbFile}
                  onUrlChange={(url) => field.onChange(url)}
                  uploadProgress={uploadProgress}
                  isUploading={isSubmitting && !!thumbFile}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Reel 2024 / Product Promo..." {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direct Video URL (MP4 / YT / Vimeo)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormDescription>Link to your video file or host.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this video about?" {...field} className="min-h-[100px] rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border">
            <div className="space-y-0.5">
                <FormLabel className="text-base">Featured on Landing Page</FormLabel>
                <FormDescription>Show this video prominently on the main site.</FormDescription>
            </div>
            <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-12 rounded-full">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
          {video ? 'Update Video' : 'Add to Gallery'}
        </Button>
      </form>
    </Form>
  );
}
