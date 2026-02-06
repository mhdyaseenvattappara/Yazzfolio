'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { PortfolioItem, Testimonial, Service } from '@/lib/data';
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentBreakdownChartProps {
    portfolioItems: PortfolioItem[] | null;
    testimonials: Testimonial[] | null;
    services: Service[] | null;
    isLoading: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export function ContentBreakdownChart({ portfolioItems, testimonials, services, isLoading }: ContentBreakdownChartProps) {
  
  const data = useMemo(() => [
    { name: 'Portfolio', value: portfolioItems?.length || 0 },
    { name: 'Testimonials', value: testimonials?.length || 0 },
    { name: 'Services', value: services?.length || 0 },
  ], [portfolioItems, testimonials, services]);

  if (isLoading) {
      return <Skeleton className="h-full w-full" />
  }

  const hasData = data.some(item => item.value > 0);

  return (
    <div className="w-full h-full flex items-center justify-center min-h-[200px]">
        {hasData ? (
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        innerRadius="65%"
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={5}
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            fontSize: '10px'
                        }}
                    />
                    <Legend 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                    />
                </PieChart>
            </ResponsiveContainer>
        ) : (
            <div className="text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-50">
                No content data yet.
            </div>
        )}
    </div>
  )
}
