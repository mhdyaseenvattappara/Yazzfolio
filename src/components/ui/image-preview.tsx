'use client';

import { X, ArrowRight, Share2, Info, Heart, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { PortfolioItem } from '@/lib/data';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, increment, collection, query, limit, getDocs, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

interface ImagePreviewProps {
  project: PortfolioItem | null;
  onClose: () => void;
}

interface LoveParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
}

const COMEDY_MESSAGES = [
    "Nice try, Flash! ⚡",
    "Error 404: Dislike Not Found 🕵️",
    "Keyboard warrior? I think not! ⌨️",
    "Are you clicking with your eyes closed? 🙈",
    "I'm faster than your internet! 🚀",
    "Like button is feeling lonely... 🥺",
    "Your mouse needs a workout! 🏋️",
    "Try the red button, it loves you! ❤️",
    "Oops! Did I do that? 🤓",
    "You can't catch the visual ninja! 🥷"
];

export function ImagePreview({ project, onClose }: ImagePreviewProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [particles, setParticles] = useState<LoveParticle[]>([]);
  const [userIp, setUserIp] = useState<string | null>(null);
  const [isLoadingIp, setIsLoadingIp] = useState(false);
  
  // Carousel State
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Prank Dislike State
  const [dislikeOffset, setDislikeOffset] = useState({ x: 0, y: 0 });
  const [funnyMessage, setFunnyMessage] = useState("");
  const [escapeCount, setEscapeCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const dislikeContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user IP
  useEffect(() => {
    setIsLoadingIp(true);
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setUserIp(data.ip);
        setIsLoadingIp(false);
      })
      .catch(() => {
        setIsLoadingIp(false);
      });
  }, []);

  useEffect(() => {
    if (project && firestore && userIp) {
        setLikesCount(project.likes || 0);
        const likeId = `${project.id}_${userIp.replace(/\./g, '_')}`;
        const likeRef = doc(firestore, 'project_likes', likeId);
        getDoc(likeRef).then(snap => setIsLiked(snap.exists()));

        // Reset prank
        setDislikeOffset({ x: 0, y: 0 });
        setEscapeCount(0);
        setFunnyMessage("");
        setShowMessage(false);
    }
  }, [project, firestore, userIp]);

  const sortedTags = useMemo(() => {
    if (!project?.tags) return [];
    return [...project.tags].sort((a, b) => a.length - b.length);
  }, [project?.tags]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dislikeContainerRef.current || !modalContainerRef.current) return;

    const btnRect = dislikeContainerRef.current.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(e.clientX - btnCenterX, 2) + Math.pow(e.clientY - btnCenterY, 2)
    );

    // Escape zone: when mouse is close, jump away
    if (distance < 100) {
      const angle = Math.atan2(btnCenterY - e.clientY, btnCenterX - e.clientX);
      const moveDistance = 150; 
      
      let newX = dislikeOffset.x + Math.cos(angle) * moveDistance;
      let newY = dislikeOffset.y + Math.sin(angle) * moveDistance;

      // Keep within reasonable bounds of the modal
      const limitDist = 220;
      if (Math.abs(newX) > limitDist) newX = (newX / Math.abs(newX)) * limitDist * -0.4;
      if (Math.abs(newY) > limitDist) newY = (newY / Math.abs(newY)) * limitDist * -0.4;

      setDislikeOffset({ x: newX, y: newY });
      
      setEscapeCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
              if (!showMessage) {
                const msg = COMEDY_MESSAGES[Math.floor(Math.random() * COMEDY_MESSAGES.length)];
                setFunnyMessage(msg);
                setShowMessage(true);
              }
              if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
              messageTimeoutRef.current = setTimeout(() => setShowMessage(false), 3000);
          }
          return next;
      });
    }
  }, [dislikeOffset, showMessage]);
  
  const createParticles = useCallback(() => {
    const newParticles: LoveParticle[] = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        size: Math.random() * 6 + 10,
        delay: Math.random() * 0.1
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firestore || !project || !userIp) return;

    const likeId = `${project.id}_${userIp.replace(/\./g, '_')}`;
    const likeRef = doc(firestore, 'project_likes', likeId);

    try {
        const adminUsersRef = collection(firestore, 'admin_users');
        const q = query(adminUsersRef, limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;
        const adminUserId = snapshot.docs[0].id;
        const projectRef = doc(firestore, `admin_users/${adminUserId}/portfolio_items`, project.id);

        if (isLiked) {
            setIsLiked(false);
            setLikesCount(prev => Math.max(0, prev - 1));
            await deleteDoc(likeRef);
            updateDoc(projectRef, { likes: increment(-1) });
            toast({ title: 'Appreciation removed' });
        } else {
            createParticles();
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
            await setDoc(likeRef, { projectId: project.id, ipAddress: userIp, createdAt: serverTimestamp() });
            updateDoc(projectRef, { likes: increment(1) });
            toast({ title: 'Appreciated!' });
        }
    } catch (err) {
        console.error(err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/portfolio/${project?.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: project?.title, url: shareUrl }); } catch (error) {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link Copied' });
    }
  };

  if (!project) return null;

  const allImages = [project.imageUrl, ...(project.gallery?.map(g => g.imageUrl) || [])];

  return (
    <div 
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300 p-2 sm:p-4 cursor-pointer overflow-y-auto"
        onClick={onClose}
        onMouseMove={handleMouseMove}
    >
      <div 
        ref={modalContainerRef}
        className="relative w-full max-w-5xl h-fit max-h-[95vh] shadow-2xl rounded-[2.5rem] border border-border/50 bg-card cursor-default flex flex-col md:flex-row animate-in zoom-in-95 duration-500 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel Side */}
        <div className="w-full md:w-[50%] min-h-[400px] md:h-auto bg-[#1a1a1a] relative overflow-hidden border-b md:border-b-0 md:border-r border-border/50 shrink-0 flex items-center justify-center z-10 rounded-t-[2.5rem] md:rounded-tr-none md:rounded-l-[2.5rem]">
            <Carousel setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                    {allImages.map((url, idx) => (
                        <CarouselItem key={idx} className="relative aspect-square md:aspect-[4/5] lg:aspect-square w-full p-4 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <Image
                                    src={url}
                                    alt={`${project.title} - ${idx}`}
                                    fill
                                    className="object-contain transition-transform duration-1000 hover:scale-105"
                                    priority={idx === 0}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                {allImages.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-4 flex items-center">
                            <CarouselPrevious className="static h-10 w-10 rounded-full border-none bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-xl" />
                        </div>
                        <div className="absolute inset-y-0 right-4 flex items-center">
                            <CarouselNext className="static h-10 w-10 rounded-full border-none bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-xl" />
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white tracking-widest uppercase shadow-2xl">
                            {current} / {count}
                        </div>
                    </>
                )}
            </Carousel>
            <button onClick={onClose} className="md:hidden absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center z-50">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Details Side - Restructured for No-Clip interactions */}
        <div className="w-full md:w-[50%] flex flex-col bg-card relative z-20 overflow-visible">
            {/* Header (Fixed) */}
            <div className="hidden md:flex p-5 border-b border-border/50 justify-between items-center bg-muted/5 shrink-0 overflow-visible">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Project Preview
                </div>
                <button onClick={onClose} className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-all">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Scrollable Content (Description) */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto no-scrollbar flex-grow">
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {sortedTags.slice(0, 4).map(tag => (
                            <span key={tag} className="text-[9px] font-manjari font-bold uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/5 flex items-center justify-center text-center">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter leading-[1.1] text-foreground">
                        {project.title}
                    </h2>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Overview</p>
                    <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                        {project.description}
                    </p>
                </div>
            </div>

            {/* Fixed Interaction Area (CRITICAL: No overflow-y-auto here) */}
            <div className="p-6 sm:p-8 pt-0 space-y-6 bg-card relative z-[100] overflow-visible border-t border-border/50 md:border-t-0 shrink-0">
                
                {/* Interactions - Absolutely positioned children can now pop out! */}
                <div className="flex items-center gap-6 relative overflow-visible">
                    <div className="flex flex-col items-center gap-1.5 relative overflow-visible">
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            {particles.map(p => (
                                <div key={p.id} className="absolute pointer-events-none animate-float-up text-red-500 z-50"
                                    style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, fontSize: `${p.size}px`, animationDelay: `${p.delay}s` }}>
                                    <Heart className="fill-current" />
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleLike}
                            disabled={!userIp || isLoadingIp}
                            className={cn("flex items-center justify-center h-12 w-12 rounded-full border-2 transition-all duration-300",
                                isLiked ? "bg-red-500 border-red-500 text-white scale-110 shadow-xl" : "border-border hover:border-red-500 hover:text-red-500 hover:bg-red-50/50")}>
                            <Heart className={cn("h-5 w-5 transition-transform", isLiked && "fill-current")} />
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                        </span>
                    </div>

                    <div 
                        ref={dislikeContainerRef}
                        style={{ 
                            transform: `translate3d(${dislikeOffset.x}px, ${dislikeOffset.y}px, 0)`,
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        className="flex flex-col items-center gap-1.5 relative z-[110] overflow-visible"
                    >
                        {/* The Message Box - Fixed Clipping! */}
                        <div className={cn(
                            "absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-[10px] font-black whitespace-nowrap shadow-2xl transition-all duration-300 pointer-events-none z-[120]",
                            showMessage ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"
                        )}>
                            {funnyMessage}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                        </div>

                        <button className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-border bg-card shadow-sm opacity-40 hover:opacity-100 transition-opacity">
                            <ThumbsDown className="h-5 w-5" />
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                            Dislike
                        </span>
                    </div>
                </div>

                <div className="grid gap-3 pt-2">
                    <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-black tracking-tight shadow-lg" asChild>
                        <Link href="/#contact" onClick={onClose}>
                            Let's Collaborate
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] group opacity-60 hover:opacity-100" asChild>
                        <Link href={`/portfolio/${project.id}`} onClick={onClose}>
                            Full Narrative
                            <ArrowRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Share:</span>
                        <button onClick={handleShare} className="h-9 w-9 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-all flex items-center justify-center border border-border/50">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                    <Link href={`/portfolio/${project.id}`} onClick={onClose} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group">
                        <Info className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:underline">Details</span>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
