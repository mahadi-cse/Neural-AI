'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { ReactFlowBlock } from '../visuals/ReactFlowBlock';
import { ChartBlock } from '../visuals/ChartBlock';
import { PhysicsBlock } from '../visuals/PhysicsBlock';
import { ThreeBlock } from '../visuals/ThreeBlock';
import { CanvasBlock } from '../visuals/CanvasBlock';
import { MermaidBlock } from '../visuals/MermaidBlock';
import { CodeBlock } from './CodeBlock';

const REACTFLOW_LANGUAGES = new Set(['reactflow', 'flow', 'diagram', 'json', 'javascript', 'js']);
const REACTFLOW_LIKE = /("nodes"|nodes)\s*:\s*\[|("edges"|edges)\s*:\s*\[/;
const isReactFlowLike = (code: string) => REACTFLOW_LIKE.test(code);

interface MarkdownRendererProps {
  content: string;
  enableVisuals?: boolean;
}

export const MarkdownRenderer = React.memo(({ content, enableVisuals = true }: MarkdownRendererProps) => {
  const trimmed = content.trim();
  
  const components = useMemo(() => ({
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-([^\s]+)/.exec(className || '');
      const language = match?.[1]?.toLowerCase() || '';
      const normalizedLanguage = language.replace(/[^a-z0-9]/g, '');
      const codeValue = String(children).replace(/\n$/, '');
      
      const isCanvas = enableVisuals && !inline && (language === 'canvas' || language === 'lab' || language === 'html' || codeValue.includes('<!DOCTYPE html>'));
      if (isCanvas) return <CanvasBlock code={codeValue} />;

      const isMermaid = enableVisuals && !inline && (language === 'mermaid' || normalizedLanguage === 'mermaid' || codeValue.startsWith('graph ') || codeValue.startsWith('sequenceDiagram') || codeValue.startsWith('classDiagram'));
      if (isMermaid) return <MermaidBlock code={codeValue} />;

      const isFlow = enableVisuals && !inline && (REACTFLOW_LANGUAGES.has(language) || REACTFLOW_LANGUAGES.has(normalizedLanguage) || isReactFlowLike(codeValue));
      if (isFlow) return <ReactFlowBlock code={codeValue} />;

      const isChart = enableVisuals && !inline && (language === 'recharts' || normalizedLanguage === 'recharts');
      if (isChart) return <ChartBlock code={codeValue} />;

      const isPhysics = enableVisuals && !inline && (language === 'p5' || normalizedLanguage === 'p5' || language === 'physics');
      if (isPhysics) return <PhysicsBlock code={codeValue} />;

      const is3D = enableVisuals && !inline && (language === 'three' || normalizedLanguage === 'three' || language === '3d');
      if (is3D) return <ThreeBlock code={codeValue} />;

      return !inline && match ? (
        <CodeBlock language={match[1]} value={codeValue} />
      ) : (
        <code className="bg-[var(--bg-sidebar)] px-1.5 py-0.5 rounded-lg text-[var(--accent)] text-sm font-mono font-bold" {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }: any) => <p className="mb-5 last:mb-0">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc ml-6 mb-5 space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal ml-6 mb-5 space-y-2">{children}</ol>,
  }), [enableVisuals]);

  if (enableVisuals && trimmed.startsWith('<!DOCTYPE html>')) {
    return <CanvasBlock code={trimmed} />;
  }

  if (enableVisuals && trimmed.startsWith('{') && trimmed.endsWith('}') && isReactFlowLike(trimmed)) {
    return <ReactFlowBlock code={trimmed} />;
  }

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
