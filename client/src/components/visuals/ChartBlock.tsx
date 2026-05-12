'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import json5 from 'json5';
import { TrendingUp, BarChart2 } from 'lucide-react';

export const ChartBlock = ({ code }: { code: string }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = json5.parse(code);
      if (parsed && Array.isArray(parsed.data)) {
        setData(parsed);
        setError(null);
      } else {
        setError('Invalid chart data format.');
      }
    } catch (err) {
      setError('Failed to parse chart JSON.');
    }
  }, [code]);

  if (error) return null; // Fallback handled by parent
  if (!data) return <div className="p-10 text-center animate-pulse">Generating chart...</div>;

  const ChartComponent = 
    data.type === 'BarChart' ? BarChart : 
    data.type === 'AreaChart' ? AreaChart : 
    LineChart;

  const DataComponent = 
    data.type === 'BarChart' ? Bar : 
    data.type === 'AreaChart' ? Area : 
    Line;

  return (
    <div className="my-8 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700">
      <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <TrendingUp size={16} className="text-[var(--accent)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Data Visualization</span>
        </div>
        <BarChart2 size={16} className="text-[var(--text-muted)] opacity-50" />
      </div>
      <div className="p-8 h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
            <XAxis dataKey={data.xKey || "name"} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border)', 
                borderRadius: '16px',
                fontSize: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
            {data.series?.map((s: any, i: number) => (
              <DataComponent 
                key={i} 
                type="monotone" 
                dataKey={s.key} 
                stroke={s.color || 'var(--accent)'} 
                fill={s.color || 'var(--accent)'} 
                fillOpacity={0.2}
                strokeWidth={3}
                radius={data.type === 'BarChart' ? 6 : undefined}
                dot={data.type !== 'BarChart' ? { r: 4, strokeWidth: 2, fill: 'var(--bg-card)' } : false}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
