export const mergeSort = (array) => {
  const animations = [];
  if (array.length <= 1) return animations;
  const auxiliaryArray = [...array];
  mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations, 0);
  
  // Final certification pass: Mark everything as sorted at depth 0
  for (let i = 0; i < array.length; i++) {
    animations.push({ type: 'sorted', index: i });
  }
  return animations;
};

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations, depth) {
  if (startIdx === endIdx) {
    // When we reach leaves, make sure they stay in their depth
    animations.push({ type: 'range', indices: [startIdx, endIdx], depth });
    return;
  }
  
  // Divide: Visualize current active range at current depth
  animations.push({ type: 'range', indices: [startIdx, endIdx], depth });
  
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations, depth + 1);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations, depth + 1);
  
  // Conquer: Move back up during merge
  animations.push({ type: 'range', indices: [startIdx, endIdx], depth });
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations, depth);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations, depth) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;

  while (i <= middleIdx && j <= endIdx) {
    animations.push({ type: 'comparison', indices: [i, j] });
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[i], depth });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[j], depth });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  while (i <= middleIdx) {
    animations.push({ type: 'comparison', indices: [i, i] });
    animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[i], depth });
    mainArray[k++] = auxiliaryArray[i++];
  }
  while (j <= endIdx) {
    animations.push({ type: 'comparison', indices: [j, j] });
    animations.push({ type: 'overwrite', index: k, value: auxiliaryArray[j], depth });
    mainArray[k++] = auxiliaryArray[j++];
  }
}
