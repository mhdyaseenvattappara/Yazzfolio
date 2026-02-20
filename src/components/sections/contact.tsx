'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState } from 'react';

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
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-4">Contact Interface</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Let's Create Together</h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                Have a project in mind or just want to say hi? I'd love to hear from you.
              </p>
          </div>
          <Card className="max-w-4xl mx-auto bg-card border-border/50 shadow-2xl">
            <CardContent className="p-6 sm:p-10">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Identity</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all"/>
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
                          <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Digital Address</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all"/>
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
                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Brief / Narrative</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell me about your project..." {...field} className="min-h-[180px] rounded-[2rem] bg-muted/20 border-border/50 focus:border-primary/50 transition-all" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full text-lg py-8 rounded-[2rem] h-16 shadow-xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        Initialize Collaboration
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-32 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">Reach out directly</p>
            <a 
              href="mailto:mhdyaseenvattappara@gmail.com" 
              className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground hover:text-primary transition-all duration-500 tracking-tighter"
            >
              mhdyaseenvattappara@gmail.com
            </a>
            
            <div className="flex justify-center gap-6 mt-16">
                {socialLinks.map((link) => (
                    <Button 
                      asChild 
                      key={link.name} 
                      variant="outline" 
                      size="icon" 
                      className="h-14 w-14 rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 group shadow-lg"
                    >
                        <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                            <link.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
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