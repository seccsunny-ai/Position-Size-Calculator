export type TradeDirection = 'LONG' | 'SHORT';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface CalculatorInputs {
  accountBalance: number;
  riskPercentage: number;
  stopLossPercentage: number;
  leverage: number;
  direction: TradeDirection;
  currency: string;
  assetPrice: number | null;
  feePercentage: number;
}

export interface RiskRewardScenario {
  ratio: number;
  label: string;
  targetMovePercent: number;
  profitCash: number;
  profitAccountPercent: number;
  roePercent: number; // Return on Margin Equity
}

export interface LeverageScenario {
  leverage: number;
  positionSize: number;
  marginRequired: number;
  marginUsagePercent: number;
  maxLossAtSL: number;
  maxLossPercent: number;
  liquidationDistancePercent: number;
  isLiquidatedBeforeStopLoss: boolean;
  isInsufficientMargin: boolean;
  status: 'safe' | 'caution' | 'danger';
}

export interface CalculationResults {
  // Core outputs
  riskAmount: number; // Guaranteed dollar risk = Balance * Risk%
  positionSize: number; // Total Notional = Risk Amount / SL%
  marginRequired: number; // Capital to commit = Position Size / Leverage
  marginUsagePercent: number; // Margin / Balance * 100
  remainingBalance: number; // Balance - Margin
  effectiveLeverage: number; // Position Size / Balance
  liquidationDistancePercent: number;
  lossOnMarginPercent: number; // SL% * Leverage (ROE loss on collateral)

  // Strict Risk Guarantee verification
  guaranteedMaxLoss: number; // Strictly equals riskAmount
  guaranteedLossPercent: number; // Strictly equals riskPercentage

  // Alerts & Checks
  isLiquidatedBeforeStopLoss: boolean;
  isInsufficientMargin: boolean;
  maxSafeLeverage: number;
  liquidationBufferPercent: number;

  // Optional Unit/Contract conversions
  units: number | null;

  // Fee estimations
  estimatedRoundTripFees: number;
  netRiskWithFees: number;

  // Multi-scenario breakdowns
  riskRewardScenarios: RiskRewardScenario[];
  leverageScenarios: LeverageScenario[];
}

export interface SavedTrade {
  id: string;
  timestamp: number;
  name: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
  notes?: string;
}
