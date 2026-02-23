
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
import { Loader2, CheckCircle2, Video, UploadCloud } from 'lucide-react';
import type { Video as VideoType } from '@/lib/data';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState, useRef } from 'react';
import { uploadToImgBB } from '@/lib/imgbb';
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
  video: VideoType | null;
  onSuccess: () => void;
}

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setVideoFile(file);
          // Auto-fill title if empty
          if (!form.getValues('title')) {
              form.setValue('title', file.name.split('.')[0]);
          }
      }
  }

  const onSubmit = async (values: VideoFormValues) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const videoId = video?.id || doc(collection(firestore, `admin_users/${user.uid}/videos`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/videos`, videoId);

    try {
        let finalThumbUrl = values.thumbnailUrl || '';
        let finalVideoUrl = values.videoUrl;

        // 1. Handle Thumbnail Upload (ImgBB)
        if (thumbFile) {
            setUploadProgress(10);
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(thumbFile);
            });
            finalThumbUrl = await uploadToImgBB(base64);
            setUploadProgress(40);
        }

        // 2. Handle Video File Upload (Cloudinary)
        if (videoFile) {
            setUploadProgress(50);
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(videoFile);
            });
            finalVideoUrl = await uploadToCloudinary(base64, 'video');
            setUploadProgress(90);
        }

        // 3. Final Firestore Save
        const dataToSave = {
            id: videoId,
            adminUserId: user.uid,
            ...values,
            videoUrl: finalVideoUrl,
            thumbnailUrl: finalThumbUrl,
            updatedAt: serverTimestamp(),
            createdAt: video?.createdAt || serverTimestamp(),
        };

        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        setUploadProgress(100);
        
        toast({
            title: video ? 'Video Updated' : 'Motion Reel Added',
            description: `"${values.title}" has been saved.`,
        });
        onSuccess();
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
    } finally {
        setIsSubmitting(false);
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
              <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Thumbnail (ImgBB)</FormLabel>
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

        <div className="space-y-3">
            <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Video Asset (Cloudinary)</FormLabel>
            <div 
                className="w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/20 hover:bg-accent/10 transition-all cursor-pointer group"
                onClick={() => videoInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    ref={videoInputRef} 
                    accept="video/*" 
                    onChange={handleVideoFileChange} 
                />
                {videoFile ? (
                    <div className="flex items-center gap-3 text-primary font-bold">
                        <Video className="h-6 w-6" />
                        <span className="truncate max-w-[200px]">{videoFile.name}</span>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setVideoFile(null); }} />
                    </div>
                ) : (
                    <>
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-medium text-muted-foreground">Click to upload .mp4 or .mov</p>
                    </>
                )}
            </div>
            <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Or paste external URL (YT/Vimeo)..." {...field} className="h-10 rounded-xl bg-muted/30" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Title</FormLabel>
              <FormControl>
                <Input placeholder="Reel 2024 / Product Promo..." {...field} className="h-12 rounded-xl" />
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
              <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Brief Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What is this video about?" {...field} className="min-h-[100px] rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
            <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold">Featured Status</FormLabel>
                <FormDescription className="text-[10px] uppercase tracking-wider font-medium">Show prominently on landing page</FormDescription>
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

        {isSubmitting && (
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-primary">
                    <span>Processing & Synchronizing...</span>
                    <span>{uploadProgress}%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
                </div>
            </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="h-14 rounded-2xl text-lg font-black tracking-tight shadow-xl">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
          {video ? 'Update Visual Reel' : 'Publish to Motion Archive'}
        </Button>
      </form>
    </Form>
  );
}
