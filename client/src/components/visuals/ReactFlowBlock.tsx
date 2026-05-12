'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, Controls, MiniMap, MarkerType, 
  applyNodeChanges, applyEdgeChanges, addEdge,
  NodeChange, EdgeChange, Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Edge, Node as ReactFlowNode, Viewport } from 'reactflow';
import json5 from 'json5';
import dagre from 'dagre';
import { Maximize2 } from 'lucide-react';

const REACTFLOW_LIKE = /("nodes"|nodes)\s*:\s*\[|("edges"|edges)\s*:\s*\[/;
const isReactFlowLike = (code: string) => REACTFLOW_LIKE.test(code);

type ReactFlowPayload = {
  nodes: ReactFlowNode[];
  edges: Edge[];
  viewport?: Viewport;
};

const sanitizeReactFlowJson = (code: string) => {
  const trimmed = code.trim();
  const noLineComments = trimmed.replace(/\/\/.*$/gm, '');
  const noBlockComments = noLineComments.replace(/\/\*[\s\S]*?\*\//g, '');
  const noTrailingCommas = noBlockComments.replace(/,\s*([}\]])/g, '$1');
  return noTrailingCommas;
};

const extractJsonCandidate = (code: string) => {
  const start = code.indexOf('{');
  const end = code.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return code.slice(start, end + 1);
  }
  return code;
};

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const normalizeReactFlowData = (payload: ReactFlowPayload): ReactFlowPayload => {
  let nodes = payload.nodes || [];
  let edges = payload.edges || [];

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 100 });

  const styledNodes = nodes.map((node, idx) => {
    const bgColor = node.data?.color || node.style?.background || PALETTE[idx % PALETTE.length];
    return {
      ...node,
      data: node.data || { label: node.id },
      style: { 
        ...node.style, 
        background: bgColor,
        color: '#ffffff', 
        border: '2px solid rgba(0,0,0,0.1)',
        borderRadius: '16px',
        padding: '16px 24px',
        fontSize: '13px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: 180,
        textAlign: 'center'
      }
    };
  });

  const styledEdges = edges.map(edge => {
    const edgeColor = edge.style?.stroke || 'var(--text-muted)';
    return {
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: edgeColor, strokeWidth: 3, opacity: 0.6, ...edge.style },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: edgeColor,
        width: 20,
        height: 20
      }
    };
  });

  styledNodes.forEach(node => dagreGraph.setNode(node.id, { width: 200, height: 80 }));
  styledEdges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layedOutNodes = styledNodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x - 100, y: nodeWithPosition.y - 40 }
    };
  });

  return { ...payload, nodes: layedOutNodes, edges: styledEdges };
};

const parseReactFlowPayload = (code: string): ReactFlowPayload | null => {
  const raw = extractJsonCandidate(code);
  const sanitized = sanitizeReactFlowJson(raw);
  const candidates = [sanitized];
  if (!sanitized.trim().startsWith('{') && isReactFlowLike(sanitized)) candidates.push(`{${sanitized}}`);

  for (const candidate of candidates) {
    try {
      const parsed = json5.parse(candidate);
      if (parsed && Array.isArray(parsed.nodes)) return normalizeReactFlowData(parsed);
    } catch (err) { continue; }
  }
  return null;
};

export const ReactFlowBlock = ({ code }: { code: string }) => {
  const [nodes, setNodes] = useState<ReactFlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  useEffect(() => {
    const parsed = parseReactFlowPayload(code);
    if (parsed) {
      setRenderError(null);
      setNodes(parsed.nodes);
      setEdges(parsed.edges);
    } else {
      setRenderError('Unable to render this React Flow diagram.');
    }
  }, [code]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  if (renderError) return null;

  return (
    <div className={`reactflow-diagram my-8 rounded-[2.5rem] border ${isScreenshotMode ? 'border-transparent bg-white shadow-none' : 'border-[var(--border)] bg-[var(--bg-sidebar)]/30 shadow-2xl'} overflow-hidden w-full backdrop-blur-xl animate-in zoom-in-95 duration-700`} style={{ height: '500px' }}>
      <div className={`flex items-center justify-between px-8 py-4 ${isScreenshotMode ? 'hidden' : 'border-b border-[var(--border)] bg-[var(--bg-card)]/60'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Neural Architecture</span>
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        style={{ width: '100%', height: '100%' }}
      >
        {!isScreenshotMode && <Background color="var(--accent)" gap={24} size={1.5} style={{ opacity: 0.1 }} />}
        {!isScreenshotMode && <MiniMap nodeColor={(n) => n.style?.background as string || 'var(--accent)'} maskColor="rgba(0,0,0,0.2)" className="rounded-2xl border border-[var(--border)]" />}
        {!isScreenshotMode && <Controls className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl m-5" />}
      </ReactFlow>
    </div>
  );
};
