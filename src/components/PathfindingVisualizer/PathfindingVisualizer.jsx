import React, { useState, useEffect } from 'react';
import Node from './Node';
import GraphVisualizer from '../GraphVisualizer/GraphVisualizer';
import { dijkstra, getNodesInShortestPathOrder } from '../../algorithms/pathfinding/dijkstra';
import { bfs, dfs } from '../../algorithms/pathfinding/pathfindingAlgos';
import { aStar } from '../../algorithms/pathfinding/aStar';
import { Button } from '../common/Controls';
import { ALGORITHM_COMPLEXITY } from '../../utils/helpers';

const GRID_ROWS = 20;
const GRID_COLS = 52;

const ALGO_INFO = {
  dijkstra: { label: "Dijkstra's", tag: 'Weighted', color: 'primary',   guarantee: '✅ Shortest Path' },
  bfs:      { label: 'BFS',        tag: 'Unweighted', color: 'blue',    guarantee: '✅ Shortest Path' },
  dfs:      { label: 'DFS',        tag: 'Unweighted', color: 'indigo',  guarantee: '❌ No Guarantee'  },
  astar:    { label: 'A*',         tag: 'Weighted',   color: 'secondary', guarantee: '✅ Shortest Path' },
};

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [viewMode, setViewMode]         = useState('grid');
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [startNode]  = useState({ row: 10, col: 8 });
  const [finishNode] = useState({ row: 10, col: 43 });
  const [selectedAlgo, setSelectedAlgo] = useState('astar');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isWeightMode, setIsWeightMode]   = useState(false);
  const [stats, setStats] = useState(null);

  const graphRef = React.useRef(null);

  useEffect(() => {
    setGrid(getInitialGrid());
  }, []);

  /* ── Grid helpers ─────────────────────────────── */
  const getInitialGrid = () => {
    const g = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push(createNode(col, row));
      }
      g.push(currentRow);
    }
    return g;
  };

  const createNode = (col, row) => ({
    col, row,
    isStart:  row === startNode.row  && col === startNode.col,
    isFinish: row === finishNode.row && col === finishNode.col,
    distance: Infinity,
    isVisited: false,
    isWall:    false,
    isWeight:  false,
    previousNode: null,
  });

  /* ── Mouse handlers ───────────────────────────── */
  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    setGrid(g => toggleState(g, row, col));
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isVisualizing) return;
    setGrid(g => toggleState(g, row, col));
  };

  const handleMouseUp = () => setMouseIsPressed(false);

  const toggleState = (grid, row, col) => {
    const newGrid = grid.map(r => r.slice());
    const node = newGrid[row][col];
    if (node.isStart || node.isFinish) return newGrid;
    newGrid[row][col] = {
      ...node,
      isWall:   !isWeightMode ? !node.isWall   : false,
      isWeight:  isWeightMode ? !node.isWeight : false,
    };
    return newGrid;
  };

  /* ── Run algorithm ────────────────────────────── */
  const handleRun = () => {
    if (viewMode === 'grid') visualizeAlgorithm();
    else if (graphRef.current) graphRef.current.run();
  };

  const handleClear = () => {
    if (viewMode === 'grid') clearGrid();
    else if (graphRef.current) graphRef.current.clear();
  };

  const visualizeAlgorithm = () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    setStats(null);

    const startNodeObj  = grid[startNode.row][startNode.col];
    const finishNodeObj = grid[finishNode.row][finishNode.col];

    let visitedNodesInOrder = [];
    const t0 = performance.now();

    if (selectedAlgo === 'dijkstra') visitedNodesInOrder = dijkstra(grid, startNodeObj, finishNodeObj);
    else if (selectedAlgo === 'bfs')  visitedNodesInOrder = bfs(grid, startNodeObj, finishNodeObj);
    else if (selectedAlgo === 'dfs')  visitedNodesInOrder = dfs(grid, startNodeObj, finishNodeObj);
    else if (selectedAlgo === 'astar') visitedNodesInOrder = aStar(grid, startNodeObj, finishNodeObj);

    const t1 = performance.now();
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeObj);

    setStats({
      visited:  visitedNodesInOrder.length,
      pathLen:  nodesInShortestPathOrder.length > 1 ? nodesInShortestPathOrder.length - 1 : 0,
      timeMs:   (t1 - t0).toFixed(2),
      found:    nodesInShortestPathOrder.length > 1,
    });

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animateAlgorithm = (visited, path) => {
    for (let i = 0; i <= visited.length; i++) {
      if (i === visited.length) {
        setTimeout(() => animateShortestPath(path), 12 * i);
        return;
      }
      setTimeout(() => {
        const node = visited[i];
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el && !node.isStart && !node.isFinish) {
          el.className = 'w-[22px] h-[22px] border-[0.5px] border-white/5 inline-block node-visited';
        }
      }, 12 * i);
    }
  };

  const animateShortestPath = (path) => {
    for (let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const node = path[i];
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el && !node.isStart && !node.isFinish) {
          el.className = 'w-[22px] h-[22px] border-[0.5px] border-white/5 inline-block node-shortest-path';
        }
        if (i === path.length - 1) setIsVisualizing(false);
      }, 55 * i);
    }
    if (path.length === 0) setIsVisualizing(false);
  };

  const clearGrid = () => {
    if (isVisualizing) return;
    setStats(null);
    setGrid(getInitialGrid());
    // Reset DOM classes
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const el = document.getElementById(`node-${row}-${col}`);
        if (!el) continue;
        const base = 'w-[22px] h-[22px] border-[0.5px] border-slate-100 dark:border-white/5 inline-block';
        el.className = base;
        if (row === startNode.row  && col === startNode.col)  el.classList.add('node-start');
        if (row === finishNode.row && col === finishNode.col) el.classList.add('node-finish');
      }
    }
  };

  const info = ALGO_INFO[selectedAlgo];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">

      {/* ── Control Bar ─────────────────────────────── */}
      <div className="card p-4 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface shadow-xl">
        {/* Algorithm selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Algorithm</label>
          <select
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg outline-none focus:ring-2 ring-primary/40 font-semibold text-sm text-slate-800 dark:text-white min-w-[170px]"
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            disabled={isVisualizing}
          >
            <option value="astar">A* (Heuristic)</option>
            <option value="dijkstra">Dijkstra's (Weighted)</option>
            <option value="bfs">BFS (Unweighted)</option>
            <option value="dfs">DFS (Unweighted)</option>
          </select>
        </div>

        {/* Info badge */}
        {info && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-dark-border px-2 py-1 rounded-lg">{info.tag}</span>
            <span className="text-[10px] font-bold text-slate-500">{info.guarantee}</span>
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-xl ml-2 shrink-0">
          {['grid', 'graph'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              {mode === 'grid' ? '⬜ Grid' : '⬡ Nodes'}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">
          {viewMode === 'grid' ? (
            <Button
              variant={isWeightMode ? 'accent' : 'secondary'}
              onClick={() => setIsWeightMode(v => !v)}
              disabled={isVisualizing}
            >
              {isWeightMode ? '⛰️ Weighing' : '⛰️ Add Weight'}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => graphRef.current?.load()} disabled={isVisualizing}>
              📋 Load Preset
            </Button>
          )}
          <Button variant="secondary" onClick={handleClear} disabled={isVisualizing}>↺ Clear</Button>
          <Button variant="primary" onClick={handleRun} disabled={isVisualizing}>
            {isVisualizing ? '⏳ Running…' : `▶ Run ${info?.label ?? selectedAlgo}`}
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────── */}
      {stats && (
        <div className="card p-3 flex flex-wrap justify-center gap-6 shrink-0 dark:bg-dark-surface animate-fade-in">
          <Stat label="Nodes Explored" value={stats.visited} color="indigo" />
          <Stat label="Path Length" value={stats.found ? stats.pathLen : 'No path'} color={stats.found ? 'amber' : 'rose'} />
          <Stat label="Compute Time" value={`${stats.timeMs} ms`} color="primary" />
          <Stat label="Time Complexity" value={ALGORITHM_COMPLEXITY[selectedAlgo]?.time} color="secondary" />
        </div>
      )}

      {/* ── Main View ─────────────────────────────── */}
      {viewMode === 'grid' ? (
        <>
          <div className="flex-1 card flex items-center justify-center dark:bg-dark-surface shadow-inner min-h-[400px] overflow-auto p-4">
            <div
              className="border border-slate-200 dark:border-dark-border rounded-sm shadow-2xl overflow-hidden"
              onMouseLeave={handleMouseUp}
            >
              {grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex leading-[0]">
                  {row.map((node, nodeIdx) => (
                    <Node
                      key={nodeIdx}
                      col={node.col}
                      isFinish={node.isFinish}
                      isStart={node.isStart}
                      isWall={node.isWall}
                      isWeight={node.isWeight}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(r, c) => handleMouseDown(r, c)}
                      onMouseEnter={(r, c) => handleMouseEnter(r, c)}
                      onMouseUp={handleMouseUp}
                      row={node.row}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-5 text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">
            {[
              { cls: 'node-start w-4 h-4 rounded-sm', label: 'Start' },
              { cls: 'node-finish w-4 h-4 rounded-sm', label: 'Target' },
              { cls: 'bg-slate-800 w-4 h-4 rounded-sm', label: 'Wall' },
              { cls: 'bg-slate-400/50 w-4 h-4 rounded-sm', label: 'Weight (10×)' },
              { cls: 'bg-indigo-500 w-4 h-4 rounded-sm', label: 'Explored' },
              { cls: 'bg-amber-400 w-4 h-4 rounded-sm shadow-[0_0_8px_#fbbf24]', label: 'Shortest Path' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cls} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-[600px] flex flex-col">
          <GraphVisualizer ref={graphRef} selectedAlgo={selectedAlgo === 'astar' ? 'dijkstra' : selectedAlgo} />
        </div>
      )}
    </div>
  );
};

/* Helper stat chip */
const Stat = ({ label, value, color }) => {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  };
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${colorMap[color] ?? colorMap.primary}`}>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-lg font-black font-mono">{value}</span>
    </div>
  );
};

export default PathfindingVisualizer;
