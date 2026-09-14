import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', disabled, className = '' }) => {
  const base = "px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2 justify-center whitespace-nowrap";

  const variants = {
    primary:   "bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    secondary: "bg-slate-100 dark:bg-dark-border text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm",
    accent:    "bg-secondary text-white hover:bg-secondary-dark shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30",
    outline:   "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white",
    danger:    "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20",
    ghost:     "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-border hover:text-primary",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

export const Slider = ({ label, min, max, value, onChange, disabled }) => {
  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="flex justify-between items-center px-0.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className="text-[11px] font-black text-primary font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="input-range"
      />
    </div>
  );
};

export const ComplexityBadge = ({ time, space }) => (
  <div className="flex items-center gap-3 ml-auto">
    <div className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/15 px-3 py-1.5 rounded-lg border border-primary/20">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Time</span>
      <span className="text-xs font-black text-primary font-mono">{time}</span>
    </div>
    <div className="flex items-center gap-1.5 bg-secondary/10 dark:bg-secondary/15 px-3 py-1.5 rounded-lg border border-secondary/20">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Space</span>
      <span className="text-xs font-black text-secondary font-mono">{space}</span>
    </div>
  </div>
);
