
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
    <div>
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Manage Tool Stack</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Tool
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{editingTool ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
                </DialogHeader>
                <ToolForm
                    tool={editingTool}
                    onSuccess={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
        
        <div className="rounded-lg border bg-card">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingTools ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                    <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : tools && tools.length > 0 ? (
                tools.map((tool) => {
                    const Icon = toolIconMap[tool.icon] || 'div';
                    return (
                        <TableRow key={tool.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                {tool.icon}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(tool.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    );
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                    No tools found. Add one to get started.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
