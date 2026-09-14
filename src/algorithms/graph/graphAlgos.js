// Graph Algorithms for Node-Link Visualizer

// TSP Brute Force - generates all permutations
export const tspBruteForce = (nodes, edges) => {
  const nodeIds = nodes.map(n => n.id);
  if (nodeIds.length > 8) return { error: "Too many nodes for Brute Force!" };

  const startNode = nodeIds[0];
  const others = nodeIds.slice(1);
  const permutations = getPermutations(others);
  
  let minCost = Infinity;
  let bestPath = [];
  const allAttempts = [];

  const getWeight = (id1, id2) => {
    const edge = edges.find(e => (e.from === id1 && e.to === id2) || (e.from === id2 && e.to === id1));
    return edge ? edge.weight : Infinity;
  };

  for (const p of permutations) {
    const path = [startNode, ...p, startNode];
    let currentCost = 0;
    let valid = true;

    for (let i = 0; i < path.length - 1; i++) {
      const w = getWeight(path[i], path[i+1]);
      if (w === Infinity) {
        valid = false;
        break;
      }
      currentCost += w;
    }

    if (valid) {
      allAttempts.push({ path: [...path], cost: currentCost });
      if (currentCost < minCost) {
        minCost = currentCost;
        bestPath = [...path];
      }
    }
  }

  return { bestPath, minCost, allAttempts };
};

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const perms = [];
  for (let i = 0; i < arr.length; i++) {
    const char = arr[i];
    const remainingChars = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (let p of getPermutations(remainingChars)) {
      perms.push([char, ...p]);
    }
  }
  return perms;
}

export function dijkstraGraph(adjList, startId, targetId) {
    const distances = {};
    const visitedOrder = [];
    const previous = {};
    const nodes = Object.keys(adjList);
    
    nodes.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    
    distances[startId] = 0;
    const unvisited = new Set(nodes);

    while (unvisited.size > 0) {
        const current = Array.from(unvisited).reduce((minNode, node) => 
            distances[node] < distances[minNode] ? node : minNode
        , Array.from(unvisited)[0]);

        if (distances[current] === Infinity) break;
        if (current === targetId) break;

        unvisited.delete(current);
        visitedOrder.push(current);

        adjList[current].forEach(neighbor => {
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.id]) {
                distances[neighbor.id] = alt;
                previous[neighbor.id] = current;
            }
        });
    }

    const shortestPath = [];
    let curr = targetId;
    while (curr !== null) {
        shortestPath.unshift(curr);
        curr = previous[curr];
    }

    return { visitedOrder, shortestPath: shortestPath[0] === startId ? shortestPath : [] };
}

export function bfsGraph(adjList, startId, targetId) {
    const visitedOrder = [];
    const previous = {};
    const queue = [startId];
    const visited = new Set([startId]);
    
    Object.keys(adjList).forEach(node => previous[node] = null);

    while (queue.length > 0) {
        const current = queue.shift();
        visitedOrder.push(current);

        if (current === targetId) break;

        for (const neighbor of adjList[current]) {
            if (!visited.has(neighbor.id)) {
                visited.add(neighbor.id);
                previous[neighbor.id] = current;
                queue.push(neighbor.id);
            }
        }
    }

    const path = [];
    let curr = targetId;
    while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
    }
    return { visitedOrder, shortestPath: path[0] === startId ? path : [] };
}

export function dfsGraph(adjList, startId, targetId) {
    const visitedOrder = [];
    const previous = {};
    const stack = [startId];
    const visited = new Set();
    
    Object.keys(adjList).forEach(node => previous[node] = null);

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;
        
        visited.add(current);
        visitedOrder.push(current);

        if (current === targetId) break;

        for (const neighbor of adjList[current]) {
            if (!visited.has(neighbor.id)) {
                previous[neighbor.id] = current;
                stack.push(neighbor.id);
            }
        }
    }

    const path = [];
    let curr = targetId;
    while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
    }
    return { visitedOrder, shortestPath: path[0] === startId ? path : [] };
}
