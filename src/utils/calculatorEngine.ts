import {
  CalculatorInputs,
  CalculationResults,
  CurrencyConfig,
  LeverageScenario,
  RiskRewardScenario,
} from '../types/calculator';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'USDT', symbol: '₮', name: 'Tether USDT' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
];

export const COMMON_LEVERAGES = [1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 125];

export const RISK_PERCENTAGE_PRESETS = [0.5, 1.0, 1.5, 2.0, 3.0, 5.0];

export const STOP_LOSS_PRESETS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0, 8.0, 10.0];

export const ACCOUNT_BALANCE_PRESETS = [1000, 5000, 10000, 25000, 50000, 100000];

export function calculatePositionSize(inputs: CalculatorInputs): CalculationResults {
  const balance = Math.max(0, inputs.accountBalance || 0);
  const riskPct = Math.max(0, inputs.riskPercentage || 0);
  const slPct = Math.max(0.0001, inputs.stopLossPercentage || 0.0001);
  const lev = Math.max(1, inputs.leverage || 1);

  // 1. Guaranteed Dollar Risk: EXACTLY Balance * (Risk% / 100)
  // Irrespective of leverage, this is the maximum loss when Stop Loss is hit!
  const riskAmount = balance * (riskPct / 100);

  // 2. Total Position Size (Notional Exposure):
  // Since Loss = Position Size * (Stop Loss% / 100), and Loss must equal riskAmount:
  // Position Size = riskAmount / (Stop Loss% / 100)
  const positionSize = riskAmount / (slPct / 100);

  // 3. Margin Required (Capital you actually commit from your account):
  // Leverage determines how much collateral you need to post:
  // Margin = Position Size / Leverage
  const marginRequired = positionSize / lev;

  // 4. Proof of Guaranteed Loss:
  const guaranteedMaxLoss = riskAmount;
  const guaranteedLossPercent = riskPct;

  // 5. Margin Usage (% of Account Balance)
  const marginUsagePercent = balance > 0 ? (marginRequired / balance) * 100 : 0;

  // 6. Remaining Balance
  const remainingBalance = balance - marginRequired;

  // 7. Effective Leverage on total account
  const effectiveLeverage = balance > 0 ? positionSize / balance : 0;

  // 8. Liquidation Distance (%)
  // At isolated margin, 100% loss of collateral happens at (100 / Leverage)%
  const liquidationDistancePercent = lev > 1 ? 100 / lev : 100;

  // 9. Liquidation check
  // If stop loss is deeper than or equal to liquidation distance, position is liquidated before SL!
  const isLiquidatedBeforeStopLoss = slPct >= liquidationDistancePercent;
  const liquidationBufferPercent = liquidationDistancePercent - slPct;

  // 10. Margin check
  const isInsufficientMargin = marginRequired > balance;

  // 11. Max safe leverage
  // SL must be strictly less than (100 / L) => L < (100 / SL)
  const maxSafeLeverage = Math.max(1, Math.floor(99.9 / slPct));

  // 12. Loss on Margin percentage (ROE on collateral)
  const lossOnMarginPercent = slPct * lev;

  // 13. Units / Coins sizing (if asset price provided)
  const units = inputs.assetPrice && inputs.assetPrice > 0 ? positionSize / inputs.assetPrice : null;

  // 14. Fees estimation
  const feePct = Math.max(0, inputs.feePercentage || 0);
  const estimatedRoundTripFees = positionSize * (feePct / 100) * 2;
  const netRiskWithFees = riskAmount + estimatedRoundTripFees;

  // 15. Risk-Reward Scenarios (1R to 5R based on strictly guaranteed cash risk)
  const rrRatios = [
    { ratio: 1.0, label: '1:1 (1R)' },
    { ratio: 1.5, label: '1:1.5 (1.5R)' },
    { ratio: 2.0, label: '1:2 (2R)' },
    { ratio: 2.5, label: '1:2.5 (2.5R)' },
    { ratio: 3.0, label: '1:3 (3R)' },
    { ratio: 4.0, label: '1:4 (4R)' },
    { ratio: 5.0, label: '1:5 (5R)' },
  ];

  const riskRewardScenarios: RiskRewardScenario[] = rrRatios.map(({ ratio, label }) => {
    const targetMovePercent = slPct * ratio;
    const profitCash = riskAmount * ratio;
    const profitAccountPercent = riskPct * ratio;
    const roePercent = targetMovePercent * lev; // ROE on allocated margin
    return {
      ratio,
      label,
      targetMovePercent,
      profitCash,
      profitAccountPercent,
      roePercent,
    };
  });

  // 16. Leverage Scenarios Matrix (PROVING risk is strictly preserved across all leverages!)
  const leverageScenarios: LeverageScenario[] = COMMON_LEVERAGES.map((compLev) => {
    const compMarginReq = positionSize / compLev;
    const compMarginUsage = balance > 0 ? (compMarginReq / balance) * 100 : 0;
    const compLiqDist = compLev > 1 ? 100 / compLev : 100;
    const compIsLiquidatedBeforeSL = slPct >= compLiqDist;
    const compIsInsufficient = compMarginReq > balance;

    let status: 'safe' | 'caution' | 'danger' = 'safe';
    if (compIsLiquidatedBeforeSL || compIsInsufficient) {
      status = 'danger';
    } else if (compMarginUsage > 75 || compLiqDist - slPct < 1.5) {
      status = 'caution';
    }

    return {
      leverage: compLev,
      positionSize,
      marginRequired: compMarginReq,
      marginUsagePercent: compMarginUsage,
      maxLossAtSL: riskAmount, // Strictly guaranteed!
      maxLossPercent: riskPct, // Strictly guaranteed!
      liquidationDistancePercent: compLiqDist,
      isLiquidatedBeforeStopLoss: compIsLiquidatedBeforeSL,
      isInsufficientMargin: compIsInsufficient,
      status,
    };
  });

  return {
    riskAmount,
    positionSize,
    marginRequired,
    marginUsagePercent,
    remainingBalance,
    effectiveLeverage,
    liquidationDistancePercent,
    lossOnMarginPercent,
    guaranteedMaxLoss,
    guaranteedLossPercent,
    isLiquidatedBeforeStopLoss,
    isInsufficientMargin,
    maxSafeLeverage,
    liquidationBufferPercent,
    units,
    estimatedRoundTripFees,
    netRiskWithFees,
    riskRewardScenarios,
    leverageScenarios,
  };
}

export function formatCurrency(
  value: number,
  currencySymbol = '$',
  decimals = 2,
  includeSymbol = true
): string {
  if (isNaN(value) || !isFinite(value)) return `${currencySymbol}0.00`;
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = value < 0 ? '-' : '';
  return includeSymbol ? `${sign}${currencySymbol}${formatted}` : `${sign}${formatted}`;
}

export function formatPercent(value: number, decimals = 2, includeSign = false): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatUnits(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  if (value >= 1000) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (value >= 1) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } else {
    return value.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  }
}
