import React, { useState, useEffect, useRef } from 'react';
import { generateRandomArray, ALGORITHM_COMPLEXITY } from '../../utils/helpers';
import { bubbleSort } from '../../algorithms/sorting/bubbleSort';
import { mergeSort } from '../../algorithms/sorting/mergeSort';
import { quickSort } from '../../algorithms/sorting/quickSort';
import { Button, Slider } from '../common/Controls';

const SortingVisualizer = () => {
  const [array, setArray] = useState([]);
  const [animations, setAnimations] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(60);
  const [arraySize, setArraySize] = useState(60);
  const [selectedAlgo, setSelectedAlgo] = useState('bubble');
  const [comparingIndices, setComparingIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState(new Set());
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [pivotIndex, setPivotIndex] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const animationRef = useRef(null);

  useEffect(() => {
    resetArray();
  }, [arraySize]);

  useEffect(() => {
    if (!isPaused && currentStep < animations.length) {
      const delay = Math.max(4, (101 - speed) * 6);
      animationRef.current = setTimeout(() => {
        applyStep(currentStep);
        setCurrentStep(prev => prev + 1);
      }, delay);
    } else if (currentStep >= animations.length && animations.length > 0) {
      setIsPaused(true);
      // Mark all sorted on completion
      setSortedIndices(prev => {
        const full = new Set(prev);
        for (let i = 0; i < array.length; i++) full.add(i);
        return full;
      });
    }
    return () => clearTimeout(animationRef.current);
  }, [isPaused, currentStep, animations, speed]);

  const resetArray = () => {
    clearTimeout(animationRef.current);
    const size = Math.max(5, arraySize);
    const newArray = generateRandomArray(size, 5, 100);
    setArray(newArray);
    setAnimations([]);
    setCurrentStep(0);
    setIsPaused(true);
    setComparingIndices([]);
    setSortedIndices(new Set());
    setSwappingIndices([]);
    setPivotIndex(null);
  };

  const handleCustomInput = () => {
    const vals = customInput
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0 && n <= 100);
    if (vals.length >= 2) {
      clearTimeout(animationRef.current);
      setArray(vals);
      setAnimations([]);
      setCurrentStep(0);
      setIsPaused(true);
      setComparingIndices([]);
      setSortedIndices(new Set());
      setSwappingIndices([]);
      setPivotIndex(null);
      setShowCustomInput(false);
      setCustomInput('');
    }
  };

  const handleSort = () => {
    clearTimeout(animationRef.current);
    // Reset visual state first, then compute on current array snapshot
    setComparingIndices([]);
    setSortedIndices(new Set());
    setSwappingIndices([]);
    setPivotIndex(null);

    let anims = [];
    const snapshot = [...array];
    if (selectedAlgo === 'bubble') anims = bubbleSort(snapshot);
    else if (selectedAlgo === 'merge') anims = mergeSort(snapshot);
    else if (selectedAlgo === 'quick') anims = quickSort(snapshot);

    setAnimations(anims);
    setCurrentStep(0);
    setIsPaused(false);
  };

  const stepForward = () => {
    if (currentStep < animations.length) {
      applyStep(currentStep);
      setCurrentStep(prev => prev + 1);
    }
  };

  const applyStep = (stepIdx) => {
    const step = animations[stepIdx];
    if (!step) return;

    setComparingIndices([]);
    setSwappingIndices([]);
    setPivotIndex(null);

    switch (step.type) {
      case 'range':
        break;
      case 'comparison':
        setComparingIndices(step.indices);
        break;
      case 'swap':
        setSwappingIndices(step.indices);
        setArray(prev => {
          const next = [...prev];
          [next[step.indices[0]], next[step.indices[1]]] = step.values;
          return next;
        });
        break;
      case 'overwrite':
        setArray(prev => {
          const next = [...prev];
          next[step.index] = step.value;
          return next;
        });
        setSwappingIndices([step.index]);
        break;
      case 'sorted':
        setSortedIndices(prev => new Set(prev).add(step.index));
        break;
      case 'pivot':
        setPivotIndex(step.index);
        break;
      default:
        break;
    }
  };

  const isRunning = !isPaused && currentStep < animations.length;
  const isFinished = animations.length > 0 && currentStep >= animations.length;

  const getBarColor = (idx) => {
    if (sortedIndices.has(idx)) return '#10b981'; // emerald
    if (swappingIndices.includes(idx)) return '#f43f5e'; // rose
    if (pivotIndex === idx) return '#a855f7'; // purple
    if (comparingIndices.includes(idx)) return '#f59e0b'; // amber
    return '#4f46e5'; // primary indigo
  };

  const maxVal = Math.max(...array, 1);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg p-4 gap-4 min-h-0 overflow-auto">
      {/* ── Controls Bar ── */}
      <div className="card p-4 flex flex-wrap items-center gap-4 shrink-0 dark:bg-dark-surface border-slate-200 dark:border-dark-border shadow-xl">
        {/* Algorithm Select */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Algorithm</label>
          <select
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg outline-none focus:ring-2 ring-primary/40 font-semibold text-sm text-slate-800 dark:text-white"
            value={selectedAlgo}
            onChange={(e) => { setSelectedAlgo(e.target.value); resetArray(); }}
            disabled={isRunning}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
          </select>
        </div>

        <Slider label="Array Size" min={8} max={120} value={arraySize} onChange={setArraySize} disabled={isRunning} />
        <Slider label="Speed" min={1} max={100} value={speed} onChange={setSpeed} />

        {/* Custom Input Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Array</label>
          <Button variant="secondary" onClick={() => setShowCustomInput(v => !v)} disabled={isRunning}>
            ✏️ Custom
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="secondary" onClick={resetArray} disabled={isRunning}>↺ Reset</Button>
          <Button variant="secondary" onClick={stepForward} disabled={isRunning || currentStep >= animations.length || animations.length === 0}>
            › Step
          </Button>
          <Button
            variant={isRunning ? 'accent' : 'primary'}
            onClick={() => {
              if (animations.length === 0) {
                handleSort();
              } else if (isFinished) {
                // Full restart from fresh array
                resetArray();
              } else {
                setIsPaused(p => !p);
              }
            }}
          >
            {isFinished
              ? '↺ New Array'
              : isRunning
              ? '⏸ Pause'
              : currentStep === 0
              ? '▶ Start'
              : '▶ Resume'}
          </Button>
        </div>
      </div>

      {/* Custom Input Panel */}
      {showCustomInput && (
        <div className="card p-4 flex items-center gap-3 shrink-0 animate-fade-in dark:bg-dark-surface border-primary/20">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Values (comma-separated, 1–100):</label>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="e.g. 34, 7, 91, 15, 53"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm font-mono outline-none focus:ring-2 ring-primary/40 dark:text-white"
            onKeyDown={e => e.key === 'Enter' && handleCustomInput()}
          />
          <Button variant="primary" onClick={handleCustomInput}>Apply</Button>
          <Button variant="secondary" onClick={() => setShowCustomInput(false)}>✕</Button>
        </div>
      )}

      {/* ── Bar Chart Visualization ── */}
      <div className="card p-4 flex flex-col dark:bg-dark-surface border-slate-200 dark:border-dark-border shadow-inner overflow-hidden" style={{ height: '420px' }}>
        {/* Legend */}
        <div className="flex flex-wrap gap-5 mb-3 px-2 shrink-0">
          {[
            { color: '#4f46e5', label: 'Unsorted' },
            { color: '#f59e0b', label: 'Comparing' },
            { color: '#f43f5e', label: 'Swapping' },
            { color: '#a855f7', label: 'Pivot' },
            { color: '#10b981', label: 'Sorted' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end gap-[1px] px-2 pb-1 relative" style={{ minHeight: 0 }}>
          {array.map((val, idx) => {
            const color = getBarColor(idx);
            const BAR_AREA_H = 320; // px reference height for bar scaling
            const barH = Math.max(4, Math.round((val / maxVal) * BAR_AREA_H));
            const isSwap = swappingIndices.includes(idx);
            const isCompare = comparingIndices.includes(idx);
            const isPivot = pivotIndex === idx;
            return (
              <div
                key={idx}
                className="relative flex-1 min-w-0 rounded-t-sm sort-bar group"
                style={{
                  height: `${barH}px`,
                  background: `linear-gradient(to top, ${color}cc, ${color})`,
                  boxShadow: isSwap || isPivot ? `0 0 12px ${color}88` : isCompare ? `0 0 6px ${color}55` : 'none',
                  transform: isSwap ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                  transition: 'height 0.08s ease',
                }}
              >
                {/* Value tooltip on hover (only when not too many bars) */}
                {array.length <= 40 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {val}
                  </span>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {array.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Generating array...</span>
              </div>
            </div>
          )}
        </div>

        {/* Index row (only for small arrays) */}
        {array.length <= 40 && (
          <div className="flex gap-[1px] px-2 mt-1 shrink-0">
            {array.map((_, idx) => (
              <div key={idx} className="flex-1 text-center text-[8px] text-slate-400 dark:text-slate-600 font-mono">
                {idx}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Complexity Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Avg Time', value: ALGORITHM_COMPLEXITY[selectedAlgo]?.time },
          { label: 'Space', value: ALGORITHM_COMPLEXITY[selectedAlgo]?.space },
          { label: 'Best Case', value: ALGORITHM_COMPLEXITY[selectedAlgo]?.best },
          { label: 'Progress', value: `${animations.length > 0 ? Math.min(100, Math.floor((currentStep / animations.length) * 100)) : 0}%`, isProgress: true },
        ].map(({ label, value, isProgress }) => (
          <div
            key={label}
            className="card p-4 flex flex-col items-center justify-center gap-1 dark:bg-dark-surface border-slate-200 dark:border-dark-border hover:border-primary/50 transition-colors"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xl font-black ${isProgress ? 'text-secondary' : 'text-primary'} font-mono`}>
              {value}
            </span>
            {isProgress && animations.length > 0 && (
              <div className="w-full h-1 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentStep / animations.length) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="card p-3 shrink-0 text-center dark:bg-dark-surface border-slate-200 dark:border-dark-border">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
          {ALGORITHM_COMPLEXITY[selectedAlgo]?.description}
        </p>
      </div>
    </div>
  );
};

export default SortingVisualizer;
