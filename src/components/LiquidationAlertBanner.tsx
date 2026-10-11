import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types/calculator';
import { formatCurrency, formatPercent } from '../utils/calculatorEngine';
import { AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

interface LiquidationAlertBannerProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
  onApplySafeLeverage: (safeLev: number) => void;
}

export const LiquidationAlertBanner: React.FC<LiquidationAlertBannerProps> = ({
  results,
  inputs,
  onApplySafeLeverage,
}) => {
  if (results.isLiquidatedBeforeStopLoss) {
    return (
      <div className="bg-rose-950/40 border border-rose-600/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Critical Liquidation Risk
              </span>
              <span className="text-[11px] font-mono text-rose-300/80">
                Stop Loss {inputs.stopLossPercentage}% ≥ Liquidation {results.liquidationDistancePercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl">
              At <strong className="font-mono text-white">{inputs.leverage}x</strong> leverage, your
              isolated position is liquidated after an adverse price move of just{' '}
              <strong className="font-mono text-white">
                {results.liquidationDistancePercent.toFixed(2)}%
              </strong>
              . Because your Stop Loss is wider at{' '}
              <strong className="font-mono text-white">{inputs.stopLossPercentage}%</strong>, your
              trade will be <strong>liquidated first</strong>, forfeiting your full margin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onApplySafeLeverage(results.maxSafeLeverage)}
          className="self-stretch sm:self-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          <span>Use Safe Leverage ({results.maxSafeLeverage}x)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (results.isInsufficientMargin) {
    return (
      <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Insufficient Account Balance
          </span>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Opening this position requires{' '}
            <strong className="font-mono text-white">
              {formatCurrency(results.marginRequired, inputs.currency)}
            </strong>{' '}
            in margin collateral, which exceeds your account balance of{' '}
            <strong className="font-mono text-white">
              {formatCurrency(inputs.accountBalance, inputs.currency)}
            </strong>{' '}
            ({formatPercent(results.marginUsagePercent, 1)} usage). Increase leverage or decrease
            risk per trade.
          </p>
        </div>
      </div>
    );
  }

  if (results.marginUsagePercent > 75) {
    return (
      <div className="bg-amber-950/30 border border-amber-600/30 rounded-xl p-3.5 flex items-start gap-3">
        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-amber-300">
            High Margin Utilization Notice
          </span>
          <p className="text-xs text-amber-200/80">
            This position locks up{' '}
            <strong className="font-mono text-white">
              {formatPercent(results.marginUsagePercent, 1)}
            </strong>{' '}
            of your available account balance, leaving{' '}
            <strong className="font-mono text-white">
              {formatCurrency(results.remainingBalance, inputs.currency)}
            </strong>{' '}
            for buffer or other trades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-slate-300">
          <strong className="text-emerald-400 font-medium">Safe Margin Hierarchy:</strong>{' '}
          Stop Loss (-{inputs.stopLossPercentage}%) triggers{' '}
          <span className="font-mono text-white font-medium">
            {results.liquidationBufferPercent.toFixed(2)}%
          </span>{' '}
          before liquidation (-{results.liquidationDistancePercent.toFixed(2)}%).
        </span>
      </div>
      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
        Loss on Collateral: {results.lossOnMarginPercent.toFixed(1)}%
      </span>
    </div>
  );
};
