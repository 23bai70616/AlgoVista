export const bfs = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.isVisited = true;

  while (queue.length > 0) {
    const currentNode = queue.shift();
    visitedNodesInOrder.push(currentNode);

    if (currentNode === endNode) return visitedNodesInOrder;

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        queue.push(neighbor);
      }
    }
  }
  return visitedNodesInOrder;
};

export const dfs = (grid, startNode, endNode) => {
  const visitedNodesInOrder = [];
  const stack = [startNode];
  // Use a separate seen set to prevent pushing duplicates onto the stack
  const seen = new Set();
  seen.add(startNode);

  while (stack.length > 0) {
    const currentNode = stack.pop();

    if (currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (currentNode === endNode) return visitedNodesInOrder;

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor) && !neighbor.isWall) {
        seen.add(neighbor);
        neighbor.previousNode = currentNode; // Set once, correctly
        stack.push(neighbor);
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
