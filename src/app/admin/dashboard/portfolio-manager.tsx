
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2, Heart, Filter, ArrowUpDown } from 'lucide-react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { PortfolioItem } from '@/lib/data';
import { projectCategories } from '@/lib/data';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { PortfolioItemForm } from './portfolio-form';
import { Badge } from '@/components/ui/badge';

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'likes';

export function PortfolioManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const portfolioCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `admin_users/${user.uid}/portfolio_items`);
  }, [firestore, user]);

  const { data: rawPortfolioItems, isLoading: isLoadingPortfolio } = useCollection<PortfolioItem>(portfolioCollectionRef);

  const processedItems = useMemo(() => {
    if (!rawPortfolioItems) return [];
    
    let items = [...rawPortfolioItems];

    // Filter
    if (filterCategory !== 'All') {
        items = items.filter(item => item.category === filterCategory);
    }

    // Sort
    items.sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        if (sortBy === 'oldest') return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
        if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
        return 0;
    });

    return items;
  }, [rawPortfolioItems, filterCategory, sortBy]);

  const handleAddNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (project: PortfolioItem) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = (projectId: string) => {
    if (!user || !firestore) return;
    if (confirm('Are you sure you want to delete this project?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/portfolio_items`, projectId);
      deleteDoc(docRef)
        .then(() => {
          toast({
            title: 'Success!',
            description: 'Project has been deleted.',
          });
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete the project.',
          });
        });
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Portfolio Works</h2>
                <p className="text-muted-foreground text-sm">Manage and track appreciation for your projects.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full gap-2 h-9">
                            <Filter className="h-3 w-3" />
                            <span className="hidden xs:inline">{filterCategory}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filterCategory} onValueChange={setFilterCategory}>
                            <DropdownMenuRadioItem value="All">All Categories</DropdownMenuRadioItem>
                            {projectCategories.map(cat => (
                                <DropdownMenuRadioItem key={cat} value={cat}>{cat}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-full gap-2 h-9">
                            <ArrowUpDown className="h-3 w-3" />
                            <span className="hidden xs:inline">Sort</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Sort Projects</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                            <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="alphabetical">A-Z</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="likes">Most Likes</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddNew} className="rounded-full shadow-lg transition-all active:scale-95 ml-auto sm:ml-0 h-9">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Work
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh]">
                    <DialogHeader>
                    <DialogTitle className="text-2xl font-black">{editingProject ? 'Modify Project' : 'Publish New Work'}</DialogTitle>
                    </DialogHeader>
                    <PortfolioItemForm
                    project={editingProject}
                    onSuccess={() => setIsFormOpen(false)}
                    />
                </DialogContent>
                </Dialog>
            </div>
        </div>
        
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                    <TableHead className="font-bold min-w-[200px]">Project Identity</TableHead>
                    <TableHead className="font-bold min-w-[120px]">Category</TableHead>
                    <TableHead className="text-center font-bold min-w-[100px]">Appreciations</TableHead>
                    <TableHead className="text-right font-bold min-w-[120px]">Management</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingPortfolio ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-32">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </TableCell>
                    </TableRow>
                    ) : processedItems.length > 0 ? (
                    processedItems.map((project) => (
                        <TableRow key={project.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-base line-clamp-1">{project.title}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {project.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="rounded-full text-[10px] font-black uppercase tracking-wider px-3">
                                {project.category || 'General'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-black w-fit mx-auto border border-red-100 shadow-sm">
                                <Heart className="h-3 w-3 fill-current" />
                                <span>{project.likes || 0}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} className="h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
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
                                <PlusCircle className="h-10 w-10 opacity-20" />
                                <p className="font-medium text-lg">No projects match your current filters.</p>
                                <Button variant="link" onClick={() => { setFilterCategory('All'); setSortBy('newest'); }} className="mt-2">Clear all filters</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
    </div>
  );
}
