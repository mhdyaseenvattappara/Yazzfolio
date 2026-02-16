'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, MoreHorizontal, Download, Trash2, Edit, ExternalLink, Eye, X, FileText, ImageIcon, Printer, ChevronRight } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import type { Invoice } from '@/lib/data';
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { InvoiceForm } from '@/app/my-mass-project/invoice-generator/invoice-form';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AdminProfile } from '@/lib/data';
import { useDoc } from '@/firebase';
import { InvoiceA4Sheet } from '@/components/ui/invoice-a4-sheet';

export function InvoiceManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [silentInvoice, setSilentInvoice] = useState<Invoice | null>(null);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('001');
  const [isExporting, setIsExporting] = useState(false);

  const profileDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `admin_users/${user.uid}`);
  }, [firestore, user]);

  const { data: profile } = useDoc<AdminProfile>(profileDocRef);

  const invoicesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `admin_users/${user.uid}/invoices`), orderBy('invoiceNumber', 'desc'));
  }, [firestore, user]);

  const { data: invoices, isLoading: isLoadingInvoices } = useCollection<Invoice>(invoicesCollectionRef);

  const calculateNextInvoiceNumber = () => {
    if (invoices && invoices.length > 0) {
      const lastInvoiceNumber = invoices[0].invoiceNumber;
      const num = parseInt(lastInvoiceNumber, 10);
      if (!isNaN(num)) {
        return String(num + 1).padStart(3, '0');
      }
    }
    return '001';
  };
  
  const handleAddNew = () => {
    const newInvoiceNumber = calculateNextInvoiceNumber();
    setNextInvoiceNumber(newInvoiceNumber);
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleStatusChange = async (invoiceId: string, status: 'Draft' | 'Pending' | 'Paid') => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `admin_users/${user.uid}/invoices`, invoiceId);
    updateDocumentNonBlocking(docRef, { status });
    toast({
        title: 'Status Updated',
        description: `Invoice is now marked as ${status}.`
    })
  }

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  const handleDelete = (invoiceId: string) => {
    if (!user || !firestore) return;
    if (confirm('Delete this invoice forever?')) {
      const docRef = doc(firestore, `admin_users/${user.uid}/invoices`, invoiceId);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: 'Document Deleted',
        description: 'Invoice has been removed from your database.',
      });
    }
  };

  const handleDirectAction = async (invoice: Invoice, type: 'pdf' | 'image' | 'print') => {
    setSilentInvoice(invoice);
    setIsExporting(true);

    // Short delay to ensure silent rendering container is populated
    setTimeout(async () => {
        const element = document.getElementById('silent-print-root');
        if (!element) {
            setIsExporting(false);
            return;
        }

        if (type === 'print') {
            window.print();
            setIsExporting(false);
            setSilentInvoice(null);
            return;
        }

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            if (type === 'pdf') {
                const { jsPDF } = await import('jspdf');
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
            } else {
                const link = document.createElement('a');
                link.download = `Invoice_${invoice.invoiceNumber}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
            }
            toast({ title: 'Export Successful', description: `Invoice saved as ${type.toUpperCase()}.` });
        } catch (err) {
            console.error("Export failed:", err);
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the file automatically.' });
        } finally {
            setIsExporting(false);
            setSilentInvoice(null);
        }
    }, 300);
  };

  const formatCurrency = (amount: number, currencySymbol: string) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  
  const getStatusBadgeVariant = (status: Invoice['status']): 'success' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
        case 'Paid': return 'success';
        case 'Pending': return 'destructive';
        case 'Draft': return 'outline';
        default: return 'secondary';
    }
  }

  return (
    <>
    {/* Silent Rendering Bridge for Direct Downloads/Print */}
    <div className="fixed top-0 left-[-9999mm] pointer-events-none opacity-0" aria-hidden="true">
        {silentInvoice && <InvoiceA4Sheet id="silent-print-root" invoice={silentInvoice} />}
    </div>

    <Card className="w-full border-border/50 shadow-sm overflow-hidden h-full flex flex-col">
        <CardHeader className="bg-muted/30 pb-8 shrink-0">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight">Invoice Vault</CardTitle>
                    <CardDescription>Professional billing and tracking for your studio.</CardDescription>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddNew} className="rounded-full shadow-lg">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Document
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[95vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{selectedInvoice ? `Edit Invoice #${selectedInvoice.invoiceNumber}` : `Generate Invoice #${nextInvoiceNumber}`}</DialogTitle>
                        <DialogDescription className="sr-only">Form to create or update an invoice document.</DialogDescription>
                    </DialogHeader>
                    {profile && (
                        <InvoiceForm
                            profile={profile}
                            invoice={selectedInvoice}
                            onSuccess={() => setIsFormOpen(false)}
                            nextInvoiceNumber={nextInvoiceNumber}
                        />
                    )}
                </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar">
            <div className="min-w-full inline-block align-middle">
                <Table>
                <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Doc #</TableHead>
                    <TableHead className="font-bold">Client Identity</TableHead>
                    <TableHead className="font-bold">Deadline</TableHead>
                    <TableHead className="text-right font-bold">Total Amount</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingInvoices ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-32">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </TableCell>
                    </TableRow>
                    ) : invoices && invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className="cursor-pointer hover:bg-muted/20 transition-colors"
                          onClick={() => handlePreview(invoice)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Badge variant={getStatusBadgeVariant(invoice.status)} className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono font-bold">{invoice.invoiceNumber}</TableCell>
                            <TableCell className="font-medium">{invoice.clientName}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {invoice.dueDate ? format((invoice.dueDate as any).toDate(), 'MMM d, yyyy') : '—'}
                            </TableCell>
                            <TableCell className="text-right font-black">
                                {formatCurrency(invoice.total, invoice.currency.symbol)}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-border/50">
                                        <DropdownMenuItem onClick={() => handleEdit(invoice)} className="rounded-lg gap-2">
                                            <Edit className="h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="rounded-lg gap-2 font-bold text-primary">
                                                <Download className="h-4 w-4" /> PDF / Download
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="rounded-xl p-2">
                                                <DropdownMenuItem onClick={() => handleDirectAction(invoice, 'pdf')} className="gap-2">
                                                    <FileText className="h-4 w-4" /> Download PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDirectAction(invoice, 'image')} className="gap-2">
                                                    <ImageIcon className="h-4 w-4" /> Download Image (A4)
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDirectAction(invoice, 'print')} className="gap-2">
                                                    <Printer className="h-4 w-4" /> System Print
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuItem onClick={() => window.open(`/my-mass-project/invoice-generator/${invoice.id}`, '_blank')} className="rounded-lg gap-2">
                                            <ExternalLink className="h-4 w-4" /> Public Link
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Pending')} className="rounded-lg">Mark as Pending</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Paid')} className="rounded-lg">Mark as Paid</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive rounded-lg gap-2" onClick={() => handleDelete(invoice.id)}>
                                            <Trash2 className="h-4 w-4" /> Delete Permanently
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-48 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <PlusCircle className="h-8 w-8 opacity-20" />
                                <p className="font-medium">Your invoice history is empty.</p>
                                <Button variant="outline" size="sm" onClick={handleAddNew} className="mt-2 rounded-full">Create Your First Invoice</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>

    {/* A4 Preview Modal - Balanced scaling for full visibility */}
    <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-screen-2xl h-[95vh] p-0 bg-muted border-none overflow-hidden flex flex-col rounded-3xl">
            <DialogHeader className="sr-only">
                <DialogTitle>Document Preview # {previewInvoice?.invoiceNumber}</DialogTitle>
                <DialogDescription>A4 visual representation of the invoice.</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-background/80 backdrop-blur-md border-b flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Badge className="rounded-full px-4 py-1 font-bold tracking-widest uppercase">Document Preview</Badge>
                    <span className="text-sm font-medium text-muted-foreground"># {previewInvoice?.invoiceNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={isExporting} className="rounded-full px-6 bg-primary text-primary-foreground font-bold shadow-lg">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download Now
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl p-2 w-48">
                            <DropdownMenuItem onClick={() => handleDirectAction(previewInvoice!, 'pdf')} className="gap-2 rounded-lg">
                                <FileText className="h-4 w-4" /> Direct PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDirectAction(previewInvoice!, 'image')} className="gap-2 rounded-lg">
                                <ImageIcon className="h-4 w-4" /> Save as Image (A4)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDirectAction(previewInvoice!, 'print')} className="gap-2 rounded-lg font-bold text-primary">
                                <Printer className="h-4 w-4" /> System Print
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button variant="ghost" size="icon" onClick={() => setPreviewInvoice(null)} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/50 no-scrollbar flex justify-center items-start">
                {previewInvoice && (
                    <div className="scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-[0.9] origin-top h-fit transition-transform duration-500 mb-12">
                        <InvoiceA4Sheet id="invoice-print-root" invoice={previewInvoice} className="shadow-2xl" />
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
