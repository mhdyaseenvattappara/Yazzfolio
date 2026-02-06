'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is unavailable.'});
        setIsLoading(false);
        return;
    }

    try {
        // Step 1: Attempt standard sign-in
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
            title: 'Welcome Back',
            description: "Successfully authenticated.",
        });
        router.push('/admin/dashboard');

    } catch (error: any) {
        // Step 2: Handle Bootstrap/Creation logic
        // Modern Firebase returns 'auth/invalid-credential' for both wrong pass and user not found
        // or 'auth/user-not-found' in legacy mode.
        const isNewUserError = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found';
        
        if (isNewUserError) {
            try {
                // Attempt to auto-create the account (Bootstrap mechanism)
                await createUserWithEmailAndPassword(auth, values.email, values.password);
                toast({
                    title: 'Admin Account Initialized',
                    description: "Your credentials have been registered.",
                });
                router.push('/admin/dashboard');
            } catch (createError: any) {
                // If creation fails with 'email-already-in-use', the password was simply wrong
                if (createError.code === 'auth/email-already-in-use') {
                    toast({
                        variant: 'destructive',
                        title: 'Authentication Failed',
                        description: 'Incorrect password for this existing admin account.',
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Bootstrap Error',
                        description: createError.message || 'Could not verify credentials.',
                    });
                }
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Connection Issue',
                description: 'Failed to reach authentication servers. Please try again.',
            });
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 h-20 w-20 relative overflow-hidden rounded-full ring-4 ring-primary/10">
            <Image
                src="/my-photo.jpg"
                alt="Admin"
                fill
                className="object-cover grayscale"
                priority
            />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Vanguard Portal
          </CardTitle>
          <CardDescription>
            Management tools access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@vanguard.io"
                          {...field}
                          autoComplete="email"
                          className="h-12 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                          <FormControl>
                              <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  {...field}
                                  className="pr-10 h-12 rounded-xl"
                                  autoComplete="current-password"
                              />
                          </FormControl>
                          <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-semibold rounded-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isLoading ? 'Verifying...' : 'Sign In'}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-50">
                Studio Security v1.2
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
