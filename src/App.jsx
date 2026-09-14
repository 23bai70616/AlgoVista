import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import SortingVisualizer from './components/SortingVisualizer/SortingVisualizer';
import PathfindingVisualizer from './components/PathfindingVisualizer/PathfindingVisualizer';
import TreeVisualizer from './components/TreeVisualizer/TreeVisualizer';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import ComparisonVisualizer from './components/ComparisonVisualizer/ComparisonVisualizer';
import TSPVisualizer from './components/TSPVisualizer/TSPVisualizer';
import NotebookVisualizer from './components/NotebookVisualizer/NotebookVisualizer';

function App() {
  const [darkMode, setDarkMode] = useState(true); // Default dark for premium feel
  const [activeView, setActiveView] = useState('sorting');

  useEffect(() => {
    // Apply dark class to <html> so Tailwind's 'dark:' variants work globally
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeView === 'sorting'     && <SortingVisualizer />}
        {activeView === 'pathfinding' && <PathfindingVisualizer />}
        {activeView === 'tree'        && <TreeVisualizer />}
        {activeView === 'graphs'      && <GraphVisualizer />}
        {activeView === 'compare'     && <ComparisonVisualizer />}
        {activeView === 'tsp'         && <TSPVisualizer />}
        {activeView === 'notebook'    && <NotebookVisualizer />}
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 shrink-0 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border flex items-center justify-between px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span className="gradient-text font-black">AlgoVista v2.0</span>
        <div className="flex gap-6">
          <span>React + Tailwind v4</span>
          <span className="text-primary">● Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
