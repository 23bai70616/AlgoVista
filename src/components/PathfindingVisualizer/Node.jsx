import React from 'react';

const Node = ({
  col,
  isFinish,
  isStart,
  isWall,
  isWeight,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  row,
}) => {
  const extraClassName = isFinish
    ? 'node-finish'
    : isStart
    ? 'node-start'
    : isWall
    ? 'node-wall'
    : isWeight
    ? 'node-weight'
    : '';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`w-[22px] h-[22px] border-[0.5px] border-slate-100 dark:border-white/5 inline-block transition-colors duration-300 ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></div>
  );
};

export default Node;
