'use client';

import { useInView } from '@/hooks/use-in-view';
import { skillsData } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

export function AnimatedSkillsChart() {
  const { ref, isInView } = useInView({ threshold: 0.4, once: true });
  const chartData = isInView ? skillsData : skillsData.map(skill => ({ ...skill, level: 0 }));

  return (
    <div ref={ref} className={cn('w-full h-[350px] transition-opacity duration-500', isInView ? 'opacity-100' : 'opacity-0')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 16 }}
              width={110}
            />
            <Bar dataKey="level" radius={[4, 4, 4, 4]} barSize={32}>
              {chartData.map((entry, index) => (
                <Bar
                  key={`cell-${index}`}
                  dataKey="level"
                  fill={entry.color}
                  radius={[4, 4, 4, 4]}
                  // @ts-ignore
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationDelay={index * 150}
                />
              ))}
              <LabelList
                dataKey="level"
                position="right"
                offset={12}
                formatter={(value: number) => `${value > 0 ? `${value}%` : ''}`}
                fill="hsl(var(--foreground))"
                fontSize={14}
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
