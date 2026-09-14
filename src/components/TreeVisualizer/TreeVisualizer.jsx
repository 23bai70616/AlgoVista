import React, { useState, useEffect } from 'react';
import { BST } from '../../algorithms/tree/bst';
import { Button } from '../common/Controls';
import { ALGORITHM_COMPLEXITY } from '../../utils/helpers';

const CANVAS_W   = 900;
const CANVAS_H   = 460;
const NODE_R     = 22;
const LEVEL_H    = 90;

/* ── Layout calculator ── */
const computeLayout = (root) => {
  const nodes = [];
  const edges = [];

  const place = (node, x, y, offset) => {
    if (!node) return;
    nodes.push({ id: node.id, value: node.value, x, y });
    if (node.left) {
      const nx = x - offset, ny = y + LEVEL_H;
      edges.push({ x1: x, y1: y, x2: nx, y2: ny });
      place(node.left, nx, ny, Math.max(offset / 1.8, 30));
    }
    if (node.right) {
      const nx = x + offset, ny = y + LEVEL_H;
      edges.push({ x1: x, y1: y, x2: nx, y2: ny });
      place(node.right, nx, ny, Math.max(offset / 1.8, 30));
    }
  };

  place(root, CANVAS_W / 2, 50, CANVAS_W / 4);
  return { nodes, edges };
};

const PRESETS = [
  { label: 'BST', values: [50, 30, 70, 20, 40, 60, 80] },
  { label: 'Skewed', values: [10, 20, 30, 40, 50] },
  { label: 'Balanced', values: [40, 20, 60, 10, 30, 50, 70, 5, 15, 25, 35] },
];

