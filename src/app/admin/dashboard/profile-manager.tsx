
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { AdminProfile } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { uploadToImgBB } from '@/lib/imgbb';

const MAX_BIO_LENGTH = 500;

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  bio: z.string().min(10, 'Bio is required').max(MAX_BIO_LENGTH, `Bio must be ${MAX_BIO_LENGTH} characters or less.`),
  address: z.string().optional(),
  profileImageUrl: z.string().url('A valid image URL is required').optional().or(z.literal('')),
  email: z.string().email('A valid email is required'),
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileManagerProps {
  profile: AdminProfile | null;
}

export function ProfileManager({ profile }: ProfileManagerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      address: profile?.address || '',
      profileImageUrl: profile?.profileImageUrl || '',
      email: profile?.email || user?.email || '',
    },
  });

  const bioValue = form.watch('bio');
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
     if (!imageFile && !values.profileImageUrl) {
        form.setError('profileImageUrl', { type: 'manual', message: 'An image is required.' });
        return;
    }

    setIsSubmitting(true);
    const docRef = doc(firestore, `admin_users`, user.uid);
    
    const finishSubmission = (imageUrl: string) => {
        const dataToSave = {
            id: user.uid,
            username: user.email,
            name: values.name,
            bio: values.bio,
            address: values.address || '',
            profileImageUrl: imageUrl,
            email: values.email,
            updatedAt: serverTimestamp(),
            createdAt: profile ? (profile as any).createdAt : serverTimestamp(),
        };

        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        toast({
            title: 'Success!',
            description: `Profile has been updated.`,
        });
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
    } else if (values.profileImageUrl) {
        finishSubmission(values.profileImageUrl);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Manage Profile</CardTitle>
            <CardDescription>Update your public-facing profile and business details.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image / Logo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          initialImageUrl={field.value}
                          onFileChange={setImageFile}
                          onUrlChange={(url) => field.onChange(url)}
                          uploadProgress={uploadProgress}
                          isUploading={isSubmitting && !!imageFile}
                          aspectRatio={1}
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
                    <FormLabel>Full Name / Business Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                        <Textarea {...field} className="min-h-[120px]" />
                    </FormControl>
                     <div className="flex justify-between items-center">
                        <FormMessage />
                        <p className={cn("text-sm text-muted-foreground ml-auto", bioValue.length > MAX_BIO_LENGTH ? "text-destructive" : "text-muted-foreground")}>
                            {bioValue.length}/{MAX_BIO_LENGTH}
                        </p>
                    </div>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Business Address (For Invoices)</FormLabel>
                    <FormControl>
                        <Textarea {...field} placeholder="Enter your business address for invoices..." className="min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="your.email@example.com" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
