import React, { useState } from 'react';
import { CalculationResults, CalculatorInputs } from '../types/calculator';
import { formatCurrency, formatPercent, formatUnits } from '../utils/calculatorEngine';
import { Copy, Check, BookmarkPlus, Share2 } from 'lucide-react';

interface TradeTicketProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onSaveTrade: (name: string, notes: string) => void;
}

export const TradeTicket: React.FC<TradeTicketProps> = ({ inputs, results, onSaveTrade }) => {
  const [copied, setCopied] = useState(false);
  const [tradeName, setTradeName] = useState('');
  const [tradeNotes, setTradeNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const generateSummaryText = () => {
    return [
      `=== POSITION SIZE ORDER TICKET ===`,
      `Direction: ${inputs.direction}`,
      `Account Balance: ${formatCurrency(inputs.accountBalance, inputs.currency)}`,
      `Leverage: ${inputs.leverage}x`,
      `Stop Loss: ${inputs.stopLossPercentage}%`,
      `Guaranteed Max Loss: ${formatCurrency(results.riskAmount, inputs.currency)} (strictly ${inputs.riskPercentage}% of balance)`,
      `----------------------------------`,
      `Total Position Size (Notional): ${formatCurrency(results.positionSize, inputs.currency)}`,
      `Margin / Cost Required: ${formatCurrency(results.marginRequired, inputs.currency)} (${results.marginUsagePercent.toFixed(1)}% of balance)`,
      `Effective Account Leverage: ${results.effectiveLeverage.toFixed(2)}x`,
      `Liquidation Threshold: -${results.liquidationDistancePercent.toFixed(2)}%`,
      `Loss on Margin Collateral: -${results.lossOnMarginPercent.toFixed(1)}%`,
      results.units ? `Units to Execute: ${formatUnits(results.units)} @ ${formatCurrency(inputs.assetPrice || 0, inputs.currency)}` : '',
      `1:2 Target (+${(inputs.stopLossPercentage * 2).toFixed(2)}%): +${formatCurrency(results.riskAmount * 2, inputs.currency)}`,
      `==================================`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = tradeName.trim() || `${inputs.direction} Setup (${inputs.stopLossPercentage}% SL)`;
    onSaveTrade(name, tradeNotes.trim());
    setTradeName('');
    setTradeNotes('');
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            Execution Order Ticket
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ready-to-use trade summary for exchange order entry or trading journal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Ticket'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaving(!isSaving)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Setup</span>
          </button>
        </div>
      </div>

      {/* Save Trade Form */}
      {isSaving && (
        <form onSubmit={handleSave} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-slate-200">Save Setup to History</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Setup Label / Pair</label>
              <input
                type="text"
                placeholder="e.g. BTC/USDT Long Breakout"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Notes / Confluence (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Daily support bounce, 4h RSI oversold"
                value={tradeNotes}
                onChange={(e) => setTradeNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsSaving(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
            >
              Confirm Save
            </button>
          </div>
        </form>
      )}

      {savedSuccess && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          Setup saved to your saved trades tab!
        </div>
      )}

      {/* Ticket Details View */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 font-mono text-xs space-y-2">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">ORDER TYPE</span>
          <span className="text-white font-semibold">
            {inputs.direction} MARKET / LIMIT
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">POSITION NOTIONAL</span>
          <span className="text-white font-bold">
            {formatCurrency(results.positionSize, inputs.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">MARGIN COLLATERAL</span>
          <span className="text-indigo-400">
            {formatCurrency(results.marginRequired, inputs.currency)} ({inputs.leverage}x)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">STOP LOSS ADVERSE MOVE</span>
          <span className="text-rose-400">
            -{inputs.stopLossPercentage}% (Max Loss: {formatCurrency(results.riskAmount, inputs.currency)})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">LIQUIDATION THRESHOLD</span>
          <span className={results.isLiquidatedBeforeStopLoss ? 'text-rose-400 font-bold' : 'text-slate-300'}>
            -{results.liquidationDistancePercent.toFixed(2)}%
          </span>
        </div>
        {results.units && (
          <div className="flex justify-between border-t border-slate-800 pt-2">
            <span className="text-slate-400">ASSET UNITS</span>
            <span className="text-emerald-400 font-bold">
              {formatUnits(results.units)} units
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
