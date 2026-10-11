import React from 'react';
import { CalculationResults, CalculatorInputs, LeverageScenario } from '../types/calculator';
import { formatCurrency, formatPercent } from '../utils/calculatorEngine';
import { Layers, Check, AlertOctagon, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LeverageMatrixProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onSelectLeverage: (lev: number) => void;
}

export const LeverageMatrix: React.FC<LeverageMatrixProps> = ({
  inputs,
  results,
  onSelectLeverage,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Leverage Sensitivity Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare position size, required margin, and liquidation threshold across leverage tiers. Click any row to apply.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Current: <strong className="text-indigo-400">{inputs.leverage}x</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">Leverage</th>
              <th className="py-2.5 px-3 text-right">Margin (Cost)</th>
              <th className="py-2.5 px-3 text-right">Total Position</th>
              <th className="py-2.5 px-3 text-right text-emerald-400">Loss at SL (Guaranteed)</th>
              <th className="py-2.5 px-3 text-right">Liquidation Move</th>
              <th className="py-2.5 px-3 text-right">Safety Status</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {results.leverageScenarios.map((scen: LeverageScenario) => {
              const isSelected = inputs.leverage === scen.leverage;

              return (
                <tr
                  key={scen.leverage}
                  onClick={() => onSelectLeverage(scen.leverage)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-950/40 border-l-2 border-indigo-500 text-white font-semibold'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-2">
                      {scen.leverage === 1 ? '1x (Spot)' : `${scen.leverage}x`}
                      {isSelected && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-indigo-300">
                    {formatCurrency(scen.marginRequired, inputs.currency)}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      {formatPercent(scen.marginUsagePercent, 1)} balance
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right font-semibold text-white">
                    {formatCurrency(scen.positionSize, inputs.currency)}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    -{formatCurrency(scen.maxLossAtSL, inputs.currency)} ({scen.maxLossPercent.toFixed(1)}%)
                  </td>

                  <td className="py-2.5 px-3 text-right text-rose-400">
                    -{scen.liquidationDistancePercent.toFixed(1)}%
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {scen.isLiquidatedBeforeStopLoss ? (
                      <span className="text-rose-400 flex items-center justify-end gap-1 text-[11px]">
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                        Liquidated before SL
                      </span>
                    ) : scen.isInsufficientMargin ? (
                      <span className="text-rose-400 flex items-center justify-end gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Insufficient Balance
                      </span>
                    ) : scen.status === 'caution' ? (
                      <span className="text-amber-400 flex items-center justify-end gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        High Utilization
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center justify-end gap-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        Safe
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLeverage(scen.leverage);
                      }}
                      className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
