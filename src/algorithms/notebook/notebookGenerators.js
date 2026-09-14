/**
 * notebookGenerators.js
 * ─────────────────────
 * Generates rich, step-by-step notebook data for Bubble Sort, Merge Sort,
 * and Quick Sort. Each step contains everything the UI needs to render:
 *   - Current array state with coloured indices
 *   - Handwritten-style explanation lines
 *   - Variable tracker values (i, j, pivot …)
 *   - Condition check + result
 *   - Which code lines to highlight
 *   - A dry-run table row (for Bubble Sort)
 */

// ─── Algorithm code strings (displayed in the Code Panel) ────────────────────

export const ALGO_CODE = {
  bubble: [
    'function bubbleSort(array) {',
    '  const arr = [...array];          // copy — avoid mutating input',
    '  const n = arr.length;',
    '',
    '  for (let i = 0; i < n - 1; i++) {     // n-1 passes',
    '    for (let j = 0; j < n - i - 1; j++) {  // shrink window each pass',
    '      if (arr[j] > arr[j + 1]) {      // compare adjacent pair',
    '        // swap',
    '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
    '      }',
    '    }',
    '    // after pass i, arr[n-1-i] is in correct position',
    '  }',
    '',
    '  return arr;',
    '}',
  ],

  merge: [
    'function mergeSort(arr) {',
    '  if (arr.length <= 1) return arr;   // base case',
    '',
    '  const mid   = Math.floor(arr.length / 2);',
    '  const left  = mergeSort(arr.slice(0, mid));   // sort left',
    '  const right = mergeSort(arr.slice(mid));      // sort right',
    '',
    '  return merge(left, right);',
    '}',
    '',
    'function merge(left, right) {',
    '  const result = [];',
    '  let i = 0, j = 0;',
    '',
    '  while (i < left.length && j < right.length) {',
    '    if (left[i] <= right[j]) {',
    '      result.push(left[i++]);    // take from left',
    '    } else {',
    '      result.push(right[j++]);   // take from right',
    '    }',
    '  }',
    '',
    '  // append remaining elements',
    '  return [...result, ...left.slice(i), ...right.slice(j)];',
    '}',
  ],

  quick: [
    'function quickSort(arr, low = 0, high = arr.length - 1) {',
    '  if (low >= high) return arr;    // base case',
    '',
    '  const pivotIdx = partition(arr, low, high);',
    '  quickSort(arr, low, pivotIdx - 1);    // sort left partition',
    '  quickSort(arr, pivotIdx + 1, high);   // sort right partition',
    '  return arr;',
    '}',
    '',
    'function partition(arr, low, high) {',
    '  const pivot = arr[high];       // last element as pivot',
    '  let i = low - 1;               // boundary of "smaller" region',
    '',
    '  for (let j = low; j < high; j++) {',
    '    if (arr[j] <= pivot) {        // element belongs left of pivot',
    '      i++;',
    '      [arr[i], arr[j]] = [arr[j], arr[i]];  // swap into region',
    '    }',
    '  }',
    '',
    '  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];  // place pivot',
    '  return i + 1;                  // pivot is now sorted',
    '}',
  ],
};

// ─── Bubble Sort code-line highlights per step type ─────────────────────────
const BS_LINES = {
  intro:      [0, 1, 2],
  pass_start: [4],
  compare:    [5, 6],
  swap:       [5, 6, 7, 8],
  no_swap:    [5, 6],
  pass_end:   [11, 12],
  final:      [14],
};

// ─── Merge Sort code-line highlights ────────────────────────────────────────
const MS_LINES = {
  intro:    [0, 1],
  split:    [3, 4, 5],
  merge_compare: [14, 15, 16, 17, 18],
  merge_result:  [23],
  final:    [7],
};

