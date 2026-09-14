import React, { useState, useRef } from 'react';
import { tspBruteForce } from '../../algorithms/graph/graphAlgos';
import { Button } from '../common/Controls';

const CANVAS_W = 800;
const CANVAS_H = 360;
const NODE_R   = 18;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * TSP Held-Karp Dynamic Programming (exact, O(n² · 2ⁿ))
 * Returns { bestPath, minCost, allAttempts }
 */
function tspDP(nodes, edges) {
  const n = nodes.length;
  if (n < 2) return { bestPath: [], minCost: 0, allAttempts: [] };
  if (n > 15) return { error: 'Too many nodes for DP! (max 15)' };

  const ids = nodes.map(nd => nd.id);
  const idx = Object.fromEntries(ids.map((id, i) => [id, i]));

  const getW = (a, b) => {
    const e = edges.find(e =>
      (e.from === ids[a] && e.to === ids[b]) ||
      (e.from === ids[b] && e.to === ids[a])
    );
    return e ? e.weight : Infinity;
  };

  const INF = 1e9;
  const full = (1 << n) - 1;
  // dp[mask][i] = min cost to visit all nodes in mask, ending at i (starting from 0)
  const dp   = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  const prev = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

  dp[1][0] = 0; // start at node 0

  for (let mask = 1; mask < (1 << n); mask++) {
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u))) continue;
      if (dp[mask][u] === INF) continue;
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        const w = getW(u, v);
        if (w === Infinity) continue;
        const newMask = mask | (1 << v);
        const newCost = dp[mask][u] + w;
        if (newCost < dp[newMask][v]) {
          dp[newMask][v] = newCost;
          prev[newMask][v] = u;
        }
      }
    }
  }

  // Find best return to start
  let minCost = INF, last = -1;
  for (let u = 1; u < n; u++) {
    if (dp[full][u] === INF) continue;
    const w = getW(u, 0);
    if (w === Infinity) continue;
    const tot = dp[full][u] + w;
    if (tot < minCost) { minCost = tot; last = u; }
  }

  if (last === -1) return { bestPath: [], minCost: Infinity, allAttempts: [] };

  // Backtrack path
  const pathIdx = [];
  let mask = full, u = last;
  while (u !== -1) {
    pathIdx.unshift(u);
    const p = prev[mask][u];
    mask ^= (1 << u);
    u = p;
  }
  pathIdx.push(0); // back to start

  return {
    bestPath: pathIdx.map(i => ids[i]),
    minCost,
    allAttempts: [],
  };
}

/* ── Random node generator ── */
const generateNodes = (count) => {
  const padding = 60;
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    label: i,
    x: padding + Math.random() * (CANVAS_W - 2 * padding),
    y: padding + Math.random() * (CANVAS_H - 2 * padding),
  }));
};

const buildFullEdges = (nds) => {
  const es = [];
  for (let i = 0; i < nds.length; i++) {
    for (let j = i + 1; j < nds.length; j++) {
      const w = Math.round(Math.hypot(nds[i].x - nds[j].x, nds[i].y - nds[j].y) / 12);
      es.push({ from: nds[i].id, to: nds[j].id, weight: w });
    }
  }
  return es;
};

