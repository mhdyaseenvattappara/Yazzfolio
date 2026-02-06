'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { subDays, format } from 'date-fns';
import type { ContactMessage } from '@/lib/data';
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentMessagesChartProps {
  messages: ContactMessage[] | null;
  isLoading: boolean;
}

export function RecentMessagesChart({ messages, isLoading }: RecentMessagesChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const data = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, i);
      return {
        name: format(date, 'MMM d'),
        total: messages?.filter(
          (msg) => msg.createdAt && format(msg.createdAt.toDate(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length || 0,
      };
    }).reverse();

    return data;
  }, [messages]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '10px'
            }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
