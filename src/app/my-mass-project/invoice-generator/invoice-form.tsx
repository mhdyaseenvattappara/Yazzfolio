
'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Plus, Printer, Calendar as CalendarIcon, Loader2, Layout, CheckCircle2, Download, FileText, ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Invoice, AdminProfile, InvoiceTemplateId } from '@/lib/data';
import { currencyOptions, invoiceTemplates } from '@/lib/data';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, collection, Timestamp } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InvoiceA4Sheet } from '@/components/ui/invoice-a4-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"


const lineItemSchema = z.object({
  id: z.number(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0),
  price: z.number().min(0),
});

const formSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientAddress: z.string().min(1, 'Client address is required'),
  invoiceDate: z.date(),
  dueDate: z.date(),
  templateId: z.enum(['modern', 'minimalist', 'professional']),
  lineItems: z.array(lineItemSchema),
  tax: z.number().min(0),
  notes: z.string().optional(),
  currency: z.object({
    value: z.string(),
    label: z.string(),
    symbol: z.string(),
  }),
  status: z.enum(['Draft', 'Pending', 'Paid']),
  yourName: z.string(),
  yourAddress: z.string(),
  yourEmail: z.string(),
  logoUrl: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
    invoice: Invoice | null;
    profile: AdminProfile;
    onSuccess: () => void;
    nextInvoiceNumber: string;
}

