'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl bg-[var(--bg-sidebar)]">
      <div className="flex items-center justify-between px-5 py-3 bg-[var(--bg-card)] border-b border-[var(--border)] text-[10px] font-mono tracking-widest text-[var(--text-muted)] uppercase">
        <span>{language || 'code'}</span>
        <button onClick={copyToClipboard} className="flex items-center gap-2 hover:text-[var(--text-main)] transition-colors">
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter 
        language={language || 'text'} 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.85rem', backgroundColor: 'transparent' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
