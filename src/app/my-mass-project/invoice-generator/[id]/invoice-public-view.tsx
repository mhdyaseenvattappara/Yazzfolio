'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Invoice } from '@/lib/data';
import { InvoiceA4Sheet } from '@/components/ui/invoice-a4-sheet';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2, FileText, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

function InvoiceView({ invoice }: { invoice: Invoice }) {
  const searchParams = useSearchParams();
  const isPrintTriggered = searchParams.get('print') === 'true';
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isPrintTriggered) {
        const timer = setTimeout(() => {
            window.print();
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [isPrintTriggered]);

  const handleDownload = async (type: 'pdf' | 'image') => {
    const element = document.getElementById('invoice-print-root');
    if (!element) return;

    setIsExporting(true);
    try {
        const html2canvas = (await import('html2canvas')).default;
        // scale: 3 ensures A4 proportions result in high-res (~300DPI) image
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
        
        toast({ title: 'Export Successful', description: `Your document has been saved.` });
    } catch (err) {
        console.error("Export failed:", err);
        toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the file automatically. Try printing instead.' });
    } finally {
        setIsExporting(false);
    }
  };

  return (
      <div className="flex flex-col items-center w-full min-h-screen bg-muted/50 py-12 px-4">
        <div className="w-full max-w-[210mm] flex justify-end mb-8 gap-3 no-print">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled={isExporting} variant="default" className="shadow-2xl rounded-full px-8 h-12 bg-white text-black hover:bg-white/90 font-bold">
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Download Document
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl p-2 w-56" align="end">
                    <DropdownMenuItem onClick={() => handleDownload('pdf')} className="gap-2 rounded-lg">
                        <FileText className="h-4 w-4" /> Save as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('image')} className="gap-2 rounded-lg">
                        <ImageIcon className="h-4 w-4" /> Save as Image (A4)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.print()} className="gap-2 rounded-lg font-bold text-primary">
                        <Printer className="h-4 w-4" /> System Print
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
        <div className="printable-sheet">
            <InvoiceA4Sheet id="invoice-print-root" invoice={invoice} />
        </div>
      </div>
  );
}

export function InvoicePublicView({ invoice }: { invoice: Invoice }) {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <InvoiceView invoice={invoice} />
        </Suspense>
    )
}
