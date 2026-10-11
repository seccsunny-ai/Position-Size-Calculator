import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types/calculator';
import { formatCurrency, formatPercent } from '../utils/calculatorEngine';
import { ShieldCheck, Skull, Activity } from 'lucide-react';

interface VisualRiskGaugeProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}

export const VisualRiskGauge: React.FC<VisualRiskGaugeProps> = ({ inputs, results }) => {
  // Margin usage clamped for visual progress bar
  const marginUsage = Math.min(100, Math.max(0, results.marginUsagePercent));
  const freeUsage = Math.max(0, 100 - marginUsage);

  // Maximum scale for distance gauge
  const maxScale = Math.max(15, results.liquidationDistancePercent * 1.25, inputs.stopLossPercentage * 1.25);
  const slPositionPct = Math.min(95, (inputs.stopLossPercentage / maxScale) * 100);
  const liqPositionPct = Math.min(95, (results.liquidationDistancePercent / maxScale) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* 1. Account Capital Allocation */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Account Capital Allocation
          </span>
          <span className="font-mono text-slate-400">
            Margin: <strong className="text-white">{results.marginUsagePercent.toFixed(1)}%</strong> · Free:{' '}
            <strong className="text-emerald-400">{(100 - results.marginUsagePercent).toFixed(1)}%</strong>
          </span>
        </div>

        {/* Allocation Bar */}
        <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${marginUsage}%` }}
            className={`h-full transition-all duration-300 ${
              results.isInsufficientMargin
                ? 'bg-rose-500'
                : results.marginUsagePercent > 75
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            title={`Required Margin: ${formatCurrency(results.marginRequired, inputs.currency)}`}
          />
          <div
            style={{ width: `${freeUsage}%` }}
            className="h-full bg-emerald-500/30 transition-all duration-300"
            title={`Free Balance: ${formatCurrency(results.remainingBalance, inputs.currency)}`}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>Used: {formatCurrency(results.marginRequired, inputs.currency)}</span>
          <span>Free: {formatCurrency(results.remainingBalance, inputs.currency)}</span>
        </div>
      </div>

      {/* 2. Stop Loss vs. Liquidation Corridor */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            Adverse Price Move Horizon (Long/Short)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {results.isLiquidatedBeforeStopLoss ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <Skull className="w-3 h-3" /> Liquidation precedes Stop Loss
              </span>
            ) : (
              <span className="text-emerald-400">
                Safe Buffer: +{results.liquidationBufferPercent.toFixed(2)}%
              </span>
            )}
          </span>
        </div>

        {/* Visual Corridor Line */}
        <div className="relative pt-6 pb-4">
          {/* Main axis line */}
          <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800 relative">
            {/* Safe zone filling from entry to SL */}
            {!results.isLiquidatedBeforeStopLoss && (
              <div
                style={{ width: `${slPositionPct}%` }}
                className="h-full bg-emerald-500/20 rounded-l-full"
              />
            )}
            {/* Danger zone if SL extends beyond liquidation */}
            {results.isLiquidatedBeforeStopLoss && (
              <div
                style={{ left: `${liqPositionPct}%`, width: `${slPositionPct - liqPositionPct}%` }}
                className="absolute top-0 h-full bg-rose-500/40"
              />
            )}
          </div>

          {/* Marker 1: Entry Point (0%) */}
          <div className="absolute top-1 left-0 -translate-x-1/2 flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-slate-950 shadow" />
            <span className="text-[10px] font-mono text-slate-400 mt-1">Entry (0%)</span>
          </div>

          {/* Marker 2: Stop Loss Marker */}
          <div
            style={{ left: `${slPositionPct}%` }}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10"
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow ${
                results.isLiquidatedBeforeStopLoss ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-bold mt-1 px-1 rounded ${
                results.isLiquidatedBeforeStopLoss
                  ? 'text-rose-400 bg-rose-950/60'
                  : 'text-amber-400 bg-amber-950/60'
              }`}
            >
              SL: -{inputs.stopLossPercentage}%
            </span>
          </div>

          {/* Marker 3: Liquidation Point */}
          <div
            style={{ left: `${liqPositionPct}%` }}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-slate-950 shadow" />
            <span className="text-[10px] font-mono text-rose-400 mt-1 bg-rose-950/60 px-1 rounded">
              Liq: -{results.liquidationDistancePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          The stop loss must trigger <strong>before</strong> the liquidation threshold to ensure
          you only lose your predetermined risk of{' '}
          <strong className="text-slate-300 font-mono">
            {formatCurrency(results.riskAmount, inputs.currency)} ({inputs.riskPercentage}%)
          </strong>
          , rather than forfeiting your entire margin collateral of{' '}
          <strong className="text-slate-300 font-mono">
            {formatCurrency(results.marginRequired, inputs.currency)}
          </strong>
          .
        </p>
      </div>
    </div>
  );
};
