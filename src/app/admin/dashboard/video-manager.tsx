'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2, Video as VideoIcon, Star } from 'lucide-react';
import { collection, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Video } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VideoForm } from './video-form';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export function VideoManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const videosCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `admin_users/${user.uid}/videos`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection<Video>(videosCollectionRef);

  const handleAddNew = () => {
    setEditingVideo(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleDelete = (videoId: string) => {
    if (!user || !firestore) return;
    if (confirm('Delete this video from the archive?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/videos`, videoId);
      deleteDoc(docRef)
        .then(() => {
            toast({ title: 'Video Removed' });
        })
        .catch((error) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        });
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Motion Archive</h2>
                <p className="text-muted-foreground text-sm">Manage your video reel and featured presentations.</p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="rounded-full shadow-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Video
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editingVideo ? 'Modify Reel' : 'Add New Reel'}</DialogTitle>
                </DialogHeader>
                <VideoForm
                    video={editingVideo}
                    onSuccess={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
        
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="font-bold w-[120px]">Thumbnail</TableHead>
                    <TableHead className="font-bold">Identity</TableHead>
                    <TableHead className="text-center font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingVideos ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-32">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
                ) : videos && videos.length > 0 ? (
                videos.map((video) => (
                    <TableRow key={video.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                            <div className="h-16 w-24 relative bg-black rounded-lg overflow-hidden border">
                                {video.thumbnailUrl ? (
                                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full">
                                        <VideoIcon className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-bold block">{video.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{video.videoUrl}</span>
                        </TableCell>
                        <TableCell className="text-center">
                            {video.isFeatured ? (
                                <Badge className="bg-primary text-primary-foreground gap-1.5 rounded-full px-3 py-1 font-black uppercase text-[9px] tracking-widest">
                                    <Star className="h-3 w-3 fill-current" />
                                    Featured
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-widest font-bold text-muted-foreground/50">Gallery</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(video)} className="h-8 w-8 rounded-full">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive rounded-full h-8 w-8" onClick={() => handleDelete(video.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-48 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <VideoIcon className="h-10 w-10 opacity-20" />
                            <p className="font-medium">No videos in your archive yet.</p>
                            <Button variant="outline" size="sm" onClick={handleAddNew} className="mt-2 rounded-full">Initialize Motion Reels</Button>
                        </div>
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
