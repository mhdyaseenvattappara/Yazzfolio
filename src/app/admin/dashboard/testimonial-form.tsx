
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import type { Testimonial } from '@/lib/data';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { uploadToImgBB } from '@/lib/imgbb';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  title: z.string().min(2, 'Title is required'),
  quote: z.string().min(10, 'Quote is required'),
  imageUrl: z.string().url('A valid image URL is required').optional().or(z.literal('')),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
});

type TestimonialFormValues = z.infer<typeof formSchema>;

interface TestimonialFormProps {
  testimonial: Testimonial | null;
  onSuccess: () => void;
}

export function TestimonialForm({ testimonial, onSuccess }: TestimonialFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: testimonial?.name || '',
      title: testimonial?.title || '',
      quote: testimonial?.quote || '',
      imageUrl: testimonial?.imageUrl || 'https://picsum.photos/seed/portrait/100/100',
      rating: testimonial?.rating || 5,
    },
  });

  const onSubmit = async (values: TestimonialFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
     if (!imageFile && !values.imageUrl) {
        form.setError('imageUrl', { type: 'manual', message: 'An image is required.' });
        return;
    }

    setIsSubmitting(true);
    const testimonialId = testimonial?.id || doc(collection(firestore, `admin_users/${user.uid}/testimonials`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/testimonials`, testimonialId);

    const finishSubmission = (imageUrl: string) => {
        const dataToSave = {
            id: testimonialId,
            adminUserId: user.uid,
            name: values.name,
            title: values.title,
            quote: values.quote,
            imageUrl: imageUrl,
            rating: values.rating,
            updatedAt: serverTimestamp(),
            createdAt: testimonial?.createdAt || serverTimestamp(),
        };

        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        toast({
            title: 'Success!',
            description: `Testimonial has been ${testimonial ? 'updated' : 'created'}.`,
        });
        onSuccess();
        setIsSubmitting(false);
    };
    
    if (imageFile) {
        try {
            setUploadProgress(50);
            const url = await uploadToImgBB(imageFile);
            setUploadProgress(100);
            finishSubmission(url);
        } catch (error: any) {
            setIsSubmitting(false);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: error.message || 'Could not upload image to ImgBB.',
            });
        }
    } else if (values.imageUrl) {
        finishSubmission(values.imageUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Image</FormLabel>
              <FormControl>
                <ImageUpload
                  initialImageUrl={field.value}
                  onFileChange={setImageFile}
                  onUrlChange={(url) => field.onChange(url)}
                  uploadProgress={uploadProgress}
                  isUploading={isSubmitting && !!imageFile}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Title / Company</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => field.onChange(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          star <= (field.value || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {testimonial ? 'Save Changes' : 'Create Testimonial'}
        </Button>
      </form>
    </Form>
  );
}
