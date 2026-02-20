'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { socialLinks } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, limit, getDocs } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof formSchema>;

export function Contact() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (!firestore) {
      toast({
        title: 'Error',
        description: 'Firestore is not available. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const adminUsersRef = collection(firestore, 'admin_users');
      const q = query(adminUsersRef, limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Site not configured. No admin user found.");
      }
      const adminUserId = snapshot.docs[0].id;

      const messagesColRef = collection(firestore, `admin_users/${adminUserId}/contact_messages`);
      
      await addDoc(messagesColRef, {
        name: values.name,
        email: values.email,
        message: values.message,
        isRead: false,
        createdAt: serverTimestamp(),
        adminUserId: adminUserId,
      });
      
      toast({
        title: 'Success!',
        description: `Thank you, ${values.name}! Your message has been sent.`,
      });
      form.reset();

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });


  return (
    <section id="contact" ref={ref} className="py-24 sm:py-32 md:py-0 md:min-h-screen md:flex md:items-center">
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn('transition-all duration-1000 ease-out', isInView ? 'animate-blur-reveal' : 'opacity-0')}>
          <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Contact</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Let's Create Together</h2>
              <p className="text-muted-foreground text-lg md:text-xl">
                Have a project in mind or just want to say hi? I'd love to hear from you.
              </p>
          </div>
          <Card className="max-w-4xl mx-auto bg-card border-border/50">
            <CardContent className="p-4 sm:p-8">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} className="py-6 rounded-xl"/>
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} className="py-6 rounded-xl"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell me about your project..." {...field} className="min-h-[150px] rounded-2xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full text-lg py-6 rounded-2xl h-16 shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
           <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-2 text-sm uppercase font-black tracking-widest opacity-50">Reach out directly:</p>
            <a href="mailto:mhdyaseenvattappara@gmail.com" className="text-foreground text-2xl font-black hover:text-primary transition-colors">mhdyaseenvattappara@gmail.com</a>
            <div className="flex justify-center gap-4 mt-8">
                {socialLinks.map((link) => (
                    <Button asChild key={link.name} variant="outline" size="icon" className="h-12 w-12 rounded-full">
                        <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                            <link.icon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        </a>
                    </Button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
