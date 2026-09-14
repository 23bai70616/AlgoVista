import React, { useState, useEffect, useRef } from 'react';
import { generateRandomArray, ALGORITHM_COMPLEXITY } from '../../utils/helpers';
import { bubbleSort } from '../../algorithms/sorting/bubbleSort';
import { mergeSort } from '../../algorithms/sorting/mergeSort';
import { quickSort } from '../../algorithms/sorting/quickSort';
import { Button, Slider } from '../common/Controls';

const ALGOS = {
  bubble: { label: 'Bubble Sort', color: '#4f46e5', tag: 'O(n²)' },
  merge:  { label: 'Merge Sort',  color: '#db2777', tag: 'O(n log n)' },
  quick:  { label: 'Quick Sort',  color: '#0891b2', tag: 'O(n log n) avg' },
};

const getAnims = (type, arr) => {
  if (type === 'bubble') return bubbleSort([...arr]);
  if (type === 'merge')  return mergeSort([...arr]);
  if (type === 'quick')  return quickSort([...arr]);
  return [];
};

const ComparisonVisualizer = () => {
  const [baseArray, setBaseArray] = useState([]);
  const [array1, setArray1] = useState([]);
  const [array2, setArray2] = useState([]);
  const [algo1, setAlgo1] = useState('bubble');
  const [algo2, setAlgo2] = useState('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speed, setSpeed] = useState(75);
  const [arraySize, setArraySize] = useState(50);
  const [step1, setStep1] = useState(0);
  const [step2, setStep2] = useState(0);
  const [anims1, setAnims1] = useState([]);
  const [anims2, setAnims2] = useState([]);
  const [swapping1, setSwapping1] = useState([]);
  const [swapping2, setSwapping2] = useState([]);
  const [sorted1, setSorted1] = useState(new Set());
  const [sorted2, setSorted2] = useState(new Set());
  const [winner, setWinner] = useState(null);
  const [finishTime1, setFinishTime1] = useState(null);
  const [finishTime2, setFinishTime2] = useState(null);

  const timer1 = useRef(null);
  const timer2 = useRef(null);
  const startTime = useRef(null);

  useEffect(() => { resetArrays(); }, [arraySize]);

  const resetArrays = () => {
    clearTimeout(timer1.current);
    clearTimeout(timer2.current);
    const arr = generateRandomArray(arraySize, 5, 100);
    setBaseArray(arr);
    setArray1([...arr]);
    setArray2([...arr]);
    setAnims1([]); setAnims2([]);
    setStep1(0);   setStep2(0);
    setSwapping1([]); setSwapping2([]);
    setSorted1(new Set()); setSorted2(new Set());
    setIsProcessing(false);
    setWinner(null);
    setFinishTime1(null); setFinishTime2(null);
  };

  const handleStart = () => {
    clearTimeout(timer1.current);
    clearTimeout(timer2.current);

    const fresh = generateRandomArray(arraySize, 5, 100);
    setBaseArray(fresh);
    setArray1([...fresh]); setArray2([...fresh]);
    setSwapping1([]); setSwapping2([]);
    setSorted1(new Set()); setSorted2(new Set());
    setWinner(null); setFinishTime1(null); setFinishTime2(null);

    const a1 = getAnims(algo1, [...fresh]);
    const a2 = getAnims(algo2, [...fresh]);
    setAnims1(a1); setAnims2(a2);
    setStep1(0); setStep2(0);
    setIsProcessing(true);
    startTime.current = performance.now();
  };

  /* ── Animation loop (useEffect per side) ── */
  useEffect(() => {
    if (!isProcessing) return;
    if (step1 < anims1.length) {
      const delay = Math.max(2, 101 - speed);
      timer1.current = setTimeout(() => {
        applyStep(anims1[step1], setArray1, setSwapping1, setSorted1);
        setStep1(s => s + 1);
      }, delay);
    } else if (anims1.length > 0 && finishTime1 === null) {
      setFinishTime1(((performance.now() - startTime.current) / 1000).toFixed(2));
      setSorted1(() => {
        const s = new Set();
        for (let i = 0; i < arraySize; i++) s.add(i);
        return s;
      });
      setSwapping1([]);
    }
    return () => clearTimeout(timer1.current);
  }, [isProcessing, step1, anims1, speed]);

  useEffect(() => {
    if (!isProcessing) return;
    if (step2 < anims2.length) {
      const delay = Math.max(2, 101 - speed);
      timer2.current = setTimeout(() => {
        applyStep(anims2[step2], setArray2, setSwapping2, setSorted2);
        setStep2(s => s + 1);
      }, delay);
    } else if (anims2.length > 0 && finishTime2 === null) {
      setFinishTime2(((performance.now() - startTime.current) / 1000).toFixed(2));
      setSorted2(() => {
        const s = new Set();
        for (let i = 0; i < arraySize; i++) s.add(i);
        return s;
      });
      setSwapping2([]);
    }
    return () => clearTimeout(timer2.current);
  }, [isProcessing, step2, anims2, speed]);

  /* Determine winner once both finish */
  useEffect(() => {
    if (finishTime1 !== null && finishTime2 !== null && winner === null) {
      setIsProcessing(false);
      setWinner(parseFloat(finishTime1) <= parseFloat(finishTime2) ? 1 : 2);
    }
  }, [finishTime1, finishTime2]);

  const applyStep = (step, setArr, setSwap, setSorted) => {
    if (!step) return;
    if (step.type === 'swap') {
      setSwap(step.indices);
      setArr(prev => {
        const next = [...prev];
        [next[step.indices[0]], next[step.indices[1]]] = step.values;
        return next;
      });
    } else if (step.type === 'overwrite') {
      setSwap([step.index]);
      setArr(prev => {
        const next = [...prev];
        next[step.index] = step.value;
        return next;
      });
    } else if (step.type === 'sorted') {
      setSorted(prev => new Set(prev).add(step.index));
    } else {
      setSwap([]);
    }
  };

  const maxVal = Math.max(...array1, ...array2, 1);

  const getBarStyle = (idx, arr, swapping, sorted, color) => {
    const isSwap   = swapping.includes(idx);
    const isSorted = sorted.has(idx);
    const h = `${(arr[idx] / maxVal) * 100}%`;
    let bg = color;
    if (isSorted) bg = '#10b981';
    else if (isSwap) bg = '#f43f5e';
    return {
      height: h,
      background: `linear-gradient(to top, ${bg}cc, ${bg})`,
      boxShadow: isSwap ? `0 0 8px ${bg}88` : isSorted ? `0 0 4px #10b98166` : 'none',
      transform: isSwap ? 'scaleY(1.06)' : 'scaleY(1)',
      transformOrigin: 'bottom',
      transition: 'height 0.08s ease, background 0.1s ease, transform 0.1s ease',
    };
  };

  const SidePanel = ({ label, array, swapping, sorted, anims, step, color, finishTime, isWinner }) => {
    const info = ALGORITHM_COMPLEXITY[label] ?? {};
    const progress = anims.length > 0 ? Math.min(100, Math.floor((step / anims.length) * 100)) : (finishTime ? 100 : 0);

    return (
      <div className={`card p-4 flex flex-col gap-3 dark:bg-dark-surface ${isWinner ? 'ring-2 ring-emerald-400/60' : ''} transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <h3 className="font-black text-base text-slate-800 dark:text-white uppercase">
              {ALGOS[label]?.label ?? label}
            </h3>
            {isWinner && <span className="text-xs font-black text-emerald-400">🏆 WINNER</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 font-mono">{ALGOS[label]?.tag}</span>
            {finishTime && (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {finishTime}s
              </span>
            )}
          </div>
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end gap-[1px] min-h-[220px] bg-slate-50 dark:bg-dark-bg rounded-xl px-2 pb-1 pt-2">
          {array.map((val, idx) => (
            <div key={idx} className="flex-1 min-w-0 rounded-t-sm"
              style={getBarStyle(idx, array, swapping, sorted, color)} />
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%`, background: color }} />
          </div>
          <span className="text-[11px] font-black font-mono" style={{ color }}>{progress}%</span>
        </div>

        {/* Steps */}
        <div className="flex gap-3 text-[10px] font-bold text-slate-400">
          <span>Steps: <span className="text-slate-700 dark:text-slate-200 font-black">{step}</span></span>
          <span>Total: <span className="text-slate-700 dark:text-slate-200 font-black">{anims.length}</span></span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">
      {/* ── Controls ── */}
      <div className="card p-4 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Algorithm 1</label>
            <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm font-semibold dark:text-white outline-none focus:ring-2 ring-primary/40"
              value={algo1} onChange={e => setAlgo1(e.target.value)} disabled={isProcessing}>
              {Object.entries(ALGOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <span className="font-black text-slate-300 dark:text-slate-600 text-xl mt-4">⚔️</span>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Algorithm 2</label>
            <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm font-semibold dark:text-white outline-none focus:ring-2 ring-secondary/40"
              value={algo2} onChange={e => setAlgo2(e.target.value)} disabled={isProcessing}>
              {Object.entries(ALGOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <Slider label="Array Size" min={10} max={120} value={arraySize} onChange={v => { setArraySize(v); }} disabled={isProcessing} />
        <Slider label="Speed" min={1} max={100} value={speed} onChange={setSpeed} />

        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" onClick={resetArrays} disabled={isProcessing}>↺ Reset</Button>
          <Button variant="primary" onClick={handleStart} disabled={isProcessing}>
            {isProcessing ? '⚡ Racing…' : '⚔️ Start Battle'}
          </Button>
        </div>
      </div>

      {/* ── Winner Banner ── */}
      {winner && (
        <div className="card p-3 text-center shrink-0 dark:bg-dark-surface animate-fade-in border-emerald-400/30">
          <span className="text-sm font-black text-emerald-400">
            🏆 {ALGOS[winner === 1 ? algo1 : algo2]?.label} won!
          </span>
          <span className="text-xs text-slate-500 ml-3">
            ({finishTime1}s vs {finishTime2}s)
          </span>
        </div>
      )}

      {/* ── Side-by-side panels ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        <SidePanel
          label={algo1} array={array1} swapping={swapping1} sorted={sorted1}
          anims={anims1} step={step1} color={ALGOS[algo1]?.color ?? '#4f46e5'}
          finishTime={finishTime1} isWinner={winner === 1} />
        <SidePanel
          label={algo2} array={array2} swapping={swapping2} sorted={sorted2}
          anims={anims2} step={step2} color={ALGOS[algo2]?.color ?? '#db2777'}
          finishTime={finishTime2} isWinner={winner === 2} />
      </div>
    </div>
  );
};

export default ComparisonVisualizer;
