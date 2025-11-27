export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  upperBand?: number;
  lowerBand?: number;
  rsi?: number;
}

export interface TwelveDataPoint {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TwelveDataResponse {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
    type: string;
  };
  values: TwelveDataPoint[];
  status: string;
  message?: string;
  code?: number;
}

export enum ExpertType {
  GENERAL = 'General Analyst',
  TREND = 'Trend Expert',
  REVERSAL = 'Reversal Scout',
  RISK = 'Risk Manager',
  SENTIMENT = 'Sentiment Decoder',
  SCALPER = 'Scalping Coach'
}

export interface AnalysisResult {
  text: string;
  timestamp: string;
  expert: ExpertType;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: number;
  isSignal?: boolean;
}

export interface TradeSignal {
  pair: string;
  action: 'BUY' | 'SELL' | 'WAIT';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number; // 0-100
  reasoning: string;
  timeframe: string;
  timestamp: number;
}

export interface ScreenerTicker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  rsi: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TradeHistoryItem {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  profit: number;
  status: 'CLOSED' | 'OPEN';
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Elite';
  avatar: string;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
}