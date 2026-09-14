/**
 * A* Pathfinding Algorithm
 * Uses Manhattan distance as heuristic for grid-based pathfinding.
 * Returns visited nodes in exploration order.
 */
export const aStar = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  startNode.distance = 0;

  // g: cost from start, h: heuristic, f: g + h
  const openSet = [startNode];
  const gScore = new Map();
  const fScore = new Map();

  const nodeKey = (n) => `${n.row}-${n.col}`;
  const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

  for (const row of grid) {
    for (const node of row) {
      gScore.set(nodeKey(node), Infinity);
      fScore.set(nodeKey(node), Infinity);
    }
  }

  gScore.set(nodeKey(startNode), 0);
  fScore.set(nodeKey(startNode), heuristic(startNode, endNode));

  while (openSet.length > 0) {
    // Sort by fScore ascending
    openSet.sort((a, b) => fScore.get(nodeKey(a)) - fScore.get(nodeKey(b)));
    const current = openSet.shift();

    if (current.isWall) continue;
    if (current.isVisited) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) return visitedNodesInOrder;

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      const weight = neighbor.isWeight ? 10 : 1;
      const tentativeG = gScore.get(nodeKey(current)) + weight;

      if (tentativeG < gScore.get(nodeKey(neighbor))) {
        neighbor.previousNode = current;
        gScore.set(nodeKey(neighbor), tentativeG);
        fScore.set(nodeKey(neighbor), tentativeG + heuristic(neighbor, endNode));

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return visitedNodesInOrder;
};

function getNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}
