
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { collection, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Tool } from '@/lib/data';
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
import { ToolForm } from './tool-form';
import { toolIconMap } from '@/components/tool-icons';
import Image from 'next/image';

export function ToolStackManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  const toolsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `admin_users/${user.uid}/tools`), orderBy('createdAt', 'asc'));
  }, [firestore, user]);

  const { data: tools, isLoading: isLoadingTools } = useCollection<Tool>(toolsCollectionRef);

  const handleAddNew = () => {
    setEditingTool(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setIsFormOpen(true);
  };

  const handleDelete = (toolId: string) => {
    if (!user || !firestore) return;
    if (confirm('Are you sure you want to delete this tool?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/tools`, toolId);
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success!',
                description: 'Tool has been deleted.',
            });
        })
        .catch((error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not delete the tool.',
            });
        });
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black tracking-tight">Software Stack</h2>
                <p className="text-muted-foreground text-sm">Curate the tools you use for your workflow.</p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="rounded-full shadow-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Tool
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle className="text-2xl font-black">{editingTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
                </DialogHeader>
                <ToolForm
                    tool={editingTool}
                    onSuccess={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
        
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="font-bold w-[100px]">Visual</TableHead>
                    <TableHead className="font-bold">Software Name</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingTools ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-32">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
                ) : tools && tools.length > 0 ? (
                tools.map((tool) => {
                    const isCustom = tool.icon.startsWith('http') || tool.icon.startsWith('data:');
                    const Icon = !isCustom ? toolIconMap[tool.icon] : null;
                    
                    return (
                        <TableRow key={tool.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                            <div className="h-10 w-10 flex items-center justify-center bg-background rounded-lg border border-border/50 overflow-hidden relative">
                                {isCustom ? (
                                    <Image src={tool.icon} alt={tool.name} fill className="object-contain p-1.5" />
                                ) : Icon ? (
                                    <Icon className="h-6 w-6 text-muted-foreground" />
                                ) : (
                                    <div className="text-[10px] font-black uppercase opacity-20">NA</div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="font-bold text-base">{tool.name}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)} className="h-8 w-8 rounded-full">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10" onClick={() => handleDelete(tool.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    );
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-48 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <PlusCircle className="h-10 w-10 opacity-20" />
                            <p className="font-medium">Your stack is empty.</p>
                            <Button variant="outline" size="sm" onClick={handleAddNew} className="mt-2 rounded-full">Register Your Tools</Button>
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
