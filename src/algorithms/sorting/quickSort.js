export const quickSort = (array) => {
  const animations = [];
  const auxiliaryArray = [...array];
  quickSortHelper(auxiliaryArray, 0, auxiliaryArray.length - 1, animations, 0);
  
  // Final certification pass: Mark everything as sorted
  for (let i = 0; i < array.length; i++) {
    animations.push({ type: 'sorted', index: i });
  }
  return animations;
};

function quickSortHelper(array, startIdx, endIdx, animations, depth) {
  if (startIdx >= endIdx) {
    if (startIdx === endIdx) animations.push({ type: 'sorted', index: startIdx });
    // Keep sorted leaf in current depth briefly before reset
    animations.push({ type: 'range', indices: [startIdx, endIdx], depth });
    return;
  }
  
  // Divide: Show active partition range at current depth
  animations.push({ type: 'range', indices: [startIdx, endIdx], depth });
  
  const pivotIdx = partition(array, startIdx, endIdx, animations, depth);
  quickSortHelper(array, startIdx, pivotIdx - 1, animations, depth + 1);
  quickSortHelper(array, pivotIdx + 1, endIdx, animations, depth + 1);
}

function partition(array, startIdx, endIdx, animations, depth) {
  const pivotValue = array[endIdx];
  animations.push({ type: 'pivot', index: endIdx });
  let i = startIdx;
  
  for (let j = startIdx; j < endIdx; j++) {
    animations.push({ type: 'comparison', indices: [j, endIdx] });
    if (array[j] < pivotValue) {
      // Swap
      [array[i], array[j]] = [array[j], array[i]];
      animations.push({ 
        type: 'swap', 
        indices: [i, j], 
        values: [array[i], array[j]],
        depth // Include depth for visual stability
      });
      i++;
    }
  }
  
  [array[i], array[endIdx]] = [array[endIdx], array[i]];
  animations.push({ 
    type: 'swap', 
    indices: [i, endIdx], 
    values: [array[i], array[endIdx]],
    depth
  });
  animations.push({ type: 'sorted', index: i });
  
  return i;
}
