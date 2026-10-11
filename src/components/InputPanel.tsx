import React, { useState } from 'react';
import {
  CalculatorInputs,
  TradeDirection,
} from '../types/calculator';
import {
  ACCOUNT_BALANCE_PRESETS,
  RISK_PERCENTAGE_PRESETS,
  STOP_LOSS_PRESETS,
  COMMON_LEVERAGES,
} from '../utils/calculatorEngine';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface InputPanelProps {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
}

export const InputPanel: React.FC<InputPanelProps> = ({ inputs, setInputs }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const updateField = <K extends keyof CalculatorInputs>(
    field: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericInput = (
    field: 'accountBalance' | 'riskPercentage' | 'stopLossPercentage' | 'leverage' | 'assetPrice' | 'feePercentage',
    rawVal: string,
    min = 0,
    max = Infinity
  ) => {
    if (rawVal === '') {
      updateField(field, 0 as never);
      return;
    }
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max);
      updateField(field, clamped as never);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Top Header & Direction Selector */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Trade Parameters</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate notional exposure using stop loss percentage
          </p>
        </div>

        {/* Long / Short Direction Segmented Control */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => updateField('direction', 'LONG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              inputs.direction === 'LONG'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Long
          </button>
          <button
            type="button"
            onClick={() => updateField('direction', 'SHORT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              inputs.direction === 'SHORT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Short
          </button>
        </div>
      </div>

      {/* Strict Risk Guarantee Note */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong className="text-white">Strict Risk Protection:</strong> Max loss at Stop Loss is
            strictly fixed to{' '}
            <strong className="text-emerald-400 font-mono">
              {inputs.currency}
              {((inputs.accountBalance * (inputs.riskPercentage || 0)) / 100).toLocaleString(
                'en-US',
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </strong>{' '}
            ({inputs.riskPercentage}%), no matter what leverage or SL % is selected.
          </span>
        </div>
      </div>

      {/* 1. Account Balance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            Account Balance
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            Total portfolio capital
          </span>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
            {inputs.currency}
          </span>
          <input
            type="number"
            min="1"
            step="any"
            value={inputs.accountBalance || ''}
            onChange={(e) => handleNumericInput('accountBalance', e.target.value, 0)}
            placeholder="10000"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2.5 pl-8 pr-4 text-sm font-mono text-white placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Quick Presets for Account Balance */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {ACCOUNT_BALANCE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => updateField('accountBalance', preset)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                inputs.accountBalance === preset
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {inputs.currency}{preset >= 1000 ? `${preset / 1000}k` : preset}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Risk Per Trade (%) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            Risk Per Trade (%)
          </label>
          <span className="text-[11px] font-mono text-amber-400/90">
            = {inputs.currency}
            {((inputs.accountBalance * (inputs.riskPercentage || 0)) / 100).toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}{' '}
            at risk
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={inputs.riskPercentage || ''}
            onChange={(e) => handleNumericInput('riskPercentage', e.target.value, 0.01, 100)}
            placeholder="1.0"
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg py-2.5 pl-3.5 pr-8 text-sm font-mono text-white placeholder-slate-600 transition-colors"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
            %
          </span>
        </div>

        {/* Quick Presets for Risk % */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {RISK_PERCENTAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => updateField('riskPercentage', preset)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                inputs.riskPercentage === preset
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {preset}% {preset === 1 && '(Standard)'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Stop Loss Percentage (%) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-rose-400" />
            Stop Loss Percentage (%)
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            Adverse price move to exit
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            min="0.01"
            max="100"
            step="0.1"
            value={inputs.stopLossPercentage || ''}
            onChange={(e) => handleNumericInput('stopLossPercentage', e.target.value, 0.01, 100)}
            placeholder="2.5"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg py-2.5 pl-3.5 pr-8 text-sm font-mono text-white placeholder-slate-600 transition-colors"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
            %
          </span>
        </div>

        {/* Quick Presets for Stop Loss % */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {STOP_LOSS_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => updateField('stopLossPercentage', preset)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                inputs.stopLossPercentage === preset
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* 4. Leverage (x) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Leverage Multiplier
          </label>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-indigo-400">
              {inputs.leverage}x
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              Margin needed: {inputs.currency}
              {(
                ((inputs.accountBalance * (inputs.riskPercentage || 0)) /
                  (inputs.stopLossPercentage || 1)) /
                (inputs.leverage || 1)
              ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={inputs.leverage}
            onChange={(e) => updateField('leverage', parseInt(e.target.value, 10) || 1)}
            aria-label="Leverage slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
            <span>1x (Spot)</span>
            <span>20x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Quick Presets for Leverage */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[1, 2, 3, 5, 10, 20, 25, 50, 100].map((lev) => (
            <button
              key={lev}
              type="button"
              onClick={() => updateField('leverage', lev)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                inputs.leverage === lev
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {lev === 1 ? '1x Spot' : `${lev}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Optional Settings (Asset Price & Fees) */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors py-1"
        >
          <span>Optional Sizing Helpers (Asset Price & Fees)</span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">
                  Current Asset Price ({inputs.currency})
                </label>
                <span className="text-[10px] text-slate-500">
                  Computes exact coin / share quantity
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={inputs.assetPrice ?? ''}
                onChange={(e) =>
                  updateField(
                    'assetPrice',
                    e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                placeholder="e.g. 65000 for BTC or 220 for Apple"
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">
                  Exchange Fee Rate (% per side)
                </label>
                <span className="text-[10px] text-slate-500">
                  Taker / Maker (round-trip: ×2)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.01"
                  value={inputs.feePercentage ?? ''}
                  onChange={(e) =>
                    updateField(
                      'feePercentage',
                      e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0)
                    )
                  }
                  placeholder="0.05"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 shrink-0">
                  {[0, 0.02, 0.05, 0.1].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => updateField('feePercentage', f)}
                      className={`px-1.5 py-1 text-[10px] font-mono rounded ${
                        inputs.feePercentage === f
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mechanics Explanation Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          <span>How does this formula work without entry/exit prices?</span>
        </button>

        {showHelp && (
          <div className="mt-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded border border-slate-800/80 leading-relaxed space-y-1.5">
            <p>
              <strong className="text-slate-200">Formula:</strong>{' '}
              <code className="text-emerald-400 font-mono">
                Position Size = (Account Balance × Risk %) ÷ Stop Loss %
              </code>
            </p>
            <p>
              Because you specify that the market move allowed against you is{' '}
              <span className="text-rose-400 font-mono font-medium">
                {inputs.stopLossPercentage}%
              </span>
              , the calculator determines the exact total dollar exposure so that a{' '}
              {inputs.stopLossPercentage}% adverse move loses exactly{' '}
              <span className="text-amber-400 font-mono font-medium">
                {inputs.currency}
                {((inputs.accountBalance * (inputs.riskPercentage || 0)) / 100).toFixed(2)}
              </span>
              .
            </p>
            <p>
              Leverage then determines how much margin collateral (
              <code className="text-indigo-400 font-mono">Position Size ÷ Leverage</code>) you
              must lock in your exchange account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