export function InvoiceForm({ invoice, profile, onSuccess, nextInvoiceNumber }: InvoiceFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || nextInvoiceNumber || '001',
      clientName: invoice?.clientName || '',
      clientAddress: invoice?.clientAddress || '',
      invoiceDate: invoice?.invoiceDate ? (invoice.invoiceDate as any).toDate() : new Date(),
      dueDate: invoice?.dueDate ? (invoice.dueDate as any).toDate() : new Date(new Date().setDate(new Date().getDate() + 30)),
      templateId: invoice?.templateId || 'modern',
      lineItems: invoice?.lineItems || [{ id: 1, description: 'Service Description', quantity: 1, price: 0 }],
      tax: invoice?.tax || 0,
      notes: invoice?.notes || 'Payment is due within 30 days. Thank you for your business!',
      currency: invoice?.currency || currencyOptions[4], // Default to INR
      status: invoice?.status || 'Draft',
      yourName: invoice?.yourName || profile.name,
      yourAddress: invoice?.yourAddress || profile.address || '',
      yourEmail: invoice?.yourEmail || profile.email,
      logoUrl: invoice?.logoUrl || profile.profileImageUrl,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchValues = form.watch();
  const watchTemplate = form.watch('templateId');
  
  const subtotal = watchValues.lineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxAmount = (subtotal * (watchValues.tax || 0)) / 100;
  const total = subtotal + taxAmount;

  // Reactive preview object
  const tempInvoice: Invoice = useMemo(() => ({
      ...watchValues,
      id: invoice?.id || 'temp',
      adminUserId: user?.uid || '',
      invoiceDate: Timestamp.fromDate(watchValues.invoiceDate),
      dueDate: Timestamp.fromDate(watchValues.dueDate),
      total: total,
      createdAt: invoice?.createdAt || Timestamp.now(),
      updatedAt: Timestamp.now(),
  } as Invoice), [watchValues, total, user, invoice]);
  
  const onSubmit = async (values: InvoiceFormValues) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const invoiceId = invoice?.id || doc(collection(firestore, `admin_users/${user.uid}/invoices`)).id;
    const docRef = doc(firestore, `admin_users/${user.uid}/invoices`, invoiceId);

    const dataToSave = {
        ...values,
        id: invoiceId,
        adminUserId: user.uid,
        invoiceDate: Timestamp.fromDate(values.invoiceDate),
        dueDate: Timestamp.fromDate(values.dueDate),
        total: total,
        updatedAt: serverTimestamp(),
        createdAt: invoice?.createdAt || serverTimestamp()
    };

    try {
        await setDoc(docRef, dataToSave, { merge: true });
        toast({
            title: 'Invoice Saved',
            description: `Invoice #${values.invoiceNumber} has been updated.`,
        });
        onSuccess();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not save the invoice.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDirectAction = async (type: 'pdf' | 'image' | 'print') => {
    setIsExporting(true);

    // Give React a moment to ensure the background sheet is fully updated
    setTimeout(async () => {
        const element = document.getElementById('form-capture-root');
        if (!element) {
            setIsExporting(false);
            return;
        }

        if (type === 'print') {
            window.print();
            setIsExporting(false);
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
                pdf.save(`Invoice_${tempInvoice.invoiceNumber}.pdf`);
            } else {
                const link = document.createElement('a');
                link.download = `Invoice_${tempInvoice.invoiceNumber}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
            }
            toast({ title: 'Export Successful', description: `Invoice saved as ${type.toUpperCase()}.` });
        } catch (err) {
            console.error("Export failed:", err);
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate file.' });
        } finally {
            setIsExporting(false);
        }
    }, 400);
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
    {/* Silent Rendering Bridge for Exports */}
    <div className="fixed top-0 left-[-9999mm] pointer-events-none opacity-0" aria-hidden="true">
        <InvoiceA4Sheet id="form-capture-root" invoice={tempInvoice} />
    </div>

    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-1 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-fit">
            {/* Left Column: Editor */}
            <div className="space-y-6 pb-12">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Visual Identity
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {invoiceTemplates.map((template) => (
                            <button
                                key={template.id}
                                type="button"
                                onClick={() => form.setValue('templateId', template.id as InvoiceTemplateId, { shouldValidate: true })}
                                className={cn(
                                    "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 h-20",
                                    watchTemplate === template.id 
                                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" 
                                        : "border-border hover:border-gray-300 bg-transparent text-muted-foreground"
                                )}
                            >
                                <Layout className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{template.name}</span>
                                {watchTemplate === template.id && <CheckCircle2 className="w-3 h-3 absolute top-2 right-2 text-primary" />}
                            </button>
                        ))}
                    </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Sender Details
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Your Business Name</Label>
                        <Input {...form.register('yourName')} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Business Address</Label>
                        <Textarea {...form.register('yourAddress')} className="rounded-xl min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Contact Email</Label>
                        <Input type="email" {...form.register('yourEmail')} className="rounded-xl h-12" />
                        </div>
                    </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Client Details
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Client Name</Label>
                        <Input {...form.register('clientName')} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Client Address</Label>
                        <Textarea {...form.register('clientAddress')} className="rounded-xl min-h-[100px]" />
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Billing Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Invoice #</Label>
                            <Input {...form.register('invoiceNumber')} className="rounded-xl h-12 font-mono font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Issue Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn('w-full h-12 justify-start text-left font-normal rounded-xl', !form.watch('invoiceDate') && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('invoiceDate') ? format(form.watch('invoiceDate'), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={form.watch('invoiceDate')} onSelect={(date) => date && form.setValue('invoiceDate', date)} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn('w-full h-12 justify-start text-left font-normal rounded-xl', !form.watch('dueDate') && 'text-muted-foreground')}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('dueDate') ? format(form.watch('dueDate'), 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={form.watch('dueDate')} onSelect={(date) => date && form.setValue('dueDate', date)} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Line Items
                    </h3>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-6 space-y-1">
                                    <Label className="text-[8px] uppercase font-black opacity-50">Description</Label>
                                    <Input {...form.register(`lineItems.${index}.description`)} className="h-10 rounded-lg" />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-[8px] uppercase font-black opacity-50">Qty</Label>
                                    <Input type="number" {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} className="h-10 rounded-lg" />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <Label className="text-[8px] uppercase font-black opacity-50">Rate</Label>
                                    <Input type="number" {...form.register(`lineItems.${index}.price`, { valueAsNumber: true })} className="h-10 rounded-lg" />
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ id: Date.now(), description: '', quantity: 1, price: 0 })} className="w-full rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Add New Item
                        </Button>
                    </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Reactive Sidebar Preview */}
            <div className="lg:col-span-1 h-full flex flex-col">
                <div className="sticky top-0 h-fit flex flex-col pb-12">
                    <div className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary text-center flex items-center justify-center gap-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Live Visual Preview
                    </div>
                    <div className="w-full flex-1 flex justify-center items-start bg-muted/20 rounded-3xl overflow-hidden p-4 min-h-[600px]">
                        <div className="scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.4] xl:scale-[0.5] 2xl:scale-[0.6] origin-top shadow-2xl rounded-sm overflow-hidden border border-border/50 bg-white transition-all duration-500 h-fit">
                            <InvoiceA4Sheet id="live-preview-sheet" invoice={tempInvoice} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER - Anchored to Dialog Bottom */}
      <div className="shrink-0 bg-background/95 backdrop-blur-xl py-6 px-8 border-t flex justify-end items-center gap-4 z-50">
        <Button 
            variant="outline" 
            type="button"
            onClick={onSuccess} 
            className="rounded-full px-8 border-border/50 text-muted-foreground hover:bg-accent transition-all h-12"
        >
            Cancel
        </Button>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="secondary" 
                    type="button" 
                    disabled={isExporting}
                    className="rounded-full px-6 bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center gap-2 h-12"
                >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    <span className="whitespace-nowrap font-bold">Print / Export</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-2 w-56">
                <DropdownMenuItem onClick={() => handleDirectAction('pdf')} className="gap-2 rounded-lg py-2">
                    <FileText className="h-4 w-4" /> Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDirectAction('image')} className="gap-2 rounded-lg py-2">
                    <ImageIcon className="h-4 w-4" /> Save as Image (A4)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDirectAction('print')} className="gap-2 rounded-lg py-2 font-bold text-primary">
                    <Printer className="h-4 w-4" /> System Print
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="rounded-full px-10 shadow-xl bg-white text-black hover:bg-white/90 font-black tracking-tight transition-all h-12"
        >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {invoice ? 'Update Document' : 'Save & Close'}
        </Button>
      </div>
    </form>
    </Form>
    </div>
  );
}