// ─── Quick Sort code-line highlights ─────────────────────────────────────────
const QS_LINES = {
  intro:        [0, 1],
  pivot_select: [9, 10, 11],
  compare:      [13, 14],
  swap:         [13, 14, 15, 16],
  pivot_place:  [20, 21],
  recurse:      [3, 4, 5],
  final:        [6],
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const fmt = (arr) => `[ ${arr.join('  ')} ]`;


// ═══════════════════════════════════════════════════════════════════════════════
//  BUBBLE SORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function generateBubbleSortSteps(inputArray) {
  const arr = [...inputArray];
  const n   = arr.length;
  const steps      = [];
  const dryRunRows = [];
  const sortedSet  = new Set();

  // ── INTRO ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'intro',
    pass: null,
    title: '📒 Given Input',
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: [],
    pivotIndex: null,
    activeRange: null,
    variables: { n, 'passes needed': n - 1 },
    condition: null,
    conditionResult: null,
    decision: null,
    explanation: `Start with ${n} elements. Bubble Sort needs ${n - 1} passes.`,
    notebookLines: [
      `Given:  ${fmt(arr)}`,
      `n = ${n}`,
      ``,
      `Algorithm: Bubble Sort`,
      `Core Idea: Compare adjacent elements.`,
      `           If left > right → swap them.`,
      `           After each pass, the largest`,
      `           "bubbles up" to its correct spot.`,
      ``,
      `Total passes needed: n - 1 = ${n - 1}`,
    ],
    codeLines: BS_LINES.intro,
    dryRunRow: null,
  });

  // ── PASSES ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < n - 1; i++) {
    // Pass header
    steps.push({
      type: 'pass_start',
      pass: i + 1,
      title: `━━ Pass ${i + 1}  (i = ${i}) ━━`,
      array: [...arr],
      comparing: [],
      swapped: [],
      sortedIndices: [...sortedSet],
      pivotIndex: null,
      activeRange: [0, n - i - 1],
      variables: { i, j: '—', 'active range': `[0 … ${n - i - 1}]` },
      condition: null,
      conditionResult: null,
      decision: null,
      explanation: `Pass ${i + 1}: scan from index 0 to ${n - i - 1}.`,
      notebookLines: [
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `PASS ${i + 1}    (i = ${i})`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Active range: index 0 → ${n - i - 1}`,
        `Array: ${fmt(arr)}`,
      ],
      codeLines: BS_LINES.pass_start,
      dryRunRow: null,
    });

    // Each comparison in this pass
    for (let j = 0; j < n - i - 1; j++) {
      const aJ  = arr[j];
      const aJ1 = arr[j + 1];
      const doSwap = aJ > aJ1;

      if (doSwap) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

      const stepLabel = `Pass ${i + 1},  j = ${j}`;

      const step = {
        type: 'compare',
        pass: i + 1,
        title: `${stepLabel} → Compare arr[${j}] and arr[${j + 1}]`,
        array: [...arr],
        comparing: doSwap ? []      : [j, j + 1],
        swapped:   doSwap ? [j, j + 1] : [],
        sortedIndices: [...sortedSet],
        pivotIndex: null,
        activeRange: [0, n - i - 1],
        variables: {
          i,
          j,
          [`arr[${j}]`]:     aJ,
          [`arr[${j + 1}]`]: aJ1,
        },
        condition:       `arr[${j}] > arr[${j + 1}]  →  ${aJ} > ${aJ1}`,
        conditionResult: doSwap,
        decision:        doSwap ? '✅ SWAP' : '❌ NO SWAP',
        explanation: doSwap
          ? `${aJ} > ${aJ1} is TRUE → swap → ${fmt(arr)}`
          : `${aJ} > ${aJ1} is FALSE → no swap, move right`,
        notebookLines: doSwap ? [
          `j = ${j}:  arr[${j}] = ${aJ}   arr[${j + 1}] = ${aJ1}`,
          ``,
          `  Condition: ${aJ} > ${aJ1}  →  ✅ TRUE`,
          `  Action:    SWAP arr[${j}] ↔ arr[${j + 1}]`,
          ``,
          `  After:  ${fmt(arr)}`,
        ] : [
          `j = ${j}:  arr[${j}] = ${aJ}   arr[${j + 1}] = ${aJ1}`,
          ``,
          `  Condition: ${aJ} > ${aJ1}  →  ❌ FALSE`,
          `  Action:    No swap — slide right`,
        ],
        codeLines: doSwap ? BS_LINES.swap : BS_LINES.no_swap,
        dryRunRow: {
          pass: i + 1,
          i,
          j,
          arrJ:  aJ,
          arrJ1: aJ1,
          condition: `${aJ} > ${aJ1}`,
          conditionResult: doSwap,
          action: doSwap ? `SWAP [${j}] ↔ [${j + 1}]` : 'No swap',
          arrayState: [...arr],
        },
      };

      steps.push(step);
      dryRunRows.push(step.dryRunRow);
    }

    // Mark the newly sorted element
    sortedSet.add(n - 1 - i);

    steps.push({
      type: 'pass_end',
      pass: i + 1,
      title: `✅ End of Pass ${i + 1}`,
      array: [...arr],
      comparing: [],
      swapped: [],
      sortedIndices: [...sortedSet],
      pivotIndex: null,
      activeRange: null,
      variables: {
        'sorted elements': [...sortedSet].sort((a, b) => a - b).join(', '),
      },
      condition: null,
      conditionResult: null,
      decision: null,
      explanation: `Pass ${i + 1} done. ${arr[n - 1 - i]} is at its correct position (index ${n - 1 - i}).`,
      notebookLines: [
        `✅ End of Pass ${i + 1}`,
        ``,
        `  ${arr[n - 1 - i]} has bubbled to index ${n - 1 - i} ✓`,
        `  Array: ${fmt(arr)}`,
        `  Sorted so far: indices { ${[...sortedSet].sort((a, b) => a - b).join(', ')} }`,
      ],
      codeLines: BS_LINES.pass_end,
      dryRunRow: null,
    });
  }

  // Mark index 0 as sorted
  sortedSet.add(0);

  // ── FINAL ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'final',
    pass: null,
    title: '🎉 Final Answer',
    array: [...arr],
    comparing: [],
    swapped: [],
    sortedIndices: [...sortedSet],
    pivotIndex: null,
    activeRange: null,
    variables: {},
    condition: null,
    conditionResult: null,
    decision: null,
    explanation: `Array fully sorted: ${fmt(arr)}`,
    notebookLines: [
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎉  FINAL ANSWER`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `  ${fmt(arr)}`,
      ``,
      `  All ${n} elements are in sorted order ✓`,
      `  Total passes: ${n - 1}`,
    ],
    codeLines: BS_LINES.final,
    dryRunRow: null,
  });

  return { steps, dryRunRows };
}


