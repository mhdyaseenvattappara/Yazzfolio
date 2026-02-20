'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/use-in-view';
import type { PortfolioItem } from '@/lib/data';
import { Button } from './button';
import { Eye } from 'lucide-react';

type ProjectCardProps = {
  project: PortfolioItem;
  index: number;
  onPreview: (event: React.MouseEvent) => void;
  className?: string;
};

export function ProjectCard({ project, index, onPreview, className }: ProjectCardProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });

  const displayedTags = React.useMemo(() => {
    return [...project.tags]
      .sort((a, b) => a.length - b.length)
      .slice(0, 3);
  }, [project.tags]);

  return (
    <div
      ref={ref}
      className={cn(
        'group relative break-inside-avoid h-full cursor-pointer',
        className
      )}
      onClick={onPreview}
    >
      <div
        className={cn(
            'w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[transform,opacity,filter]',
            isInView 
                ? 'opacity-100 translate-y-0 scale-100 blur-0' 
                : 'opacity-0 translate-y-20 scale-95 blur-md'
        )}
        style={{ 
            transitionDelay: `${(index % 3) * 100}ms`,
        }}
      >
        <Card
            className="relative overflow-hidden transition-all duration-500 ease-in-out bg-[#141414] border-none rounded-[2.5rem] h-full flex flex-col shadow-2xl hover:shadow-primary/10 hover:-translate-y-3"
        >
            <CardHeader className="p-0">
            <div className="relative w-full overflow-hidden aspect-[4/3]">
                <Image
                src={project.imageUrl}
                alt={project.title}
                data-ai-hint={project.imageHint || "portfolio project"}
                fill
                className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
                />
                
                {/* Hover Overlay with Capsule Preview Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="rounded-full border-2 border-white/50 bg-black/30 backdrop-blur-md text-white hover:bg-white/20 hover:text-white transition-all duration-300 py-7 px-10 flex items-center gap-3 shadow-2xl pointer-events-none nav-liquid"
                        >
                            <Eye className="h-6 w-6" />
                            <span className="text-xl font-bold tracking-tight">Preview</span>
                        </Button>
                    </div>
                </div>
            </div>
            </CardHeader>

            <div className="p-8 md:p-10 flex-grow flex flex-col relative">
            <div className="flex justify-between items-start gap-4 mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight">{project.title}</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-auto">
                {displayedTags.map((tag) => (
                <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-white/5 text-white/60 border border-white/10 rounded-full px-4 py-1.5 text-[9px] font-manjari font-bold tracking-[0.15em] uppercase flex items-center justify-center text-center w-fit"
                >
                    {tag}
                </Badge>
                ))}
                {project.tags.length > 3 && (
                    <span className="text-[9px] font-manjari font-bold text-white/30 uppercase tracking-widest ml-1">
                        +{project.tags.length - 3} more
                    </span>
                )}
            </div>
            </div>
        </Card>
      </div>
    </div>
  );
}