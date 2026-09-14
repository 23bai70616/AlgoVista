export const generateRandomArray = (length, min, max) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1) + min));
};

export const ALGORITHM_COMPLEXITY = {
  // Sorting
  bubble: {
    time: 'O(n²)',
    space: 'O(1)',
    best: 'O(n)',
    worst: 'O(n²)',
    stable: true,
    description: 'Compares adjacent elements and swaps them if out of order. Simple but inefficient for large datasets.',
  },
  merge: {
    time: 'O(n log n)',
    space: 'O(n)',
    best: 'O(n log n)',
    worst: 'O(n log n)',
    stable: true,
    description: 'Divide-and-conquer approach: splits array in halves, sorts each, then merges. Optimal and stable.',
  },
  quick: {
    time: 'O(n log n) avg',
    space: 'O(log n)',
    best: 'O(n log n)',
    worst: 'O(n²)',
    stable: false,
    description: 'Picks a pivot and partitions array around it recursively. Very fast in practice.',
  },
  // Pathfinding
  dijkstra: {
    time: 'O((V + E) log V)',
    space: 'O(V)',
    best: 'O(E log V)',
    worst: 'O(V²)',
    stable: true,
    description: "Guarantees the shortest path in weighted graphs. Explores nodes by closest distance first.",
  },
  bfs: {
    time: 'O(V + E)',
    space: 'O(V)',
    best: 'O(1)',
    worst: 'O(V + E)',
    stable: true,
    description: 'Explores all neighbors level-by-level. Guarantees shortest path in unweighted graphs.',
  },
  dfs: {
    time: 'O(V + E)',
    space: 'O(V)',
    best: 'O(1)',
    worst: 'O(V + E)',
    stable: false,
    description: 'Explores as deep as possible before backtracking. Does NOT guarantee the shortest path.',
  },
  astar: {
    time: 'O(E log V)',
    space: 'O(V)',
    best: 'O(1)',
    worst: 'O(V²)',
    stable: true,
    description: 'Uses heuristics to guide search toward the goal. Faster than Dijkstra in practice.',
  },
  // Graph
  tsp: {
    time: 'O(n!) brute / O(n² 2ⁿ) DP',
    space: 'O(n) / O(n·2ⁿ)',
    best: 'O(n²)',
    worst: 'O(n!)',
    stable: false,
    description: 'Finds the shortest route visiting all nodes exactly once. NP-Hard problem.',
  },
};
