import React, { useState } from 'react';
import { CalculationResults, CalculatorInputs, RiskRewardScenario } from '../types/calculator';
import { formatCurrency, formatPercent } from '../utils/calculatorEngine';
import { Target, TrendingUp, Calculator } from 'lucide-react';

interface RiskRewardTableProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
}

export const RiskRewardTable: React.FC<RiskRewardTableProps> = ({ inputs, results }) => {
  const [customRatio, setCustomRatio] = useState<number>(3.5);

  const customTargetMove = (inputs.stopLossPercentage || 0) * customRatio;
  const customProfitCash = (results.riskAmount || 0) * customRatio;
  const customProfitAccount = (inputs.riskPercentage || 0) * customRatio;
  const customRoe = customTargetMove * (inputs.leverage || 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Risk-to-Reward Scenario Planning
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Profit targets projected from your {inputs.stopLossPercentage}% Stop Loss baseline (1R ={' '}
            {formatCurrency(results.riskAmount, inputs.currency)})
          </p>
        </div>

        {/* Custom Ratio Input */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg shrink-0">
          <Calculator className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Custom 1:</span>
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.5"
            value={customRatio || ''}
            onChange={(e) => setCustomRatio(parseFloat(e.target.value) || 0)}
            className="w-14 bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-xs font-mono text-white text-center focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs font-mono font-semibold text-emerald-400">
            =+{formatCurrency(customProfitCash, inputs.currency)}
          </span>
        </div>
      </div>

      {/* R:R Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">Multiple (R)</th>
              <th className="py-2.5 px-3">Required Price Move</th>
              <th className="py-2.5 px-3 text-right">Cash Profit</th>
              <th className="py-2.5 px-3 text-right">Account Growth</th>
              <th className="py-2.5 px-3 text-right">Return on Margin (ROE)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {/* Stop Loss Row (Baseline 0R) */}
            <tr className="bg-rose-950/20 text-rose-300">
              <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Stop Loss (0R)
              </td>
              <td className="py-2.5 px-3">
                {inputs.direction === 'LONG' ? '-' : '+'}
                {inputs.stopLossPercentage.toFixed(2)}%
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                -{formatCurrency(results.riskAmount, inputs.currency)}
              </td>
              <td className="py-2.5 px-3 text-right text-rose-400">
                -{inputs.riskPercentage.toFixed(2)}%
              </td>
              <td className="py-2.5 px-3 text-right text-rose-400">
                -{results.lossOnMarginPercent.toFixed(2)}%
              </td>
            </tr>

            {/* Standard Scenarios */}
            {results.riskRewardScenarios.map((scen: RiskRewardScenario) => (
              <tr
                key={scen.ratio}
                className="hover:bg-slate-800/40 transition-colors text-slate-200"
              >
                <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                  {scen.label}
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  {inputs.direction === 'LONG' ? '+' : '-'}
                  {scen.targetMovePercent.toFixed(2)}%
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                  +{formatCurrency(scen.profitCash, inputs.currency)}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-400">
                  +{scen.profitAccountPercent.toFixed(2)}%
                </td>
                <td className="py-2.5 px-3 text-right text-indigo-300">
                  +{scen.roePercent.toFixed(2)}%
                </td>
              </tr>
            ))}

            {/* Custom Row if entered */}
            {customRatio > 0 && !results.riskRewardScenarios.some((s) => s.ratio === customRatio) && (
              <tr className="bg-emerald-950/20 text-emerald-300 font-semibold border-t-2 border-emerald-500/30">
                <td className="py-2.5 px-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Custom 1:{customRatio} ({customRatio}R)
                </td>
                <td className="py-2.5 px-3">
                  {inputs.direction === 'LONG' ? '+' : '-'}
                  {customTargetMove.toFixed(2)}%
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                  +{formatCurrency(customProfitCash, inputs.currency)}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-400">
                  +{customProfitAccount.toFixed(2)}%
                </td>
                <td className="py-2.5 px-3 text-right text-indigo-300">
                  +{customRoe.toFixed(2)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
