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

const normalizeReactFlowData = (payload: ReactFlowPayload): ReactFlowPayload => {
  let nodes = payload.nodes || [];
  let edges = payload.edges || [];

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 80 });

  const styledNodes = nodes.map(node => ({
    ...node,
    data: node.data || { label: node.id },
    style: { 
      ...node.style, 
      background: 'var(--accent)', 
      color: '#ffffff', 
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }));

  const styledEdges = edges.map(edge => ({
    ...edge,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'var(--accent)', strokeWidth: 2, ...edge.style },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent)' }
  }));

  styledNodes.forEach(node => dagreGraph.setNode(node.id, { width: 160, height: 60 }));
  styledEdges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layedOutNodes = styledNodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x - 80, y: nodeWithPosition.y - 30 }
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

  if (renderError) return null; // Fallback handled by parent

  return (
    <div className="reactflow-diagram my-8 rounded-[2.5rem] border border-[var(--border)] overflow-hidden w-full bg-[var(--bg-sidebar)]/30 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-700" style={{ height: '500px' }}>
      <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]/60">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Neural Architecture</span>
        </div>
        <Maximize2 size={14} className="text-[var(--text-muted)] opacity-50" />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="var(--accent)" gap={24} size={1.5} style={{ opacity: 0.1 }} />
        <MiniMap nodeColor={() => 'var(--accent)'} maskColor="rgba(0,0,0,0.2)" className="rounded-2xl border border-[var(--border)]" />
        <Controls className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl m-5" />
      </ReactFlow>
    </div>
  );
};
