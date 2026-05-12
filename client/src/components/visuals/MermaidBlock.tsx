'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, RotateCcw } from 'lucide-react';

interface MermaidBlockProps {
  code: string;
}

export const MermaidBlock = ({ code }: MermaidBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
  }, []);

  useEffect(() => {
    const renderMermaid = async () => {
      if (!containerRef.current || !code) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('Failed to render Mermaid diagram.');
      }
    };

    renderMermaid();
  }, [code]);

  if (error) return null;

  return (
    <div className={`mermaid-diagram my-8 rounded-[2.5rem] border ${isScreenshotMode ? 'border-transparent bg-white shadow-none' : 'border-[var(--border)] bg-[var(--bg-sidebar)]/30 shadow-2xl'} overflow-hidden w-full backdrop-blur-xl animate-in zoom-in-95 duration-700`}>
      <div className={`flex items-center justify-between px-8 py-4 ${isScreenshotMode ? 'hidden' : 'border-b border-[var(--border)] bg-[var(--bg-card)]/60'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Neural Diagram (Mermaid)</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsScreenshotMode(true)}
            className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-muted)] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Maximize2 size={14} />
            <span>Clean View</span>
          </button>
        </div>
      </div>
      
      {isScreenshotMode && (
        <button 
          onClick={() => setIsScreenshotMode(false)}
          className="absolute top-6 right-6 z-50 p-3 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-all"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <div 
        ref={containerRef}
        className={`p-10 flex justify-center items-center min-h-[200px] overflow-auto ${isScreenshotMode ? 'bg-white' : ''}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
