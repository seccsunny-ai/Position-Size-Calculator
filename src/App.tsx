import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorInputs, SavedTrade } from './types/calculator';
import { calculatePositionSize } from './utils/calculatorEngine';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LiquidationAlertBanner } from './components/LiquidationAlertBanner';
import { VisualRiskGauge } from './components/VisualRiskGauge';
import { RiskRewardTable } from './components/RiskRewardTable';
import { LeverageMatrix } from './components/LeverageMatrix';
import { TradeTicket } from './components/TradeTicket';
import { SavedTradesList } from './components/SavedTradesList';

const DEFAULT_INPUTS: CalculatorInputs = {
  accountBalance: 10000,
  riskPercentage: 1.0,
  stopLossPercentage: 2.5,
  leverage: 10,
  direction: 'LONG',
  currency: '$',
  assetPrice: null,
  feePercentage: 0.05,
};

const STORAGE_KEY = 'positioncalc_saved_trades_v1';

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    try {
      const saved = localStorage.getItem('positioncalc_current_inputs_v1');
      if (saved) {
        return { ...DEFAULT_INPUTS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_INPUTS;
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'scenarios' | 'history'>(
    'calculator'
  );
  const [savedTrades, setSavedTrades] = useState<SavedTrade[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Keep inputs cached in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('positioncalc_current_inputs_v1', JSON.stringify(inputs));
    } catch {
      // ignore
    }
  }, [inputs]);

  // Keep saved trades synced in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrades));
    } catch {
      // ignore
    }
  }, [savedTrades]);

  // Pure mathematical calculation results
  const results = useMemo(() => calculatePositionSize(inputs), [inputs]);

  // Handlers
  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const handleApplySafeLeverage = (safeLev: number) => {
    setInputs((prev) => ({ ...prev, leverage: safeLev }));
  };

  const handleSaveTrade = (name: string, notes: string) => {
    const newTrade: SavedTrade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      name,
      inputs: { ...inputs },
      results: { ...results },
      notes,
    };
    setSavedTrades((prev) => [newTrade, ...prev]);
  };

  const handleLoadTrade = (trade: SavedTrade) => {
    setInputs({ ...trade.inputs });
    setActiveTab('calculator');
  };

  const handleDeleteTrade = (id: string) => {
    setSavedTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllTrades = () => {
    if (window.confirm('Delete all saved trade setups?')) {
      setSavedTrades([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCurrency={inputs.currency}
        setSelectedCurrency={(currency) => setInputs((prev) => ({ ...prev, currency }))}
        onReset={handleReset}
        savedCount={savedTrades.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Alerts & Critical Checks */}
        <LiquidationAlertBanner
          results={results}
          inputs={inputs}
          onApplySafeLeverage={handleApplySafeLeverage}
        />

        {/* View Switcher Content */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Input Parameters (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <InputPanel inputs={inputs} setInputs={setInputs} />
              <TradeTicket
                inputs={inputs}
                results={results}
                onSaveTrade={handleSaveTrade}
              />
            </div>

            {/* Right Column: Results, Gauges & Scenarios (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <ResultsDashboard inputs={inputs} results={results} />
              <VisualRiskGauge inputs={inputs} results={results} />
              <RiskRewardTable inputs={inputs} results={results} />
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4">
                <InputPanel inputs={inputs} setInputs={setInputs} />
              </div>
              <div className="lg:col-span-8 space-y-6">
                <ResultsDashboard inputs={inputs} results={results} />
                <LeverageMatrix
                  inputs={inputs}
                  results={results}
                  onSelectLeverage={(lev) => setInputs((prev) => ({ ...prev, leverage: lev }))}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4">
                <InputPanel inputs={inputs} setInputs={setInputs} />
              </div>
              <div className="lg:col-span-8 space-y-6">
                <ResultsDashboard inputs={inputs} results={results} />
                <RiskRewardTable inputs={inputs} results={results} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <SavedTradesList
              savedTrades={savedTrades}
              onLoadTrade={handleLoadTrade}
              onDeleteTrade={handleDeleteTrade}
              onClearAll={handleClearAllTrades}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Position Sizing Calculator</span>
            <span>·</span>
            <span>Risk-First Execution Model</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Formula: Position Size = (Account Balance × Risk %) ÷ Stop Loss %
          </div>
        </div>
      </footer>
    </div>
  );
}
