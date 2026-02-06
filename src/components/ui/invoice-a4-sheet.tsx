'use client';

import type { Invoice } from '@/lib/data';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InvoiceA4SheetProps {
  invoice: Invoice;
  id?: string;
  className?: string;
}

export function InvoiceA4Sheet({ invoice, id = "invoice-print-root", className }: InvoiceA4SheetProps) {
  const template = invoice.templateId || 'modern';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency.value,
    }).format(amount);
  };
  
  const getStatusBadgeVariant = (status: Invoice['status']): 'success' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
        case 'Paid': return 'success';
        case 'Pending': return 'destructive';
        case 'Draft': return 'outline';
        default: return 'secondary';
    }
  }
  
  const getDate = (dateObj: any) => {
      if (!dateObj) return new Date();
      if (dateObj.toDate && typeof dateObj.toDate === 'function') return dateObj.toDate();
      return new Date(dateObj);
  }

  const invoiceDate = getDate(invoice.invoiceDate);
  const dueDate = getDate(invoice.dueDate);
  const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal * invoice.tax) / 100;

  // --- MODERN TEMPLATE (High Contrast / Creative) ---
  if (template === 'modern') {
    return (
        <Card id={id} className={cn("w-[210mm] min-h-[297mm] p-0 bg-white border-none rounded-none shadow-2xl mx-auto overflow-hidden text-black flex flex-col relative", className)}>
            {/* Bold Sidebar Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-black" />
            
            <div className="p-16 md:p-20 relative z-10 flex flex-col h-full flex-grow ml-4">
                <div className="flex justify-between items-start mb-20">
                    <div className="space-y-6">
                        {invoice.logoUrl && (
                            <div className="relative h-24 w-24">
                                <Image src={invoice.logoUrl} alt="Logo" fill className="object-contain" unoptimized />
                            </div>
                        )}
                        <div>
                            <h1 className="text-5xl font-black tracking-tightest leading-none mb-2">{invoice.yourName}</h1>
                            <p className="text-[11px] font-black tracking-[0.5em] text-gray-400 uppercase">Studio Output / Design Bureau</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            Official Invoice
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Document No.</p>
                            <p className="text-3xl font-black font-mono">#{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 mb-20">
                    <div className="col-span-7">
                        <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Recipient Identity</p>
                            <h3 className="text-2xl font-black tracking-tight mb-2">{invoice.clientName}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{invoice.clientAddress}</p>
                        </div>
                    </div>
                    <div className="col-span-5 flex flex-col justify-center space-y-8 pl-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Issue Cycle</p>
                            <p className="text-lg font-bold">{format(invoiceDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Deadline Date</p>
                            <p className="text-lg font-bold text-red-600">{format(dueDate, 'MMM dd, yyyy')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-grow">
                    <div className="grid grid-cols-12 gap-4 pb-6 border-b-4 border-black mb-8">
                        <div className="col-span-8 text-[11px] font-black uppercase tracking-[0.4em]">Service Detail</div>
                        <div className="col-span-4 text-right text-[11px] font-black uppercase tracking-[0.4em]">Total Value</div>
                    </div>
                    <div className="space-y-10">
                        {invoice.lineItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4">
                                <div className="col-span-8">
                                    <p className="text-lg font-black text-black leading-none mb-1">{item.description}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.quantity} Unit(s) @ {formatCurrency(item.price)}</p>
                                </div>
                                <div className="col-span-4 text-right">
                                    <p className="text-lg font-black text-black">{formatCurrency(item.quantity * item.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-gray-100 flex justify-between items-end">
                    <div className="max-w-xs pb-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-gray-300">Contractual Notes</h4>
                        <p className="text-[11px] text-gray-400 italic leading-relaxed">{invoice.notes}</p>
                    </div>
                    <div className="w-full max-w-[320px] bg-black text-white p-10 rounded-[3.5rem] shadow-2xl">
                        <div className="space-y-3 mb-8 border-b border-white/10 pb-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/50">
                                <span>Tax ({invoice.tax}%)</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-2">Grand Total Due</span>
                            <span className="text-5xl font-black tracking-tightest">{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
  }

  // --- MINIMALIST TEMPLATE (Ultra Clean / Swiss) ---
  if (template === 'minimalist') {
    return (
        <Card id={id} className={cn("w-[210mm] min-h-[297mm] p-24 bg-white border-none rounded-none shadow-2xl mx-auto text-black flex flex-col font-sans", className)}>
            <div className="flex justify-between items-start mb-40">
                <div className="text-8xl font-black tracking-tighter opacity-5 uppercase select-none absolute top-10 left-20">Invoice</div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold tracking-tight mb-1">{invoice.yourName}</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{invoice.yourEmail}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">No. {invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-400">{format(invoiceDate, 'dd / MM / yyyy')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-20 mb-40">
                <div className="space-y-4">
                    <p className="text-[9px] uppercase font-black text-gray-300 tracking-[0.3em]">Billing Address</p>
                    <div>
                        <h3 className="text-xl font-bold mb-1">{invoice.clientName}</h3>
                        <p className="text-sm text-gray-500 whitespace-pre-line leading-loose">{invoice.clientAddress}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-end">
                    <div className="text-right">
                        <p className="text-[9px] uppercase font-black text-gray-300 tracking-[0.3em] mb-4">Payment Terms</p>
                        <p className="text-sm font-bold">Due: {format(dueDate, 'MMMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{invoice.status}</p>
                    </div>
                </div>
            </div>

            <div className="flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead className="border-b border-gray-100">
                        <tr>
                            <th className="py-4 font-black uppercase text-[10px] tracking-widest text-gray-300">Description</th>
                            <th className="py-4 text-right font-black uppercase text-[10px] tracking-widest text-gray-300">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoice.lineItems.map(item => (
                            <tr key={item.id}>
                                <td className="py-8">
                                    <span className="font-bold text-base block">{item.description}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.quantity} x {formatCurrency(item.price)}</span>
                                </td>
                                <td className="py-8 text-right font-bold text-lg">{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-20 pt-10 border-t-2 border-gray-50">
                <div className="w-full max-w-[240px] space-y-4">
                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                        <span>Net Total</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest pb-4 border-b">
                        <span>Tax ({invoice.tax}%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="font-black text-sm uppercase tracking-[0.3em]">Total</span>
                        <span className="text-4xl font-black tracking-tight">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
  }

  // --- PROFESSIONAL TEMPLATE (Standard / Corporate) ---
  return (
    <Card id={id} className={cn("w-[210mm] min-h-[297mm] p-16 md:p-20 bg-white border-none rounded-none shadow-2xl mx-auto overflow-hidden text-black flex flex-col", className)}>
      <div className="flex justify-between items-start mb-20 flex-col sm:flex-row gap-8">
        <div className="space-y-6">
          {invoice.logoUrl && (
              <div className="relative h-20 w-20">
                  <Image src={invoice.logoUrl} alt="Company Logo" fill className="object-contain" unoptimized />
              </div>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black mb-1">{invoice.yourName}</h1>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">Professional Services</p>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed max-w-xs">{invoice.yourAddress}</p>
            <p className="text-sm font-medium text-gray-400 mt-2">{invoice.yourEmail}</p>
          </div>
        </div>
        <div className="text-left sm:text-right space-y-3">
          <h2 className="text-6xl font-black uppercase text-gray-100 tracking-tighter leading-none mb-2">Invoice</h2>
          <p className="text-2xl font-mono font-bold text-gray-800 tracking-tight"># {invoice.invoiceNumber}</p>
          <div className="pt-4">
              <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-[10px] py-1 px-6 rounded-full uppercase font-black tracking-[0.2em]">{invoice.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-20 border-t border-b py-12 border-gray-100">
        <div className="space-y-4">
          <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.25em] mb-4">Client Information</p>
          <h3 className="text-2xl font-bold text-black">{invoice.clientName}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{invoice.clientAddress}</p>
        </div>
        <div className="text-left sm:text-right space-y-8">
          <div>
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.25em] mb-2">Invoice Date</p>
            <p className="text-lg font-medium text-black">{format(invoiceDate, 'MMMM do, yyyy')}</p>
          </div>
          <div>
            <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.25em] mb-2">Payment Due</p>
            <p className="text-lg font-black text-red-600">{format(dueDate, 'MMMM do, yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="w-full mb-16">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-5 font-black text-black uppercase text-[10px] tracking-[0.25em] w-full">Description</th>
              <th className="py-5 px-6 font-black text-black uppercase text-[10px] tracking-[0.25em] text-center">Qty</th>
              <th className="py-5 px-6 font-black text-black uppercase text-[10px] tracking-[0.25em] text-right">Rate</th>
              <th className="py-5 font-black text-black uppercase text-[10px] tracking-[0.25em] text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td className="py-8 pr-6 text-sm font-bold text-gray-800 leading-relaxed">{item.description}</td>
                <td className="py-8 px-6 text-sm text-center text-gray-600 font-medium">{item.quantity}</td>
                <td className="py-8 px-6 text-sm text-right text-gray-600 font-medium">{formatCurrency(item.price)}</td>
                <td className="py-8 text-sm text-right font-black text-black">{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-16">
        <div className="w-full max-w-[300px] space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-gray-400 uppercase tracking-[0.2em] text-[10px]">Subtotal</span>
            <span className="font-bold text-black">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm pb-6 border-b border-gray-100">
            <span className="font-bold text-gray-400 uppercase tracking-[0.2em] text-[10px]">Tax ({invoice.tax}%)</span>
            <span className="font-bold text-black">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-6">
            <span className="font-black text-black uppercase tracking-[0.3em] text-xs">Grand Total</span>
            <span className="text-4xl font-black text-black tracking-tighter">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-24 text-center">
          <div className="inline-flex items-center justify-center gap-6 px-10 py-4 border-t border-gray-50">
            <p className="font-black text-black uppercase tracking-[0.4em] text-[10px]">Official Record</p>
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{invoice.yourName}</span>
          </div>
      </div>
    </Card>
  );
}
