
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import type { Service } from '@/lib/data';
import { iconMap } from '@/lib/data';
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
import { ServiceForm } from './service-form';

export function ServicesManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const servicesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `admin_users/${user.uid}/services`);
  }, [firestore, user]);

  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(servicesCollectionRef);

  const handleAddNew = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (serviceId: string) => {
    if (!user || !firestore) return;
    if (confirm('Are you sure you want to delete this service?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/services`, serviceId);
      deleteDoc(docRef)
        .then(() => {
            toast({
                title: 'Success!',
                description: 'Service has been deleted.',
            });
        })
        .catch((error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not delete the service.',
            });
        });
    }
  };

  return (
    <div>
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Manage Services</h2>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Service
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                </DialogHeader>
                <ServiceForm
                    service={editingService}
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
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoadingServices ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                    <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : services && services.length > 0 ? (
                services.map((service) => {
                    const Icon = iconMap[service.icon] || 'div';
                    return (
                        <TableRow key={service.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                {service.icon}
                            </div>
                        </TableCell>
                        <TableCell>{service.title}</TableCell>
                        <TableCell>{service.description.substring(0, 50)}...</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    );
                })
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                    No services found. Add one to get started.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
