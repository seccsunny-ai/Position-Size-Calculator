import React from 'react';
import { SUPPORTED_CURRENCIES } from '../utils/calculatorEngine';
import { CurrencyConfig } from '../types/calculator';
import { RotateCcw, BookmarkCheck, Sliders, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'matrix' | 'scenarios' | 'history';
  setActiveTab: (tab: 'calculator' | 'matrix' | 'scenarios' | 'history') => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  onReset: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCurrency,
  setSelectedCurrency,
  onReset,
  savedCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
            Δ
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            PositionCalc
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
            Risk & Margin Engine
          </span>
        </div>

        {/* Zone 2: Single-line Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Leverage Matrix
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scenarios'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            R:R Targets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            Saved ({savedCount})
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Currency & Reset) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1">
            <span className="text-[11px] text-slate-400 font-mono">CCY:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              aria-label="Currency selection"
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c: CurrencyConfig) => (
                <option key={c.code} value={c.symbol} className="bg-slate-900 text-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onReset}
            title="Reset parameters to defaults"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Bar */}
      <div className="md:hidden flex items-center border-t border-slate-800/80 px-4 py-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'matrix' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Leverage Matrix
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'scenarios' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          R:R Targets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          Saved ({savedCount})
        </button>
      </div>
    </header>
  );
};
