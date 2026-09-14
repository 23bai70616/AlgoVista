import React from 'react';

const NAV_ITEMS = [
  { id: 'sorting',      label: '⚡ Sorting',     },
  { id: 'pathfinding',  label: '🗺️ Pathfinding', },
  { id: 'tree',         label: '🌳 Trees',        },
  { id: 'graphs',       label: '🕸️ Graphs',       },
  { id: 'tsp',          label: '🧭 TSP',          isSpecial: true },
  { id: 'compare',      label: '⚔️ Compare',      isSpecial: true },
  { id: 'notebook',     label: '📒 Notebook',     isSpecial: true },
];

const Navbar = ({ darkMode, setDarkMode, activeView, setActiveView }) => {
  return (
    <nav className="h-16 shrink-0 border-b border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-white font-black text-base">AV</span>
        </div>
        <span className="text-xl font-black gradient-text hidden sm:block">AlgoVista</span>
      </div>

      {/* Nav Links */}
      <ul className="flex items-center gap-1 text-xs font-bold">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <li
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? item.isSpecial
                    ? 'bg-secondary/15 text-secondary ring-1 ring-secondary/30'
                    : 'bg-primary/15 text-primary ring-1 ring-primary/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-dark-border'
                }
              `}
            >
              {item.label}
            </li>
          );
        })}
      </ul>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-300 hover:ring-2 ring-primary/30 transition-all duration-200"
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
    </nav>
  );
};

export default Navbar;
