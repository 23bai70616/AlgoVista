export const bubbleSort = (array) => {
  const animations = [];
  const auxiliaryArray = [...array];
  const n = auxiliaryArray.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Push comparison indices (to change their color)
      animations.push({ type: 'comparison', indices: [j, j + 1] });

      if (auxiliaryArray[j] > auxiliaryArray[j + 1]) {
        // Swap elements
        const temp = auxiliaryArray[j];
        auxiliaryArray[j] = auxiliaryArray[j + 1];
        auxiliaryArray[j + 1] = temp;

        // Push swap indices and the values
        animations.push({
          type: 'swap',
          indices: [j, j + 1],
          values: [auxiliaryArray[j], auxiliaryArray[j + 1]]
        });
      }
    }
    // Mark the last sorted element
    animations.push({ type: 'sorted', index: n - i - 1 });
  }
  // Mark the first element as sorted at the end
  animations.push({ type: 'sorted', index: 0 });

  return animations;
};
