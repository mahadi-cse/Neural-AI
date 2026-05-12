'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, RotateCcw, Code, ExternalLink, Sparkles } from 'lucide-react';

interface CanvasBlockProps {
  code: string;
}

export const CanvasBlock = ({ code }: CanvasBlockProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Small delay to ensure iframe is ready
    const timeout = setTimeout(() => {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;

      doc.open();
      // Ensure the content fits the iframe and has no default margins
      const enrichedCode = `
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background: #050505; }
          canvas { display: block; width: 100vw; height: 100vh; }
        </style>
        ${code}
      `;
      doc.write(enrichedCode);
      doc.close();
    }, 50);

    return () => clearTimeout(timeout);
  }, [code, resetKey]);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="my-10 rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-1000">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60 block leading-none mb-1.5">Neural Canvas</span>
            <span className="text-sm font-bold text-[var(--text-main)] tracking-tight">Interactive Lab Environment</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="p-3 hover:bg-[var(--bg-sidebar)] rounded-xl transition-all text-[var(--text-main)] border border-[var(--border)]"
            title="Reload Simulation"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            className="p-3 hover:bg-[var(--bg-sidebar)] rounded-xl transition-all text-[var(--text-main)] border border-[var(--border)]"
            title="Open Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-white overflow-hidden">
        <iframe
          key={resetKey}
          ref={iframeRef}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          title="Neural AI Canvas"
        />
      </div>
      
      <div className="px-8 py-4 bg-[var(--bg-sidebar)]/30 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Sandbox</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          <span>HTML5</span>
          <span>•</span>
          <span>JavaScript</span>
          <span>•</span>
          <span>CSS3</span>
        </div>
      </div>
    </div>
  );
};
