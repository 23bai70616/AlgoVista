import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateBubbleSortSteps,
  generateMergeSortSteps,
  generateQuickSortSteps,
  ALGO_CODE,
} from '../../algorithms/notebook/notebookGenerators';

// ─── Constants ───────────────────────────────────────────────────────────────

const ALGORITHMS = [
  { key: 'bubble', label: '🫧 Bubble Sort',  time: 'O(n²)',        space: 'O(1)'     },
  { key: 'merge',  label: '🔀 Merge Sort',   time: 'O(n log n)',   space: 'O(n)'     },
  { key: 'quick',  label: '⚡ Quick Sort',   time: 'O(n log n)*',  space: 'O(log n)' },
];

const DEFAULT_INPUT = '5, 3, 8, 4, 2';

const STEP_TYPE_COLORS = {
  intro:        { bg: 'bg-blue-500/10  border-blue-500/30',  dot: 'bg-blue-400',    label: 'INTRO'    },
  pass_start:   { bg: 'bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-400', label: 'PASS'     },
  compare:      { bg: 'bg-amber-500/10 border-amber-500/30',  dot: 'bg-amber-400',  label: 'COMPARE'  },
  swap:         { bg: 'bg-rose-500/10  border-rose-500/30',   dot: 'bg-rose-400',   label: 'SWAP'     },
  pass_end:     { bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', label: 'DONE' },
  final:        { bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', label: 'FINAL' },
  split:        { bg: 'bg-indigo-500/10 border-indigo-500/30', dot: 'bg-indigo-400', label: 'SPLIT'   },
  merge_compare:{ bg: 'bg-amber-500/10 border-amber-500/30',  dot: 'bg-amber-400',  label: 'MERGE'    },
  merge_result: { bg: 'bg-teal-500/10  border-teal-500/30',   dot: 'bg-teal-400',   label: 'MERGED'   },
  pivot_select: { bg: 'bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-400', label: 'PIVOT'   },
  pivot_place:  { bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', label: 'PLACED'},
  recurse:      { bg: 'bg-blue-500/10  border-blue-500/30',   dot: 'bg-blue-400',   label: 'RECURSE'  },
};

// ─── Syntax Highlighter ───────────────────────────────────────────────────────

const KEYWORDS = new Set([
  'function','const','let','var','return','if','else','for','while',
  'of','in','new','break','continue','true','false','null','undefined',
  'Math','Array','slice','length','push','floor',
]);

function tokenizeLine(line) {
  const tokens = [];
  const patterns = [
    { type: 'comment',  re: /^\/\/.*/ },
    { type: 'string',   re: /^(['"`])(?:(?!\1)[^\\]|\\.)*\1/ },
    { type: 'number',   re: /^\b\d+(\.\d+)?\b/ },
    { type: 'paren',    re: /^[()[\]{}]/ },
    { type: 'operator', re: /^(?:===|!==|=>|<=|>=|==|!=|\+\+|--|&&|\|\||[=<>!+\-*/%])/ },
    { type: 'comma',    re: /^[,;]/ },
    { type: 'dot',      re: /^\./ },
    { type: 'space',    re: /^ +/ },
    { type: 'word',     re: /^[a-zA-Z_$][a-zA-Z0-9_$]*/ },
    { type: 'other',    re: /^./ },
  ];

  let rem = line;
  while (rem.length > 0) {
    let matched = false;
    for (const { type, re } of patterns) {
      const m = rem.match(re);
      if (m) {
        const val = m[0];
        // Upgrade 'word' to 'keyword' if applicable
        tokens.push({ type: (type === 'word' && KEYWORDS.has(val)) ? 'keyword' : type, value: val });
        rem = rem.slice(val.length);
        matched = true;
        break;
      }
    }
    if (!matched) { tokens.push({ type: 'other', value: rem[0] }); rem = rem.slice(1); }
  }
  return tokens;
}

const TOKEN_COLORS = {
  keyword:  'text-purple-400',
  string:   'text-green-400',
  number:   'text-orange-400',
  comment:  'text-slate-500 italic',
  operator: 'text-sky-400',
  paren:    'text-yellow-300',
  comma:    'text-slate-400',
  dot:      'text-slate-400',
  space:    '',
  word:     'text-slate-200',
  other:    'text-slate-300',
};

function CodeLine({ lineText, lineNum, isHighlighted }) {
  const tokens = tokenizeLine(lineText);
  return (
    <div
      className={`flex group transition-colors duration-150 ${
        isHighlighted
          ? 'bg-amber-400/10 border-l-2 border-amber-400'
          : 'border-l-2 border-transparent hover:bg-white/5'
      }`}
    >
      {/* Line number */}
      <span className={`select-none w-10 text-right pr-3 py-0.5 text-[11px] font-mono shrink-0 ${
        isHighlighted ? 'text-amber-400 font-bold' : 'text-slate-600'
      }`}>
        {lineNum}
      </span>
      {/* Code */}
      <span className="py-0.5 text-[12.5px] font-mono leading-relaxed">
        {tokens.map((tok, i) => (
          <span key={i} className={TOKEN_COLORS[tok.type] ?? 'text-slate-200'}>
            {tok.value}
          </span>
        ))}
      </span>
    </div>
  );
}

// ─── Array Display ────────────────────────────────────────────────────────────

function ArrayDisplay({ array, comparing, swapped, sortedIndices, pivotIndex, activeRange }) {
  if (!array || array.length === 0) return null;

  const sortedSet   = new Set(sortedIndices ?? []);
  const compareSet  = new Set(comparing ?? []);
  const swappedSet  = new Set(swapped ?? []);
  const [rl, rr]    = activeRange ?? [0, array.length - 1];

  const getStyle = (idx) => {
    if (idx === pivotIndex)       return { bg: 'bg-purple-500', ring: 'ring-2 ring-purple-300', text: 'text-white', label: '↑ pivot' };
    if (swappedSet.has(idx))      return { bg: 'bg-rose-500',   ring: 'ring-2 ring-rose-300',   text: 'text-white', label: '↕ swap'  };
    if (compareSet.has(idx))      return { bg: 'bg-amber-500',  ring: 'ring-2 ring-amber-300',  text: 'text-white', label: '← →'    };
    if (sortedSet.has(idx))       return { bg: 'bg-emerald-500',ring: 'ring-2 ring-emerald-300',text: 'text-white', label: '✓'      };
    const inRange = activeRange ? (idx >= rl && idx <= rr) : true;
    if (!inRange)                 return { bg: 'bg-slate-700',  ring: '',                        text: 'text-slate-400', label: ''  };
    return                               { bg: 'bg-slate-600',  ring: '',                        text: 'text-white', label: ''      };
  };

  return (
    <div className="flex flex-wrap items-end gap-2 justify-center py-2">
      {array.map((val, idx) => {
        const s = getStyle(idx);
        return (
          <div key={idx} className="flex flex-col items-center gap-1">
            {/* Label above box */}
            <span className="text-[9px] font-bold text-slate-400 h-3">
              {s.label}
            </span>
            {/* Box */}
            <div
              className={`w-11 h-11 flex items-center justify-center rounded-lg font-mono font-black text-base
                          ${s.bg} ${s.ring} ${s.text} transition-all duration-300 shadow-lg`}
            >
              {val}
            </div>
            {/* Index below */}
            <span className="text-[9px] font-mono text-slate-500">[{idx}]</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Variable Tracker ─────────────────────────────────────────────────────────

function VariableTracker({ variables }) {
  const entries = Object.entries(variables ?? {});
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 font-mono">{k}</span>
          <span className="text-[10px] text-slate-500">=</span>
          <span className="text-[11px] font-black text-amber-400 font-mono">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Condition Widget ─────────────────────────────────────────────────────────

function ConditionWidget({ condition, conditionResult, decision }) {
  if (!condition) return null;
  return (
    <div className={`flex flex-col gap-1 px-4 py-3 rounded-xl border ${
      conditionResult
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        : 'bg-rose-500/10    border-rose-500/30    text-rose-300'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Condition Check</span>
      </div>
      <code className="text-sm font-mono font-bold">{condition}</code>
      <div className="flex items-center gap-3 mt-1">
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
          conditionResult
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/20    text-rose-300'
        }`}>
          {conditionResult ? '✅ TRUE' : '❌ FALSE'}
        </span>
        {decision && (
          <span className="text-xs font-bold opacity-80">→ {decision}</span>
        )}
      </div>
    </div>
  );
}

// ─── Notebook Paper Panel ─────────────────────────────────────────────────────

function NotebookPanel({ step }) {
  if (!step) return null;
  const typeInfo = STEP_TYPE_COLORS[step.type] ?? STEP_TYPE_COLORS.compare;

  return (
    <div
      className="flex-1 flex flex-col gap-0 overflow-auto rounded-2xl shadow-2xl border border-amber-200/20"
      style={{
        background: 'var(--notebook-bg, #fffdf0)',
        backgroundImage: `
          linear-gradient(to right, transparent 71px, #e8b4b4 71px, #e8b4b4 73px, transparent 73px),
          repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, #c3d9f0 30px, #c3d9f0 31px)
        `,
        lineHeight: '31px',
        fontFamily: "'Kalam', cursive",
        minHeight: '480px',
      }}
    >
      {/* Header strip */}
      <div className={`flex items-center gap-3 px-6 py-3 border-b-2 border-amber-200/30 ${typeInfo.bg} border`}
        style={{ background: 'rgba(255,253,240,0.95)', lineHeight: 'normal' }}>
        <div className={`w-2.5 h-2.5 rounded-full ${typeInfo.dot}`} />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 font-sans">
          {typeInfo.label}
        </span>
        <span className="text-sm font-bold text-slate-700 font-sans ml-1">
          {step.title}
        </span>
      </div>

      {/* Array visualization */}
      <div className="px-20 pt-4 pb-2" style={{ background: 'rgba(255,253,240,0.97)', lineHeight: 'normal' }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-sans mb-2">Current Array</p>
        <ArrayDisplay
          array={step.array}
          comparing={step.comparing}
          swapped={step.swapped}
          sortedIndices={step.sortedIndices}
          pivotIndex={step.pivotIndex}
          activeRange={step.activeRange}
        />
      </div>

      {/* Notebook lines */}
      <div className="flex-1 px-20 pt-2 pb-4" style={{ background: 'rgba(255,253,240,0.0)' }}>
        {(step.notebookLines ?? []).map((line, i) => (
          <div key={i} className="flex items-start gap-2 min-h-[31px]">
            {/* Margin line number */}
            <span className="text-[11px] font-bold w-7 text-right shrink-0 select-none"
              style={{ color: '#c0392b', fontFamily: "'Kalam', cursive" }}>
              {line.trim() !== '' ? (i + 1) : ''}
            </span>
            {/* Text */}
            <span className="text-[15px] text-slate-800" style={{ fontFamily: "'Kalam', cursive" }}>
              {line || '\u00A0'}
            </span>
          </div>
        ))}
      </div>

      {/* Condition widget (at bottom of paper) */}
      {step.condition && (
        <div className="px-20 pb-4" style={{ background: 'rgba(255,253,240,0.97)', lineHeight: 'normal' }}>
          <ConditionWidget
            condition={step.condition}
            conditionResult={step.conditionResult}
            decision={step.decision}
          />
        </div>
      )}
    </div>
  );
}

// ─── Code Panel ───────────────────────────────────────────────────────────────

function CodePanel({ algo, highlightLines, scrollToLine }) {
  const codeLines = ALGO_CODE[algo] ?? [];
  const highlightSet = new Set(highlightLines ?? []);
  const containerRef = useRef(null);

  // Auto-scroll to first highlighted line
  useEffect(() => {
    if (!containerRef.current || highlightLines?.length === 0) return;
    const firstHL = Math.min(...highlightLines);
    const lineEls = containerRef.current.querySelectorAll('[data-line]');
    lineEls[firstHL]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightLines]);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Editor title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/10 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 font-mono ml-2">
          {algo}Sort.js
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-amber-400 font-mono">current line</span>
        </div>
      </div>

      {/* Code lines */}
      <div ref={containerRef} className="flex-1 overflow-auto py-2">
        {codeLines.map((lineText, idx) => (
          <div key={idx} data-line={idx}>
            <CodeLine
              lineText={lineText}
              lineNum={idx + 1}
              isHighlighted={highlightSet.has(idx)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dry Run Table ────────────────────────────────────────────────────────────

function DryRunTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm font-medium">
        Dry run table is only available for Bubble Sort.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr className="bg-slate-800 text-slate-300">
            {['Pass','i','j','arr[j]','arr[j+1]','Condition','Result','Action','Array After'].map(h => (
              <th key={h} className="px-3 py-2 text-left border border-slate-700 font-black uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}
              className={`border-b border-slate-800 transition-colors ${
                r.conditionResult ? 'hover:bg-rose-500/5' : 'hover:bg-slate-800/50'
              }`}
            >
              <td className="px-3 py-2 border border-slate-800 font-bold text-purple-400">{r.pass}</td>
              <td className="px-3 py-2 border border-slate-800 text-slate-400">{r.i}</td>
              <td className="px-3 py-2 border border-slate-800 text-slate-400">{r.j}</td>
              <td className="px-3 py-2 border border-slate-800 font-bold text-amber-400">{r.arrJ}</td>
              <td className="px-3 py-2 border border-slate-800 font-bold text-amber-400">{r.arrJ1}</td>
              <td className="px-3 py-2 border border-slate-800 text-slate-300">{r.condition}</td>
              <td className={`px-3 py-2 border border-slate-800 font-black ${r.conditionResult ? 'text-rose-400' : 'text-slate-500'}`}>
                {r.conditionResult ? 'TRUE' : 'FALSE'}
              </td>
              <td className={`px-3 py-2 border border-slate-800 font-bold whitespace-nowrap ${r.conditionResult ? 'text-rose-400' : 'text-slate-500'}`}>
                {r.action}
              </td>
              <td className="px-3 py-2 border border-slate-800 text-emerald-400 whitespace-nowrap">
                [{r.arrayState.join(', ')}]
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Step Overview Sidebar ────────────────────────────────────────────────────

function StepList({ steps, currentIdx, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.children[currentIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentIdx]);

  return (
    <div ref={listRef} className="flex flex-col gap-0.5 overflow-auto h-full py-1">
      {steps.map((step, i) => {
        const info = STEP_TYPE_COLORS[step.type] ?? STEP_TYPE_COLORS.compare;
        const isActive = i === currentIdx;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all text-xs font-medium w-full
              ${isActive
                ? 'bg-primary/20 border border-primary/40 text-primary'
                : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'
              }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${info.dot}`} />
            <span className="truncate">{step.title}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'notebook', label: '📒 Notebook',  icon: '📒' },
  { key: 'code',     label: '💻 Code',      icon: '💻' },
  { key: 'dryrun',   label: '📊 Dry Run',   icon: '📊' },
];

const GENERATORS = {
  bubble: generateBubbleSortSteps,
  merge:  generateMergeSortSteps,
  quick:  generateQuickSortSteps,
};

const NotebookVisualizer = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('bubble');
  const [inputStr, setInputStr]         = useState(DEFAULT_INPUT);
  const [inputError, setInputError]     = useState('');
  const [steps, setSteps]               = useState([]);
  const [dryRunRows, setDryRunRows]     = useState([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [activeTab, setActiveTab]       = useState('notebook');
  const [isPlaying, setIsPlaying]       = useState(false);
  const [playSpeed, setPlaySpeed]       = useState(1200);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [hasRun, setHasRun]             = useState(false);

  const playRef = useRef(null);

  // ── Parse & run ──────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    const vals = inputStr
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));

    if (vals.length < 2) {
      setInputError('Need at least 2 numbers, separated by commas.');
      return;
    }
    if (vals.length > 12) {
      setInputError('Maximum 12 elements for notebook mode.');
      return;
    }

    setInputError('');
    clearInterval(playRef.current);
    setIsPlaying(false);

    const gen = GENERATORS[selectedAlgo] ?? generateBubbleSortSteps;
    const { steps: s, dryRunRows: d } = gen(vals);
    setSteps(s);
    setDryRunRows(d);
    setCurrentIdx(0);
    setHasRun(true);
    setActiveTab('notebook');
  }, [inputStr, selectedAlgo]);

  // Auto-run on first mount with default input
  useEffect(() => { handleRun(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, playSpeed, steps.length]);

  const step = steps[currentIdx];
  const algoInfo = ALGORITHMS.find(a => a.key === selectedAlgo);
  const progressPct = steps.length > 1 ? Math.round((currentIdx / (steps.length - 1)) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg min-h-0 overflow-hidden">

      {/* ── Top Controls ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-wrap items-end gap-4 px-4 pt-4 pb-3
                      border-b border-slate-200 dark:border-dark-border
                      bg-white dark:bg-dark-surface shadow-sm">

        {/* Algo selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Algorithm</label>
          <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-xl gap-0.5">
            {ALGORITHMS.map(a => (
              <button
                key={a.key}
                onClick={() => setSelectedAlgo(a.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap
                  ${selectedAlgo === a.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                  }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Array input */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px] max-w-[360px]">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Array Input (comma-separated)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputStr}
              onChange={e => { setInputStr(e.target.value); setInputError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleRun()}
              className={`flex-1 px-3 py-2 rounded-lg border font-mono font-bold text-sm outline-none
                          focus:ring-2 ring-primary/40 bg-white dark:bg-dark-bg dark:text-white
                          transition-colors
                          ${inputError
                            ? 'border-rose-500 text-rose-600'
                            : 'border-slate-200 dark:border-dark-border'
                          }`}
              placeholder="e.g. 5, 3, 8, 4, 2"
            />
            <button
              onClick={handleRun}
              className="px-5 py-2 rounded-lg bg-primary text-white font-bold text-sm
                         hover:bg-primary-dark active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              ▶ Run
            </button>
          </div>
          {inputError && (
            <p className="text-[11px] text-rose-500 font-semibold">{inputError}</p>
          )}
        </div>

        {/* Complexity badges */}
        {algoInfo && (
          <div className="flex gap-3 items-center">
            <div className="flex flex-col items-center bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</span>
              <span className="text-sm font-black text-primary font-mono">{algoInfo.time}</span>
            </div>
            <div className="flex flex-col items-center bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Space</span>
              <span className="text-sm font-black text-secondary font-mono">{algoInfo.space}</span>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-dark-border p-1 rounded-xl ml-auto gap-0.5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap
                ${activeTab === t.key
                  ? 'bg-white dark:bg-dark-surface text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setShowSidebar(v => !v)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-dark-border text-slate-500 hover:text-primary transition-colors"
          title={showSidebar ? 'Hide step list' : 'Show step list'}
        >
          {showSidebar ? '◀' : '▶'}
        </button>
      </div>

      {/* ── Main Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Step sidebar */}
        {showSidebar && steps.length > 0 && (
          <div className="w-52 shrink-0 border-r border-slate-200 dark:border-dark-border
                          bg-white dark:bg-dark-surface overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-dark-border shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {steps.length} Steps
              </span>
            </div>
            <StepList steps={steps} currentIdx={currentIdx} onSelect={i => { setCurrentIdx(i); setIsPlaying(false); }} />
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 gap-4">

          {/* Variable tracker bar */}
          {step && Object.keys(step.variables ?? {}).length > 0 && (
            <div className="shrink-0 flex items-center gap-3 p-3 rounded-xl
                            bg-slate-900 border border-slate-700">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Variables
              </span>
              <VariableTracker variables={step.variables} />
            </div>
          )}

          {/* Panel area */}
          <div className="flex-1 min-h-0 overflow-hidden">

            {/* Notebook Tab */}
            {activeTab === 'notebook' && (
              <div className="h-full flex gap-4 overflow-hidden">
                {/* Notebook paper */}
                <div className="flex-1 overflow-auto min-h-0">
                  <NotebookPanel step={step} />
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && step && (
              <div className="h-full">
                <CodePanel
                  algo={selectedAlgo}
                  highlightLines={step.codeLines ?? []}
                />
              </div>
            )}

            {/* Dry Run Table Tab */}
            {activeTab === 'dryrun' && (
              <div className="h-full overflow-auto rounded-xl bg-slate-900 border border-slate-700 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="text-sm font-black text-white">Dry Run Table</h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    — Every comparison and swap, step by step
                  </span>
                </div>
                <DryRunTable rows={dryRunRows} />
              </div>
            )}

            {/* Empty state */}
            {!hasRun && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <div className="text-5xl mb-4">📒</div>
                  <p className="font-bold text-lg">Notebook Mode</p>
                  <p className="text-sm mt-1">Set your array and click Run to start the notebook</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Bar ───────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <div className="shrink-0 border-t border-slate-200 dark:border-dark-border
                        bg-white dark:bg-dark-surface px-4 py-3 flex items-center gap-4">

          {/* Step indicator */}
          <span className="text-xs font-black text-slate-400 font-mono whitespace-nowrap">
            Step {currentIdx + 1} / {steps.length}
          </span>

          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Speed</span>
            <input
              type="range" min={200} max={2500} step={100}
              value={playSpeed}
              onChange={e => setPlaySpeed(+e.target.value)}
              className="w-20 input-range"
            />
            <span className="text-[10px] font-mono text-primary w-14 text-right">
              {(playSpeed / 1000).toFixed(1)}s/step
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { setCurrentIdx(0); setIsPlaying(false); }}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300
                         text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40
                         active:scale-95 transition-all"
            >
              ⏮ First
            </button>
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300
                         text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40
                         active:scale-95 transition-all"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              className={`px-5 py-1.5 rounded-lg text-xs font-black active:scale-95 transition-all
                ${isPlaying
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20'
                }`}
            >
              {isPlaying ? '⏸ Pause' : currentIdx >= steps.length - 1 ? '↺ Restart' : '▶ Play'}
            </button>
            <button
              onClick={() => setCurrentIdx(i => Math.min(steps.length - 1, i + 1))}
              disabled={currentIdx >= steps.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300
                         text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40
                         active:scale-95 transition-all"
            >
              Next ▶
            </button>
            <button
              onClick={() => { setCurrentIdx(steps.length - 1); setIsPlaying(false); }}
              disabled={currentIdx >= steps.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300
                         text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40
                         active:scale-95 transition-all"
            >
              Last ⏭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookVisualizer;
