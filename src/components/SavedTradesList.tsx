import React from 'react';
import { SavedTrade } from '../types/calculator';
import { formatCurrency, formatPercent } from '../utils/calculatorEngine';
import { Trash2, ArrowUpRight, Download, Calendar, Layers, ShieldAlert } from 'lucide-react';

interface SavedTradesListProps {
  savedTrades: SavedTrade[];
  onLoadTrade: (trade: SavedTrade) => void;
  onDeleteTrade: (id: string) => void;
  onClearAll: () => void;
}

export const SavedTradesList: React.FC<SavedTradesListProps> = ({
  savedTrades,
  onLoadTrade,
  onDeleteTrade,
  onClearAll,
}) => {
  const exportToCSV = () => {
    if (savedTrades.length === 0) return;
    const headers = [
      'Timestamp',
      'Name',
      'Direction',
      'Account Balance',
      'Risk %',
      'Risk Cash',
      'Stop Loss %',
      'Leverage',
      'Position Size',
      'Margin Required',
      'Liquidation %',
      'Notes',
    ];

    const rows = savedTrades.map((t) => [
      new Date(t.timestamp).toISOString(),
      `"${t.name.replace(/"/g, '""')}"`,
      t.inputs.direction,
      t.inputs.accountBalance,
      t.inputs.riskPercentage,
      t.results.riskAmount,
      t.inputs.stopLossPercentage,
      t.inputs.leverage,
      t.results.positionSize,
      t.results.marginRequired,
      t.results.liquidationDistancePercent,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `position_size_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (savedTrades.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Saved Trades Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Calculate your position size and click "Save Setup" on the Order Ticket to archive trade
          plans for reference.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white">Saved Trade Plans</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {savedTrades.length} saved setups stored in local session storage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {savedTrades.map((trade) => {
          const dateStr = new Date(trade.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={trade.id}
              className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trade.inputs.direction === 'LONG'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {trade.inputs.direction}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{trade.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>
                  {trade.notes && (
                    <p className="text-xs text-slate-400 italic">"{trade.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadTrade(trade)}
                    className="px-2.5 py-1 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition-colors flex items-center gap-1"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTrade(trade.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trade Data Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">POSITION SIZE</span>
                  <span className="text-white font-bold">
                    {formatCurrency(trade.results.positionSize, trade.inputs.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MARGIN ({trade.inputs.leverage}x)</span>
                  <span className="text-indigo-400">
                    {formatCurrency(trade.results.marginRequired, trade.inputs.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">STOP LOSS</span>
                  <span className="text-rose-400">
                    {trade.inputs.stopLossPercentage}% ({formatCurrency(trade.results.riskAmount, trade.inputs.currency)})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">LIQUIDATION</span>
                  <span className={trade.results.isLiquidatedBeforeStopLoss ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    -{trade.results.liquidationDistancePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
