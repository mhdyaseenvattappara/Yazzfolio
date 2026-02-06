
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Eye, EyeOff, RefreshCw, Sparkles, Mail } from 'lucide-react';
import { collection, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { ContactMessage } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { draftReply } from '@/ai/flows/draft-reply-flow';

export function InboxManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `admin_users/${user.uid}/contact_messages`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: messages, isLoading: isLoadingMessages, refetch } = useCollection<ContactMessage>(messagesCollectionRef);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      const docRef = doc(firestore, `admin_users/${user!.uid}/contact_messages`, message.id);
      updateDoc(docRef, { isRead: true });
    }
  };

  const handleAutoReply = async (message: ContactMessage) => {
    setIsDrafting(true);
    try {
      const draft = await draftReply({
        senderName: message.name,
        originalMessage: message.message
      });

      if (draft) {
        const mailtoUrl = `mailto:${message.email}?subject=${encodeURIComponent(draft.replySubject)}&body=${encodeURIComponent(draft.replyBody)}`;
        window.location.href = mailtoUrl;
        toast({
          title: 'Draft Generated',
          description: 'Opening Gmail with your AI-crafted reply.',
        });
      }
    } catch (error) {
      console.error('Auto-reply error:', error);
      toast({
        variant: 'destructive',
        title: 'Drafting Failed',
        description: 'Could not generate an AI reply at this time.',
      });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDelete = (messageId: string) => {
    if (!user || !firestore) return;
    if (confirm('Are you sure you want to delete this message?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/contact_messages`, messageId);
      deleteDoc(docRef)
        .then(() => {
          toast({
            title: 'Success!',
            description: 'Message has been deleted.',
          });
          if(selectedMessage?.id === messageId) {
            setSelectedMessage(null);
          }
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete the message.',
          });
        });
    }
  };

  const toggleReadStatus = (message: ContactMessage) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `admin_users/${user.uid}/contact_messages`, message.id);
    updateDoc(docRef, { isRead: !message.isRead })
      .then(() => {
        toast({
          title: 'Success!',
          description: `Message marked as ${!message.isRead ? 'read' : 'unread'}.`,
        });
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not update message status.',
        });
      });
  };

  const unreadCount = messages?.filter(m => !m.isRead).length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Inbox</CardTitle>
            <div className="text-sm text-muted-foreground">
                You have <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>{unreadCount}</Badge> unread message{unreadCount !== 1 && 's'}.
            </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch?.()}>
            <RefreshCw className="mr-2 h-4 w-4"/>
            Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[180px]">From</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[150px]">Received</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingMessages ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                    <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : messages && messages.length > 0 ? (
                messages.map((message) => (
                    <TableRow key={message.id} className={!message.isRead ? 'font-bold bg-muted/50' : ''}>
                        <TableCell>
                            <div className="flex flex-col">
                                <span>{message.name}</span>
                                <span className={`text-xs ${!message.isRead ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>{message.email}</span>
                            </div>
                        </TableCell>
                        <TableCell 
                            className="max-w-[400px] truncate cursor-pointer"
                            onClick={() => handleViewMessage(message)}
                        >
                            {message.message}
                        </TableCell>
                        <TableCell>
                            {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleAutoReply(message)} disabled={isDrafting}>
                                    {isDrafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleReadStatus(message)}>
                                    {message.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(message.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                    Your inbox is empty.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
            <DialogContent className="sm:max-w-xl">
            {selectedMessage && (
                <>
                    <DialogHeader>
                        <DialogTitle>{selectedMessage.name}</DialogTitle>
                        <DialogDescription>
                            From: <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">{selectedMessage.email}</a>
                            <br />
                            Received: {selectedMessage.createdAt ? formatDistanceToNow(selectedMessage.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted/50 p-4 rounded-md">
                        {selectedMessage.message}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button 
                            variant="default" 
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleAutoReply(selectedMessage)}
                            disabled={isDrafting}
                        >
                            {isDrafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            AI Draft Reply
                        </Button>
                        <Button variant="destructive" onClick={() => { handleDelete(selectedMessage.id); }}>Delete</Button>
                        <Button variant="outline" onClick={() => setSelectedMessage(null)}>Close</Button>
                    </DialogFooter>
                </>
            )}
            </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