const TSPVisualizer = () => {
  const [nodes, setNodes]               = useState([]);
  const [edges, setEdges]               = useState([]);
  const [bestPath, setBestPath]         = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState([]);
  const [minCost, setMinCost]           = useState(null);
  const [isRunning, setIsRunning]       = useState(false);
  const [method, setMethod]             = useState('brute');
  const [nodeCount, setNodeCount]       = useState(6);
  const [message, setMessage]           = useState('Generate nodes, then run TSP');
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const canvasRef = useRef(null);

  const handleGenerate = () => {
    const nds = generateNodes(nodeCount);
    const es  = buildFullEdges(nds);
    setNodes(nds);
    setEdges(es);
    setBestPath([]);
    setCurrentAttempt([]);
    setMinCost(null);
    setAttemptsCount(0);
    setTotalAttempts(0);
    setMessage(`Generated ${nodeCount} nodes with ${es.length} edges (complete graph)`);
  };

  const getSVGPoint = (e) => {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top)  * (CANVAS_H / rect.height),
    };
  };

  const handleCanvasClick = (e) => {
    if (isRunning) return;
    const { x, y } = getSVGPoint(e);
    const newNode = { id: String(nodes.length), label: nodes.length, x, y };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setEdges(buildFullEdges(newNodes));
    setBestPath([]);
    setCurrentAttempt([]);
    setMinCost(null);
    setMessage(`Added node ${newNode.label} — total: ${newNodes.length}`);
  };

  const handleRun = async () => {
    if (nodes.length < 3) { setMessage('Need at least 3 nodes!'); return; }
    if (method === 'brute' && nodes.length > 8) { setMessage('⚠ Brute force capped at 8 nodes. Use DP or reduce nodes.'); return; }
    if (method === 'dp'    && nodes.length > 15) { setMessage('⚠ DP capped at 15 nodes.'); return; }

    setIsRunning(true);
    setBestPath([]);
    setCurrentAttempt([]);
    setMinCost(null);
    setMessage('Running TSP…');

    if (method === 'brute') {
      const result = tspBruteForce(nodes, edges);
      if (result.error) { setMessage(result.error); setIsRunning(false); return; }

      const { allAttempts, bestPath: bp, minCost: mc } = result;
      setTotalAttempts(allAttempts.length);

      for (let i = 0; i < allAttempts.length; i++) {
        setCurrentAttempt(allAttempts[i].path);
        setAttemptsCount(i + 1);
        setMessage(`Checking route ${i + 1} / ${allAttempts.length} — cost: ${allAttempts[i].cost}`);
        await sleep(Math.max(40, 300 - allAttempts.length * 4));
      }

      setBestPath(bp);
      setCurrentAttempt([]);
      setMinCost(mc);
      setMessage(`✅ Brute Force done! Optimal cost: ${mc} (checked ${allAttempts.length} routes)`);
    } else {
      setMessage('Running Held-Karp DP…');
      await sleep(300);
      const result = tspDP(nodes, edges);
      if (result.error) { setMessage(result.error); setIsRunning(false); return; }

      // Animate path drawing
      for (let i = 0; i <= result.bestPath.length; i++) {
        setBestPath(result.bestPath.slice(0, i + 1));
        await sleep(200);
      }
      setMinCost(result.minCost);
      setMessage(`✅ DP (Held-Karp) done! Optimal cost: ${result.minCost}`);
    }

    setIsRunning(false);
  };

  /* ─── Edge drawing helper ─── */
  const pathEdges = (path) => {
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      segs.push([path[i], path[i + 1]]);
    }
    return segs;
  };

  const getNode = (id) => nodes.find(n => n.id === id);

  const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">

      {/* ── Header banner ── */}
      <div className="card p-4 dark:bg-dark-surface shadow-xl shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <h2 className="text-lg font-black gradient-text">Travelling Salesman Problem</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Find the shortest route visiting every city exactly once and returning to start.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-3 ml-auto">
            {/* Method selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</label>
              <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-xl">
                {[
                  { key: 'brute', label: '🔍 Brute Force', cap: '≤ 8 nodes' },
                  { key: 'dp',    label: '🧮 Held-Karp DP',  cap: '≤ 15 nodes' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMethod(m.key)} disabled={isRunning}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${method === m.key ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Node count */}
            <div className="flex flex-col gap-1 min-w-[130px]">
              <div className="flex justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nodes</label>
                <span className="text-[10px] font-black text-primary">{nodeCount}</span>
              </div>
              <input type="range" min={3} max={method === 'brute' ? 8 : 12} value={nodeCount}
                onChange={e => setNodeCount(+e.target.value)} disabled={isRunning} className="input-range" />
            </div>

            <Button variant="secondary" onClick={handleGenerate} disabled={isRunning}>🎲 Generate</Button>
            <Button variant="primary"   onClick={handleRun}      disabled={isRunning || nodes.length < 3}>
              {isRunning ? '⏳ Running…' : '▶ Run TSP'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Message / stats ── */}
      <div className="card p-3 flex flex-wrap items-center gap-6 shrink-0 dark:bg-dark-surface animate-fade-in">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : minCost ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{message}</span>
        </div>
        {nodes.length >= 3 && (
          <div className="flex gap-4 ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Possible Routes: <span className="text-primary">{
              method === 'brute'
                ? `${factorial(Math.max(0, nodes.length - 1)).toLocaleString()}`
                : `2^${nodes.length} states`
            }</span></span>
            {attemptsCount > 0 && <span>Checked: <span className="text-amber-500">{attemptsCount}</span></span>}
            {minCost !== null && <span>Best Cost: <span className="text-emerald-400">{minCost}</span></span>}
          </div>
        )}
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 card dark:bg-dark-surface border-2 border-slate-200 dark:border-dark-border shadow-2xl min-h-[300px] overflow-hidden">
        <svg ref={canvasRef} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full h-full cursor-crosshair" onClick={handleCanvasClick}>
          <defs>
            <pattern id="tsp-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1" fill="rgba(148,163,184,0.15)" />
            </pattern>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
            </marker>
          </defs>
          <rect width={CANVAS_W} height={CANVAS_H} fill="url(#tsp-dots)" />

          {/* All edges (faint) */}
          {edges.map((e, i) => {
            const a = getNode(e.from), b = getNode(e.to);
            if (!a || !b) return null;
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
            );
          })}

          {/* Current attempt (brute force animation) */}
          {currentAttempt.length > 1 && pathEdges(currentAttempt).map(([f, t], i) => {
            const a = getNode(f), b = getNode(t);
            if (!a || !b) return null;
            return (
              <line key={`ca-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#6366f1" strokeWidth={2} opacity={0.5} strokeDasharray="5 3" />
            );
          })}

          {/* Best path */}
          {bestPath.length > 1 && pathEdges(bestPath).map(([f, t], i) => {
            const a = getNode(f), b = getNode(t);
            if (!a || !b) return null;
            return (
              <line key={`bp-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#fbbf24" strokeWidth={4} strokeLinecap="round"
                className="energy-flow"
                style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' }} />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const isOnBest  = bestPath.includes(node.id);
            const isStart   = node.id === '0';
            let fill   = '#1e293b', stroke = '#475569', glow = '';

            if (isStart)    { fill = '#3b82f6'; stroke = '#93c5fd'; glow = '0 0 14px rgba(59,130,246,0.7)'; }
            else if (isOnBest) { fill = '#fbbf24'; stroke = '#fde68a'; glow = '0 0 12px rgba(251,191,36,0.6)'; }

            return (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={isStart ? NODE_R + 4 : NODE_R}
                  fill={fill} stroke={stroke} strokeWidth={2}
                  style={{ filter: glow ? `drop-shadow(${glow})` : undefined, transition: 'all 0.3s ease' }} />
                <text x={node.x} y={node.y} dy=".35em" textAnchor="middle"
                  style={{ fontSize: '11px', fontWeight: '900', fill: 'white', pointerEvents: 'none', userSelect: 'none' }}>
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Empty hint */}
          {nodes.length === 0 && (
            <text x={CANVAS_W / 2} y={CANVAS_H / 2} textAnchor="middle"
              style={{ fontSize: '14px', fill: 'rgba(100,116,139,0.5)', fontWeight: '600' }}>
              Click to add cities, or use Generate
            </text>
          )}
        </svg>
      </div>

      {/* ── Complexity explanation ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        {[
          {
            label: 'Brute Force',
            time: 'O(n!)',
            space: 'O(n)',
            color: 'text-rose-500',
            desc: 'Tries every possible route. Exact but explodes — 10 cities = 3.6M routes!',
          },
          {
            label: 'Held-Karp DP',
            time: 'O(n² · 2ⁿ)',
            space: 'O(n · 2ⁿ)',
            color: 'text-primary',
            desc: 'Dynamic programming with bitmask. Exact solution, exponential but 100× faster than brute.',
          },
          {
            label: 'TSP Classification',
            time: 'NP-Hard',
            space: '—',
            color: 'text-amber-500',
            desc: 'No known polynomial algorithm. In practice, heuristics (nearest-neighbor, 2-opt) are used.',
          },
        ].map(({ label, time, space, color, desc }) => (
          <div key={label} className="card p-4 flex flex-col gap-2 dark:bg-dark-surface hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">{label}</span>
              <span className={`text-sm font-black font-mono ${color}`}>{time}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TSPVisualizer;