// ═══════════════════════════════════════════════════════════════════════════════
//  MERGE SORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function generateMergeSortSteps(inputArray) {
  const arr   = [...inputArray];
  const n     = arr.length;
  const steps = [];
  let   depth = 0;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'intro',
    pass: null,
    title: '📒 Given Input',
    array: [...arr],
    comparing: [], swapped: [], sortedIndices: [],
    pivotIndex: null, activeRange: null,
    variables: { n },
    condition: null, conditionResult: null, decision: null,
    explanation: `Merge Sort: Divide and Conquer. Split → Sort halves → Merge.`,
    notebookLines: [
      `Given:  ${fmt(arr)}`,
      `n = ${n}`,
      ``,
      `Algorithm: Merge Sort`,
      `Step 1 → Divide array in half recursively`,
      `Step 2 → Sort each half (recursion)`,
      `Step 3 → Merge two sorted halves into one`,
      ``,
      `Time: O(n log n)   Space: O(n)`,
    ],
    codeLines: MS_LINES.intro,
    dryRunRow: null,
  });

  // ── Recursive helper ────────────────────────────────────────────────────────
  const workingArr = [...arr];

  function mergeSortRec(subArr, start, d) {
    if (subArr.length <= 1) return subArr;

    const mid   = Math.floor(subArr.length / 2);
    const left  = subArr.slice(0, mid);
    const right = subArr.slice(mid);
    const prefix = '  '.repeat(d);

    // SPLIT step
    steps.push({
      type: 'split',
      pass: null,
      title: `Split  ${fmt(subArr)}`,
      array: [...workingArr],
      comparing: [], swapped: [],
      sortedIndices: [],
      pivotIndex: null,
      activeRange: [start, start + subArr.length - 1],
      variables: { depth: d, start, mid: start + mid, end: start + subArr.length - 1 },
      condition: null, conditionResult: null, decision: null,
      explanation: `Split ${fmt(subArr)} → Left ${fmt(left)}  +  Right ${fmt(right)}`,
      notebookLines: [
        `${prefix}SPLIT  ${fmt(subArr)}`,
        `${prefix}  mid = ${mid}`,
        `${prefix}  Left  → ${fmt(left)}`,
        `${prefix}  Right → ${fmt(right)}`,
      ],
      codeLines: MS_LINES.split,
      dryRunRow: null,
    });

    const sortedLeft  = mergeSortRec(left,  start,       d + 1);
    const sortedRight = mergeSortRec(right, start + mid, d + 1);

    // MERGE step
    const merged = [];
    let li = 0, ri = 0;
    while (li < sortedLeft.length && ri < sortedRight.length) {
      const cond = sortedLeft[li] <= sortedRight[ri];
      steps.push({
        type: 'merge_compare',
        pass: null,
        title: `Merge: Compare ${sortedLeft[li]} vs ${sortedRight[ri]}`,
        array: [...workingArr],
        comparing: [], swapped: [],
        sortedIndices: [],
        pivotIndex: null,
        activeRange: [start, start + subArr.length - 1],
        variables: { 'left[i]': sortedLeft[li], 'right[j]': sortedRight[ri] },
        condition: `${sortedLeft[li]} ≤ ${sortedRight[ri]}`,
        conditionResult: cond,
        decision: cond ? `Take ${sortedLeft[li]} from Left` : `Take ${sortedRight[ri]} from Right`,
        explanation: cond
          ? `${sortedLeft[li]} ≤ ${sortedRight[ri]} → take ${sortedLeft[li]} from left`
          : `${sortedLeft[li]} > ${sortedRight[ri]} → take ${sortedRight[ri]} from right`,
        notebookLines: cond ? [
          `${prefix}  Compare ${sortedLeft[li]} (left) vs ${sortedRight[ri]} (right)`,
          `${prefix}  Condition: ${sortedLeft[li]} ≤ ${sortedRight[ri]}  →  ✅ TRUE`,
          `${prefix}  → Take ${sortedLeft[li]} from Left`,
        ] : [
          `${prefix}  Compare ${sortedLeft[li]} (left) vs ${sortedRight[ri]} (right)`,
          `${prefix}  Condition: ${sortedLeft[li]} ≤ ${sortedRight[ri]}  →  ❌ FALSE`,
          `${prefix}  → Take ${sortedRight[ri]} from Right`,
        ],
        codeLines: MS_LINES.merge_compare,
        dryRunRow: null,
      });

      if (cond) merged.push(sortedLeft[li++]);
      else      merged.push(sortedRight[ri++]);
    }

    while (li < sortedLeft.length)  merged.push(sortedLeft[li++]);
    while (ri < sortedRight.length) merged.push(sortedRight[ri++]);

    // Write merged back into workingArr
    for (let k = 0; k < merged.length; k++) {
      workingArr[start + k] = merged[k];
    }

    // MERGE RESULT step
    steps.push({
      type: 'merge_result',
      pass: null,
      title: `Merged → ${fmt(merged)}`,
      array: [...workingArr],
      comparing: [], swapped: [],
      sortedIndices: Array.from({ length: merged.length }, (_, k) => start + k),
      pivotIndex: null,
      activeRange: [start, start + merged.length - 1],
      variables: { result: fmt(merged) },
      condition: null, conditionResult: null, decision: null,
      explanation: `Merged ${fmt(sortedLeft)} + ${fmt(sortedRight)} → ${fmt(merged)}`,
      notebookLines: [
        `${prefix}MERGED  ${fmt(sortedLeft)} + ${fmt(sortedRight)}`,
        `${prefix}  →  ${fmt(merged)}`,
      ],
      codeLines: MS_LINES.merge_result,
      dryRunRow: null,
    });

    return merged;
  }

  mergeSortRec(workingArr, 0, 0);

  // ── FINAL ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'final',
    pass: null,
    title: '🎉 Final Answer',
    array: [...workingArr],
    comparing: [], swapped: [],
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    pivotIndex: null, activeRange: null,
    variables: {},
    condition: null, conditionResult: null, decision: null,
    explanation: `Merge Sort complete: ${fmt(workingArr)}`,
    notebookLines: [
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎉  FINAL ANSWER`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `  ${fmt(workingArr)}`,
      ``,
      `  Fully sorted via Merge Sort ✓`,
    ],
    codeLines: MS_LINES.final,
    dryRunRow: null,
  });

  return { steps, dryRunRows: [] };
}


// ═══════════════════════════════════════════════════════════════════════════════
//  QUICK SORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function generateQuickSortSteps(inputArray) {
  const arr   = [...inputArray];
  const n     = arr.length;
  const steps = [];
  const sortedSet = new Set();

  // ── INTRO ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'intro',
    pass: null,
    title: '📒 Given Input',
    array: [...arr],
    comparing: [], swapped: [], sortedIndices: [],
    pivotIndex: null, activeRange: null,
    variables: { n },
    condition: null, conditionResult: null, decision: null,
    explanation: `Quick Sort: Pick a pivot, partition, recurse.`,
    notebookLines: [
      `Given:  ${fmt(arr)}`,
      `n = ${n}`,
      ``,
      `Algorithm: Quick Sort`,
      `Pivot: last element of current range`,
      ``,
      `Step 1 → Pick pivot = arr[high]`,
      `Step 2 → Place all ≤ pivot to its left`,
      `Step 3 → Pivot is now at correct index`,
      `Step 4 → Recurse on left and right halves`,
      ``,
      `Time: O(n log n) avg   O(n²) worst`,
    ],
    codeLines: QS_LINES.intro,
    dryRunRow: null,
  });

  // ── Recursive helper ────────────────────────────────────────────────────────
  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    // Pivot selected
    steps.push({
      type: 'pivot_select',
      pass: null,
      title: `Partition [${low}..${high}]  →  Pivot = ${pivot}`,
      array: [...arr],
      comparing: [], swapped: [],
      sortedIndices: [...sortedSet],
      pivotIndex: high,
      activeRange: [low, high],
      variables: { low, high, pivot, i: low - 1 },
      condition: null, conditionResult: null, decision: null,
      explanation: `Pivot chosen = arr[${high}] = ${pivot}. Now partition [${low}..${high}].`,
      notebookLines: [
        `Partition range: [${low} … ${high}]`,
        `Pivot = arr[${high}] = ${pivot}`,
        `i = low - 1 = ${low - 1}   (boundary pointer)`,
        ``,
        `Scan j from ${low} to ${high - 1}:`,
      ],
      codeLines: QS_LINES.pivot_select,
      dryRunRow: null,
    });

    for (let j = low; j < high; j++) {
      const doSwap = arr[j] <= pivot;

      if (doSwap) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      steps.push({
        type: 'compare',
        pass: null,
        title: `j = ${j}: arr[${j}] = ${arr[doSwap ? j : j]} ${doSwap ? '≤' : '>'} ${pivot} (pivot)`,
        array: [...arr],
        comparing: doSwap ? [] : [j, high],
        swapped:   doSwap ? [i, j] : [],
        sortedIndices: [...sortedSet],
        pivotIndex: high,
        activeRange: [low, high],
        variables: { i, j, [`arr[${j}]`]: doSwap ? arr[j] : arr[j], pivot },
        condition: `arr[${j}] ≤ pivot  →  ${doSwap ? arr[j] : arr[j] + (doSwap ? 0 : 0)} ≤ ${pivot}`,
        conditionResult: doSwap,
        decision: doSwap ? `✅ i++ → ${i},  swap arr[${i}] ↔ arr[${j}]` : '❌ skip',
        explanation: doSwap
          ? `arr[${j}] ≤ ${pivot} → i=${i}, swap → ${fmt(arr)}`
          : `arr[${j}] > ${pivot} → no swap, j moves right`,
        notebookLines: doSwap ? [
          `  j = ${j}:  arr[j] = ${arr[j]}   ≤  pivot (${pivot})  →  ✅`,
          `  i = ${i},  swap arr[${i}] ↔ arr[${j}]`,
          `  Array: ${fmt(arr)}`,
        ] : [
          `  j = ${j}:  arr[j] = ${arr[j]}   >  pivot (${pivot})  →  ❌`,
          `  No swap — j moves right`,
        ],
        codeLines: doSwap ? QS_LINES.swap : QS_LINES.compare,
        dryRunRow: null,
      });
    }

    // Place pivot
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    sortedSet.add(i + 1);

    steps.push({
      type: 'pivot_place',
      pass: null,
      title: `Place Pivot ${pivot} at index ${i + 1}`,
      array: [...arr],
      comparing: [], swapped: [],
      sortedIndices: [...sortedSet],
      pivotIndex: i + 1,
      activeRange: [low, high],
      variables: { 'pivot index': i + 1, pivot },
      condition: null, conditionResult: null, decision: null,
      explanation: `Pivot ${pivot} placed at index ${i + 1}. It is now in its final sorted position!`,
      notebookLines: [
        `Swap arr[${i + 1}] ↔ arr[${high}]  (place pivot)`,
        `Pivot ${pivot} is now at index ${i + 1} ✓`,
        `Array: ${fmt(arr)}`,
        ``,
        `Everything left of index ${i + 1} ≤ ${pivot}`,
        `Everything right of index ${i + 1} ≥ ${pivot}`,
      ],
      codeLines: QS_LINES.pivot_place,
      dryRunRow: null,
    });

    return i + 1;
  }

  function quickSortRec(low, high) {
    if (low >= high) {
      if (low === high) sortedSet.add(low);
      return;
    }

    steps.push({
      type: 'recurse',
      pass: null,
      title: `Recurse on [${low}..${high}]`,
      array: [...arr],
      comparing: [], swapped: [],
      sortedIndices: [...sortedSet],
      pivotIndex: null,
      activeRange: [low, high],
      variables: { low, high },
      condition: null, conditionResult: null, decision: null,
      explanation: `Recursively sorting subarray from index ${low} to ${high}.`,
      notebookLines: [
        `quickSort( arr, low=${low}, high=${high} )`,
        `Array: ${fmt(arr.slice(low, high + 1))}  (range [${low}..${high}])`,
      ],
      codeLines: QS_LINES.recurse,
      dryRunRow: null,
    });

    const pivotIdx = partition(low, high);
    quickSortRec(low, pivotIdx - 1);
    quickSortRec(pivotIdx + 1, high);
  }

  quickSortRec(0, n - 1);

  // Fill remaining as sorted
  for (let k = 0; k < n; k++) sortedSet.add(k);

  // ── FINAL ──────────────────────────────────────────────────────────────────
  steps.push({
    type: 'final',
    pass: null,
    title: '🎉 Final Answer',
    array: [...arr],
    comparing: [], swapped: [],
    sortedIndices: [...sortedSet],
    pivotIndex: null, activeRange: null,
    variables: {},
    condition: null, conditionResult: null, decision: null,
    explanation: `Quick Sort complete: ${fmt(arr)}`,
    notebookLines: [
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🎉  FINAL ANSWER`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `  ${fmt(arr)}`,
      ``,
      `  Fully sorted via Quick Sort ✓`,
    ],
    codeLines: QS_LINES.final,
    dryRunRow: null,
  });

  return { steps, dryRunRows: [] };
}
