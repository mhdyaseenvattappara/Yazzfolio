'use client';

import type { PortfolioItem } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, User, Briefcase } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Footer } from '@/components/layout/footer';

export function PortfolioItemView({ project }: { project: PortfolioItem | null }) {
  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Navigation Header */}
            <div className="mb-10 flex items-center justify-between">
              <Button asChild variant="ghost" className="rounded-full px-6 -ml-4 hover:bg-accent/50 group">
                <Link href="/portfolio">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Works
                </Link>
              </Button>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest hidden sm:block">
                Project Showcase / {project.id}
              </div>
            </div>

            {/* The "Big Card" Hero */}
            <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700">
              <div className="grid lg:grid-cols-5 min-h-[600px]">
                {/* Visual Side (Left) - Optimized for full image display */}
                <div className="lg:col-span-3 relative bg-[#111] group flex items-center justify-center min-h-[500px] lg:min-h-0">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-contain transition-transform duration-1000 group-hover:scale-105 p-0"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Info Side (Right) */}
                <div className="lg:col-span-2 p-8 md:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border/50 bg-card">
                  <div className="space-y-8">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full px-4 py-1 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border-none">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                        {project.title}
                      </h1>
                      <div className="prose prose-invert max-w-none text-muted-foreground text-lg leading-relaxed line-clamp-6">
                        {project.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border/50">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                          <User className="w-3 h-3" /> My Role
                        </p>
                        <p className="font-semibold text-foreground">{project.role || 'Lead Designer'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> Industry
                        </p>
                        <p className="font-semibold text-foreground">Digital Creative</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg font-bold group">
                        <Link href="/#contact">
                          Start a Project
                          <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown Section */}
            <div className="mt-20 grid md:grid-cols-3 gap-12 px-4">
              <div className="md:col-span-2 space-y-10">
                <section>
                  <h2 className="text-3xl font-black tracking-tight mb-6">The Narrative</h2>
                  <div 
                    className="text-muted-foreground text-xl leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: project.description.replace(/\n/g, '<br />')}} 
                  />
                </section>

                {project.gallery && project.gallery.length > 0 && (
                  <section className="pt-10">
                    <h2 className="text-3xl font-black tracking-tight mb-8">Visual Exploration</h2>
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-4">
                        {project.gallery.map((image, index) => (
                          <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-2/3">
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-border/50 group bg-[#111]">
                              <Image 
                                src={image.imageUrl} 
                                alt={`Gallery ${index + 1}`} 
                                fill 
                                className="object-contain transition-transform duration-700 group-hover:scale-110 p-0" 
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex justify-end gap-2 mt-6">
                        <CarouselPrevious className="static translate-y-0 h-12 w-12" />
                        <CarouselNext className="static translate-y-0 h-12 w-12" />
                      </div>
                    </Carousel>
                  </section>
                )}
              </div>

              <div className="space-y-12">
                <div className="bg-card/50 border border-border/50 p-8 rounded-[2rem] sticky top-24">
                  <h3 className="text-xl font-black mb-6">Execution Stack</h3>
                  <div className="flex flex-wrap gap-3">
                    {(project.tools || ['Figma', 'Adobe Creative Suite', 'Prototyping']).map((tool) => (
                      <div key={tool} className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {tool}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 pt-10 border-t border-border/50 space-y-6">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Completed</p>
                        <p className="font-semibold text-foreground">2024 Release</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Category</p>
                        <p className="font-semibold text-foreground">{project.tags[0] || 'Design'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
