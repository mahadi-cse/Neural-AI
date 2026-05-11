'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReactFlowBlock } from '../visuals/ReactFlowBlock';
import { ChartBlock } from '../visuals/ChartBlock';
import { PhysicsBlock } from '../visuals/PhysicsBlock';
import { CodeBlock } from './CodeBlock';

const REACTFLOW_LANGUAGES = new Set(['reactflow', 'flow', 'diagram', 'json', 'javascript', 'js']);
const REACTFLOW_LIKE = /("nodes"|nodes)\s*:\s*\[|("edges"|edges)\s*:\s*\[/;
const isReactFlowLike = (code: string) => REACTFLOW_LIKE.test(code);

interface MarkdownRendererProps {
  content: string;
  enableVisuals?: boolean;
}

export const MarkdownRenderer = ({ content, enableVisuals = true }: MarkdownRendererProps) => {
  const trimmed = content.trim();
  
  if (enableVisuals && trimmed.startsWith('{') && trimmed.endsWith('}') && isReactFlowLike(trimmed)) {
    return <ReactFlowBlock code={trimmed} />;
  }

  return (
    <ReactMarkdown components={{
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-([^\s]+)/.exec(className || '');
        const language = match?.[1]?.toLowerCase() || '';
        const normalizedLanguage = language.replace(/[^a-z0-9]/g, '');
        const codeValue = String(children).replace(/\n$/, '');
        
        const isFlow = enableVisuals && !inline && (REACTFLOW_LANGUAGES.has(language) || REACTFLOW_LANGUAGES.has(normalizedLanguage) || isReactFlowLike(codeValue));
        if (isFlow) return <ReactFlowBlock code={codeValue} />;

        const isChart = enableVisuals && !inline && (language === 'recharts' || normalizedLanguage === 'recharts');
        if (isChart) return <ChartBlock code={codeValue} />;

        const isPhysics = enableVisuals && !inline && (language === 'p5' || normalizedLanguage === 'p5' || language === 'physics');
        if (isPhysics) return <PhysicsBlock code={codeValue} />;

        return !inline && match ? (
          <CodeBlock language={match[1]} value={codeValue} />
        ) : (
          <code className="bg-[var(--bg-sidebar)] px-1.5 py-0.5 rounded-lg text-[var(--accent)] text-sm font-mono font-bold" {...props}>
            {children}
          </code>
        );
      },
      p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="list-disc ml-6 mb-5 space-y-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal ml-6 mb-5 space-y-2">{children}</ol>,
    }}>
      {content}
    </ReactMarkdown>
  );
};
