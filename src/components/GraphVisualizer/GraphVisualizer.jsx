import React, { useState, useRef, useImperativeHandle } from 'react';
import { bfsGraph, dfsGraph, dijkstraGraph } from '../../algorithms/graph/graphAlgos';
import { Button } from '../common/Controls';
import { ALGORITHM_COMPLEXITY } from '../../utils/helpers';

const CANVAS_W = 900;
const CANVAS_H = 320;

const PRESETS = {
  dijkstra: {
    label: 'Dijkstra Web',
    nodes: [
      { id: '0', x: 90,  y: 150, label: 0 }, { id: '1', x: 240, y: 70,  label: 1 },
      { id: '2', x: 430, y: 70,  label: 2 }, { id: '3', x: 630, y: 70,  label: 3 },
      { id: '4', x: 810, y: 150, label: 4 }, { id: '5', x: 630, y: 240, label: 5 },
      { id: '6', x: 430, y: 240, label: 6 }, { id: '7', x: 240, y: 240, label: 7 },
      { id: '8', x: 430, y: 155, label: 8 },
    ],
    edges: [
      { from: '0', to: '1', weight: 4 }, { from: '0', to: '7', weight: 8 },
      { from: '1', to: '2', weight: 8 }, { from: '1', to: '7', weight: 11 },
      { from: '2', to: '3', weight: 7 }, { from: '2', to: '5', weight: 4 },
      { from: '2', to: '8', weight: 2 }, { from: '3', to: '4', weight: 9 },
      { from: '3', to: '5', weight: 14 }, { from: '4', to: '5', weight: 10 },
      { from: '5', to: '6', weight: 2 }, { from: '6', to: '7', weight: 1 },
      { from: '6', to: '8', weight: 6 }, { from: '7', to: '8', weight: 7 },
    ],
    start: '0', target: '4',
  },
  bfs: {
    label: 'BFS Tree',
    nodes: [
      { id: '0', x: 450, y: 50,  label: 0 },
      { id: '1', x: 250, y: 140, label: 1 }, { id: '2', x: 450, y: 140, label: 2 }, { id: '3', x: 650, y: 140, label: 3 },
      { id: '4', x: 150, y: 240, label: 4 }, { id: '5', x: 350, y: 240, label: 5 },
      { id: '6', x: 550, y: 240, label: 6 }, { id: '7', x: 750, y: 240, label: 7 },
    ],
    edges: [
      { from: '0', to: '1', weight: 1 }, { from: '0', to: '2', weight: 1 }, { from: '0', to: '3', weight: 1 },
      { from: '1', to: '4', weight: 1 }, { from: '1', to: '5', weight: 1 },
      { from: '2', to: '6', weight: 1 }, { from: '3', to: '7', weight: 1 },
    ],
    start: '0', target: '7',
  },
  dfs: {
    label: 'DFS Labyrinth',
    nodes: [
      { id: '0', x: 100, y: 50,  label: 0 },
      { id: '1', x: 100, y: 155, label: 1 }, { id: '2', x: 100, y: 260, label: 2 },
      { id: '3', x: 300, y: 260, label: 3 }, { id: '4', x: 500, y: 260, label: 4 },
      { id: '5', x: 500, y: 155, label: 5 }, { id: '6', x: 500, y: 50,  label: 6 },
      { id: '7', x: 700, y: 50,  label: 7 }, { id: '8', x: 800, y: 155, label: 8 },
    ],
    edges: [
      { from: '0', to: '1', weight: 1 }, { from: '1', to: '2', weight: 1 },
      { from: '2', to: '3', weight: 1 }, { from: '3', to: '4', weight: 1 },
      { from: '4', to: '5', weight: 1 }, { from: '5', to: '6', weight: 1 },
      { from: '6', to: '7', weight: 1 }, { from: '7', to: '8', weight: 1 },
    ],
    start: '0', target: '8',
  },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const GraphVisualizer = React.forwardRef(({ selectedAlgo = 'dijkstra' }, ref) => {
  const [nodes, setNodes]               = useState([]);
  const [edges, setEdges]               = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [shortestPath, setShortestPath] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startNodeId, setStartNodeId]   = useState(null);
  const [targetNodeId, setTargetNodeId] = useState(null);
  const [message, setMessage]           = useState('Click canvas to add nodes · Click two nodes to connect them');
  const [animSpeed, setAnimSpeed]       = useState(350);
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    run:   (algo) => runAlgorithm(algo),
    clear: clearGraph,
    load:  () => loadPreset('dijkstra'),
  }));

  /* ── Interaction ───────────────────────── */
  const getSVGPoint = (e) => {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const handleCanvasClick = (e) => {
    if (isProcessing) return;
    const { x, y } = getSVGPoint(e);
    const clicked = nodes.find(n => Math.hypot(n.x - x, n.y - y) < 24);
    if (clicked) { handleNodeClick(clicked); return; }

    const newNode = { id: `n${Date.now()}`, x, y, label: nodes.length };
    setNodes(prev => [...prev, newNode]);
    setMessage(`Added Node ${newNode.label}`);
  };

  const handleNodeClick = (clicked) => {
    if (selectedNode && selectedNode.id !== clicked.id) {
      const exists = edges.find(e =>
        (e.from === selectedNode.id && e.to === clicked.id) ||
        (e.from === clicked.id && e.to === selectedNode.id)
      );
      if (!exists) {
        const weight = Math.max(1, Math.round(Math.hypot(selectedNode.x - clicked.x, selectedNode.y - clicked.y) / 20));
        setEdges(prev => [...prev, { from: selectedNode.id, to: clicked.id, weight }]);
        setMessage(`Connected Node ${selectedNode.label} ↔ Node ${clicked.label} (w=${weight})`);
      } else {
        setMessage('Edge already exists.');
      }
      setSelectedNode(null);
    } else if (selectedNode?.id === clicked.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(clicked);
      setMessage(`Node ${clicked.label} selected — click another node to connect, or set role below`);
    }
  };

  const setNodeRole = (nodeId, role) => {
    if (role === 'start') {
      setStartNodeId(nodeId);
      if (targetNodeId === nodeId) setTargetNodeId(null);
    } else {
      setTargetNodeId(nodeId);
      if (startNodeId === nodeId) setStartNodeId(null);
    }
    const node = nodes.find(n => n.id === nodeId);
    setMessage(`${role === 'start' ? '🟢' : '🔴'} Node ${node?.label} set as ${role.toUpperCase()}`);
    setSelectedNode(null);
  };

  /* ── Presets ───────────────────────────── */
  const loadPreset = (key) => {
    const preset = PRESETS[key] ?? PRESETS.dijkstra;
    clearGraph(false);
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setStartNodeId(preset.start);
    setTargetNodeId(preset.target);
    setMessage(`📋 "${preset.label}" preset loaded`);
  };

  const clearGraph = (resetMsg = true) => {
    setNodes([]);
    setEdges([]);
    setVisitedNodes(new Set());
    setStartNodeId(null);
    setTargetNodeId(null);
    setShortestPath([]);
    setSelectedNode(null);
    setActiveNodeId(null);
    if (resetMsg) setMessage('Graph cleared — click canvas to add nodes');
  };

  /* ── Algorithm ─────────────────────────── */
  const buildAdjList = (ns, es) => {
    const adj = {};
    ns.forEach(n => adj[n.id] = []);
    es.forEach(e => {
      adj[e.from].push({ id: e.to,   weight: e.weight });
      adj[e.to].push(  { id: e.from, weight: e.weight });
    });
    return adj;
  };

  const runAlgorithm = async (forcedAlgo) => {
    const algoToUse = forcedAlgo || selectedAlgo;
    if (!startNodeId || !targetNodeId) {
      setMessage('⚠ Set START and TARGET nodes first!');
      return;
    }
    setIsProcessing(true);
    setVisitedNodes(new Set());
    setShortestPath([]);
    setActiveNodeId(null);

    const adj = buildAdjList(nodes, edges);
    let result;
    if      (algoToUse === 'dijkstra') result = dijkstraGraph(adj, startNodeId, targetNodeId);
    else if (algoToUse === 'bfs')      result = bfsGraph(adj, startNodeId, targetNodeId);
    else if (algoToUse === 'dfs')      result = dfsGraph(adj, startNodeId, targetNodeId);

    if (!result) { setIsProcessing(false); return; }

    const { visitedOrder, shortestPath: path } = result;

    for (const nodeId of visitedOrder) {
      setActiveNodeId(nodeId);
      setVisitedNodes(prev => new Set(prev).add(nodeId));
      await sleep(animSpeed);
    }

    setActiveNodeId(null);
    if (path.length > 0) {
      setMessage(`✅ Path found! Length: ${path.length - 1} hops`);
      for (let i = 0; i < path.length; i++) {
        setShortestPath(prev => [...prev, path[i]]);
        await sleep(120);
      }
    } else {
      setMessage('❌ No path found between selected nodes.');
    }
    setIsProcessing(false);
  };

  /* ── Rendering ─────────────────────────── */
  const isEdgeOnPath = (edge) => {
    const fi = shortestPath.indexOf(edge.from);
    const ti = shortestPath.indexOf(edge.to);
    return fi !== -1 && ti !== -1 && Math.abs(fi - ti) === 1;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">
      {/* ── Control Bar ─── */}
      <div className="card p-4 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface shadow-xl">
        {/* Run buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Run Algorithm</label>
          <div className="flex gap-2">
            <Button variant="primary"    onClick={() => runAlgorithm('dijkstra')} disabled={isProcessing || nodes.length === 0}>Dijkstra</Button>
            <Button variant="secondary"  onClick={() => runAlgorithm('bfs')}      disabled={isProcessing || nodes.length === 0}>BFS</Button>
            <Button variant="secondary"  onClick={() => runAlgorithm('dfs')}      disabled={isProcessing || nodes.length === 0}>DFS</Button>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-dark-border mx-1" />

        {/* Presets */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Preset</label>
          <div className="flex gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <Button key={key} variant="accent" onClick={() => loadPreset(key)} disabled={isProcessing}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-dark-border mx-1" />

        {/* Speed */}
        <div className="flex flex-col gap-1 min-w-[130px]">
          <div className="flex justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anim Speed</label>
            <span className="text-[10px] font-black text-primary">{animSpeed}ms</span>
          </div>
          <input type="range" min={50} max={800} value={animSpeed}
            onChange={e => setAnimSpeed(+e.target.value)}
            className="input-range" disabled={isProcessing} />
        </div>

        {/* Node role selector & clear */}
        <div className="ml-auto flex items-center gap-3">
          {selectedNode && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl animate-fade-in">
              <span className="text-[10px] font-black text-slate-400">NODE {selectedNode.label}:</span>
              <button onClick={() => setNodeRole(selectedNode.id, 'start')}
                className="text-[10px] font-black bg-blue-500 px-2 py-0.5 rounded-lg text-white hover:bg-blue-600 transition-colors">
                🟢 START
              </button>
              <button onClick={() => setNodeRole(selectedNode.id, 'target')}
                className="text-[10px] font-black bg-rose-500 px-2 py-0.5 rounded-lg text-white hover:bg-rose-600 transition-colors">
                🔴 TARGET
              </button>
            </div>
          )}
          <Button variant="secondary" onClick={() => clearGraph()} disabled={isProcessing}>↺ Clear</Button>
        </div>
      </div>

      {/* ── Message bar ─── */}
      <div className="card px-4 py-2 shrink-0 dark:bg-dark-surface flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{message}</span>
      </div>

      {/* ── SVG Canvas ─── */}
      <div className="flex-1 card dark:bg-dark-surface border-2 border-slate-200 dark:border-dark-border overflow-hidden shadow-2xl min-h-[320px]">
        <svg
          ref={canvasRef}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {/* Grid pattern background */}
          <defs>
            <pattern id="grid-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1" fill="rgba(148,163,184,0.2)" />
            </pattern>
          </defs>
          <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid-dots)" />

          {/* Edges */}
          {edges.map((edge, idx) => {
            const from = nodes.find(n => n.id === edge.from);
            const to   = nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const onPath = isEdgeOnPath(edge);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            return (
              <g key={idx}>
                {/* Shadow */}
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="rgba(0,0,0,0.3)" strokeWidth={onPath ? 14 : 7} strokeLinecap="round" />
                {/* Main edge */}
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={onPath ? '#fbbf24' : 'rgba(100,116,139,0.45)'}
                  strokeWidth={onPath ? 6 : 3}
                  className={onPath ? 'energy-flow' : ''}
                  strokeLinecap="round" />
                {/* Weight label */}
                <circle cx={mx} cy={my} r={14} fill="#1e1e2e" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                <text x={mx} y={my} dy=".35em" textAnchor="middle"
                  style={{ fontSize: '11px', fontWeight: '900', fill: onPath ? '#fbbf24' : '#94a3b8' }}>
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isStart   = startNodeId  === node.id;
            const isTarget  = targetNodeId === node.id;
            const isVisited = visitedNodes.has(node.id);
            const isActive  = activeNodeId === node.id;
            const isOnPath  = shortestPath.includes(node.id);
            const isSelected = selectedNode?.id === node.id;

            let fillColor = '#1e293b';
            let strokeColor = '#475569';
            let glowColor = 'none';

            if (isStart)        { fillColor = '#3b82f6'; strokeColor = '#93c5fd'; glowColor = '0 0 16px rgba(59,130,246,0.7)'; }
            else if (isTarget)  { fillColor = '#ef4444'; strokeColor = '#fca5a5'; glowColor = '0 0 16px rgba(239,68,68,0.7)'; }
            else if (isOnPath)  { fillColor = '#fbbf24'; strokeColor = '#fde68a'; glowColor = '0 0 20px rgba(251,191,36,0.8)'; }
            else if (isActive)  { fillColor = '#4f46e5'; strokeColor = '#a5b4fc'; glowColor = '0 0 20px rgba(79,70,229,0.8)'; }
            else if (isVisited) { fillColor = '#4338ca'; strokeColor = '#818cf8'; }

            const r = isActive || isOnPath ? 22 : 18;

            return (
              <g key={node.id} style={{ cursor: 'pointer' }}>
                {/* Outer glow ring for selected */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r={r + 8}
                    fill="none" stroke="#4f46e5" strokeWidth={2} opacity={0.5}
                    style={{ animation: 'ringPulse 1.5s ease-in-out infinite' }} />
                )}
                {/* Node circle */}
                <circle cx={node.x} cy={node.y} r={r}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{
                    filter: glowColor !== 'none' ? `drop-shadow(${glowColor})` : undefined,
                    transition: 'all 0.25s ease',
                  }}
                />
                {/* Label */}
                <text x={node.x} y={node.y} dy=".35em" textAnchor="middle"
                  style={{
                    fontSize: '12px', fontWeight: '900', fill: 'white',
                    pointerEvents: 'none', userSelect: 'none',
                  }}>
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Legend ─── */}
      <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">
        {[
          { color: '#3b82f6', label: 'Start' },
          { color: '#ef4444', label: 'Target' },
          { color: '#4338ca', label: 'Explored' },
          { color: '#4f46e5', label: 'Active' },
          { color: '#fbbf24', label: 'Shortest Path' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

GraphVisualizer.displayName = 'GraphVisualizer';
export default GraphVisualizer;