const TRAVERSAL_COMPLEXITY = {
  inorder:   { time: 'O(n)', space: 'O(h)', note: 'Yields nodes in sorted order (Left → Root → Right)' },
  preorder:  { time: 'O(n)', space: 'O(h)', note: 'Root first, then subtrees (Root → Left → Right)' },
  postorder: { time: 'O(n)', space: 'O(h)', note: 'Children before parent (Left → Right → Root)' },
  insert:    { time: 'O(log n) avg', space: 'O(1)', note: 'O(n) worst case for unbalanced trees' },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const TreeVisualizer = () => {
  const [bst, setBst]                     = useState(new BST());
  const [renderData, setRenderData]       = useState({ nodes: [], edges: [] });
  const [activeNodeId, setActiveNodeId]   = useState(null);
  const [visitedIds, setVisitedIds]       = useState(new Set());
  const [inputValue, setInputValue]       = useState('');
  const [isProcessing, setIsProcessing]   = useState(false);
  const [message, setMessage]             = useState('Insert a value or load a preset to build the BST');
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [activeOp, setActiveOp]           = useState('insert');

  useEffect(() => {
    if (bst.root) {
      setRenderData(computeLayout(bst.root));
    } else {
      setRenderData({ nodes: [], edges: [] });
    }
  }, [bst]);

  /* ── Actions ── */
  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setIsProcessing(true);
    setActiveOp('insert');
    setMessage(`Inserting ${val}…`);
    setVisitedIds(new Set());

    // Rebuild from all existing values + new one
    const existing = collectValues(bst.root);
    const animations = [];
    const newBst = new BST();
    for (const v of existing) newBst.insert(v);
    newBst.insert(val, animations);

    for (const anim of animations) {
      if (anim.type === 'compare') {
        setActiveNodeId(anim.nodeId);
        setVisitedIds(prev => new Set(prev).add(anim.nodeId));
      } else if (anim.type === 'added' || anim.type === 'visit') {
        setBst(Object.assign(Object.create(Object.getPrototypeOf(newBst)), newBst));
        setActiveNodeId(anim.nodeId);
      }
      await sleep(500);
    }

    setBst(Object.assign(Object.create(Object.getPrototypeOf(newBst)), newBst));
    setActiveNodeId(null);
    setIsProcessing(false);
    setMessage(`Inserted ${val} ✓`);
  };

  const collectValues = (node) => {
    if (!node) return [];
    return [node.value, ...collectValues(node.left), ...collectValues(node.right)];
  };

  const handleTraversal = async (type) => {
    if (!bst.root) { setMessage('Tree is empty — insert some values first'); return; }
    setIsProcessing(true);
    setActiveOp(type);
    setVisitedIds(new Set());
    setTraversalOrder([]);
    setMessage(`Running ${type} traversal…`);

    const animations = [];
    if (type === 'inorder')   bst.inorder(bst.root, animations);
    if (type === 'preorder')  bst.preorder(bst.root, animations);
    if (type === 'postorder') bst.postorder(bst.root, animations);

    const order = [];
    for (const anim of animations) {
      setActiveNodeId(anim.nodeId);
      setVisitedIds(prev => new Set(prev).add(anim.nodeId));
      order.push(renderData.nodes.find(n => n.id === anim.nodeId)?.value ?? '?');
      setTraversalOrder([...order]);
      await sleep(550);
    }

    setActiveNodeId(null);
    setIsProcessing(false);
    setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal complete`);
  };

  const loadPreset = (values) => {
    const newBst = new BST();
    for (const v of values) newBst.insert(v);
    setBst(Object.assign(Object.create(Object.getPrototypeOf(newBst)), newBst));
    setVisitedIds(new Set());
    setActiveNodeId(null);
    setTraversalOrder([]);
    setMessage(`Preset loaded (${values.join(', ')})`);
  };

  const resetTree = () => {
    setBst(new BST());
    setVisitedIds(new Set());
    setActiveNodeId(null);
    setTraversalOrder([]);
    setMessage('Tree cleared — insert values or load a preset');
  };

  const info = TRAVERSAL_COMPLEXITY[activeOp] ?? TRAVERSAL_COMPLEXITY.insert;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">
      {/* ── Controls ── */}
      <div className="card p-4 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface shadow-xl">
        {/* Insert */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insert Value</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm font-mono font-bold outline-none focus:ring-2 ring-primary/40 dark:text-white w-24"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="e.g. 42"
              disabled={isProcessing}
              onKeyDown={e => e.key === 'Enter' && handleInsert()}
            />
            <Button variant="primary" onClick={handleInsert} disabled={isProcessing || !inputValue}>Insert</Button>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-dark-border" />

        {/* Traversals */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traversal</label>
          <div className="flex gap-2">
            {['preorder', 'inorder', 'postorder'].map(t => (
              <Button key={t} variant="secondary" onClick={() => handleTraversal(t)} disabled={isProcessing || !bst.root}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-dark-border" />

        {/* Presets */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presets</label>
          <div className="flex gap-2">
            {PRESETS.map(p => (
              <Button key={p.label} variant="accent" onClick={() => loadPreset(p.values)} disabled={isProcessing}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <Button variant="secondary" className="ml-auto self-end" onClick={resetTree} disabled={isProcessing}>↺ Clear</Button>
      </div>

      {/* ── Status + traversal result ── */}
      <div className="card p-3 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{message}</span>
        </div>
        {traversalOrder.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order:</span>
            {traversalOrder.map((v, i) => (
              <span key={i}
                className="text-[11px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-fade-in">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── SVG Canvas ── */}
      <div className="flex-1 card dark:bg-dark-surface shadow-inner min-h-[380px] overflow-auto flex items-center justify-center p-4">
        {bst.root ? (
          <svg width={CANVAS_W} height={CANVAS_H} className="overflow-visible">
            {/* Edges */}
            {renderData.edges.map((edge, i) => (
              <line key={i} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke="#334155" strokeWidth={2} strokeLinecap="round"
                style={{ transition: 'all 0.4s ease' }} />
            ))}
            {/* Nodes */}
            {renderData.nodes.map(node => {
              const isActive  = activeNodeId === node.id;
              const isVisited = visitedIds.has(node.id);

              let fill   = '#1e293b';
              let stroke = '#475569';
              let textFill = '#94a3b8';
              let glow   = '';

              if (isActive) {
                fill   = '#f59e0b'; stroke = '#fde68a'; textFill = '#1c1917';
                glow   = '0 0 20px rgba(245,158,11,0.8)';
              } else if (isVisited) {
                fill   = '#10b981'; stroke = '#6ee7b7'; textFill = '#fff';
                glow   = '0 0 10px rgba(16,185,129,0.4)';
              }

              return (
                <g key={node.id} style={{ transition: 'all 0.5s ease' }}>
                  <circle cx={node.x} cy={node.y} r={isActive ? NODE_R + 4 : NODE_R}
                    fill={fill} stroke={stroke} strokeWidth={2}
                    style={{ filter: glow ? `drop-shadow(${glow})` : undefined, transition: 'all 0.3s ease', transformOrigin: `${node.x}px ${node.y}px` }} />
                  <text x={node.x} y={node.y} dy=".35em" textAnchor="middle"
                    style={{ fontSize: '13px', fontWeight: '900', fill: textFill, pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.3s ease' }}>
                    {node.value}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-400 dark:text-slate-600">
            <svg viewBox="0 0 64 64" className="w-16 h-16 opacity-30">
              <circle cx="32" cy="12" r="8" fill="currentColor" />
              <circle cx="16" cy="36" r="8" fill="currentColor" />
              <circle cx="48" cy="36" r="8" fill="currentColor" />
              <line x1="32" y1="20" x2="16" y2="28" stroke="currentColor" strokeWidth="3" />
              <line x1="32" y1="20" x2="48" y2="28" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest">Insert values to build the BST</span>
          </div>
        )}
      </div>

      {/* ── Complexity cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Operation', value: activeOp.charAt(0).toUpperCase() + activeOp.slice(1) },
          { label: 'Time Complexity', value: info.time,  color: 'text-primary' },
          { label: 'Space Complexity', value: info.space, color: 'text-secondary' },
          { label: 'Nodes in Tree',   value: renderData.nodes.length, color: 'text-emerald-500' },
        ].map(({ label, value, color = 'text-slate-700 dark:text-slate-200' }) => (
          <div key={label} className="card p-4 flex flex-col items-center gap-1 dark:bg-dark-surface hover:border-primary/40 transition-colors">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xl font-black font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>
      <div className="card p-3 shrink-0 dark:bg-dark-surface text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">{info.note}</p>
      </div>
    </div>
  );
};

export default TreeVisualizer;
