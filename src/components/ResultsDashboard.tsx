import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types/calculator';
import { formatCurrency, formatUnits } from '../utils/calculatorEngine';
import {
  ShieldCheck,
  Wallet,
  Zap,
  Percent,
  Gauge,
  CircleDollarSign,
  Coins,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ResultsDashboardProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ inputs, results }) => {
  return (
    <div className="space-y-4">
      {/* 1. Strict Risk Guarantee Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Risk Cap Strictly Guaranteed
              </span>
              <span className="text-xs font-mono font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded">
                Max Loss: {formatCurrency(results.riskAmount, inputs.currency)} ({inputs.riskPercentage}%)
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
              No matter what leverage you choose (
              <strong className="text-white font-mono">{inputs.leverage}x</strong>) or stop loss you
              set (<strong className="text-white font-mono">{inputs.stopLossPercentage}%</strong>),
              your dollar loss if stopped out is{' '}
              <strong className="text-white underline decoration-emerald-400">
                locked at exactly {formatCurrency(results.riskAmount, inputs.currency)}
              </strong>
              .
            </p>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Dual Hero Cards: Position Size vs Margin Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Total Notional Position Size */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Position Size (Notional)
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                inputs.direction === 'LONG'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {inputs.direction}
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums">
              {formatCurrency(results.positionSize, inputs.currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter this if your exchange asks for <strong>Total Order Value / Notional / Contracts</strong>.
            </p>
          </div>

          {results.units !== null && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Asset Units:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatUnits(results.units)} Units (@ {formatCurrency(inputs.assetPrice || 0, inputs.currency)})
              </span>
            </div>
          )}
        </div>

        {/* Box 2: Margin / Capital to Enter (Updates dynamically with Leverage!) */}
        <div className="bg-gradient-to-b from-indigo-950/30 to-slate-950 border border-indigo-500/30 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Margin / Cost to Enter (Your Money)
            </span>
            <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
              @{inputs.leverage}x Leverage
            </span>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-indigo-300 tabular-nums">
              {formatCurrency(results.marginRequired, inputs.currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter this if your exchange asks for <strong>Margin / Cost (USDT)</strong>. Only{' '}
              <strong className="text-white font-mono">{results.marginUsagePercent.toFixed(1)}%</strong>{' '}
              of your account is locked!
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Leverage Effect:</span>
            <span className="text-indigo-400">
              Cuts capital requirement by {inputs.leverage}x
            </span>
          </div>
        </div>
      </div>

      {/* 3. Live Mathematical Proof Box */}
      <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-3.5 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Proof of Fixed Risk:</strong>{' '}
            <code className="text-white font-mono">
              {formatCurrency(results.positionSize, inputs.currency)} (Position) × {inputs.stopLossPercentage}% (Stop Loss)
            </code>{' '}
            = <strong className="text-emerald-400 font-mono font-bold">{formatCurrency(results.riskAmount, inputs.currency)}</strong>{' '}
            (exactly {inputs.riskPercentage}% of your {formatCurrency(inputs.accountBalance, inputs.currency)} balance).
          </span>
        </div>
      </div>

      {/* 4. Structured Supporting Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Metric 1: Cash at Risk */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cash Risked
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {inputs.riskPercentage}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(results.riskAmount, inputs.currency)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Guaranteed maximum loss
          </div>
        </div>

        {/* Metric 2: Required Margin */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              Margin Allocated
            </span>
            <span className="text-[11px] font-mono text-indigo-300">
              {results.marginUsagePercent.toFixed(1)}% acc
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(results.marginRequired, inputs.currency)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Collateral locked in trade
          </div>
        </div>

        {/* Metric 3: Liquidation Distance */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-rose-400" />
              Liquidation Move
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                results.isLiquidatedBeforeStopLoss ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {results.isLiquidatedBeforeStopLoss ? 'DANGER' : 'SAFE'}
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              results.isLiquidatedBeforeStopLoss ? 'text-rose-400' : 'text-white'
            }`}
          >
            -{results.liquidationDistancePercent.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {results.isLiquidatedBeforeStopLoss
              ? 'Triggers before stop loss!'
              : `${results.liquidationBufferPercent.toFixed(2)}% buffer past SL`}
          </div>
        </div>

        {/* Metric 4: Free Balance */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Free Balance
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              {(100 - results.marginUsagePercent).toFixed(1)}%
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {formatCurrency(results.remainingBalance, inputs.currency)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Unallocated balance
          </div>
        </div>

        {/* Metric 5: Return on Collateral at SL */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Percent className="w-3.5 h-3.5 text-rose-400" />
              Loss on Margin
            </span>
            <span className="text-[11px] font-mono text-rose-400">
              ROE @ SL
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            -{results.lossOnMarginPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {inputs.stopLossPercentage}% × {inputs.leverage}x
          </div>
        </div>

        {/* Metric 6: Effective Account Exposure */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              Account Leverage
            </span>
            <span className="text-[11px] font-mono text-sky-400">
              Ratio
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {results.effectiveLeverage.toFixed(2)}x
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Total Position ÷ Balance
          </div>
        </div>
      </div>

      {/* Fees Note (if configured) */}
      {inputs.feePercentage > 0 && (
        <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Estimated Round-Trip Fees ({inputs.feePercentage * 2}%):
          </span>
          <span className="font-mono text-white">
            {formatCurrency(results.estimatedRoundTripFees, inputs.currency)} (Total risk:{' '}
            <strong className="text-amber-400">
              {formatCurrency(results.netRiskWithFees, inputs.currency)}
            </strong>
            )
          </span>
        </div>
      )}
    </div>
  );
};
