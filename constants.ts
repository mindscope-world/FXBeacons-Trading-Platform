import { ChartDataPoint, ExpertType, TradeHistoryItem, NotificationItem, UserProfile } from './types';

export const APP_NAME = "FXBeacons";
export const SERP_API_KEY = "b9f83bb30f906bd9d80b0383996a038351e752ef79af9649662870e815537ad6";

export const SCREENER_SYMBOLS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 
  'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 
  'EUR/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD'
];

// Mock Data for EUR/USD (Fallback)
export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 100 }, (_, i) => {
  const basePrice = 1.0850;
  // Create a random walk for realistic looking data
  const volatility = 0.0020;
  const trend = Math.sin(i / 10) * 0.0100; // Larger wave pattern
  
  const open = basePrice + trend + (Math.random() - 0.5) * volatility * i * 0.5;
  const close = open + (Math.random() - 0.5) * volatility;
  const high = Math.max(open, close) + Math.random() * volatility * 0.5;
  const low = Math.min(open, close) - Math.random() * volatility * 0.5;
  const volume = Math.floor(Math.random() * 10000) + 5000;

  // Format time as HH:mm
  const date = new Date();
  date.setMinutes(date.getMinutes() - (100 - i) * 15); // 15 min candles
  const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return {
    time,
    open: Number(open.toFixed(5)),
    high: Number(high.toFixed(5)),
    low: Number(low.toFixed(5)),
    close: Number(close.toFixed(5)),
    volume
  };
});

export const EXPERT_PROMPTS: Record<ExpertType, string> = {
  [ExpertType.GENERAL]: "Analyze the provided Forex chart image. Identify key support and resistance levels, and overall market direction. Provide a balanced technical analysis.",
  [ExpertType.TREND]: "Act as a Trend Trading Expert. Focus strictly on trend identification (uptrend, downtrend, sideways). Identify Moving Average slopes, higher-highs/lower-lows, and momentum strength. Suggest if the trend is likely to continue.",
  [ExpertType.REVERSAL]: "Act as a Reversal Pattern Expert. Look specifically for potential reversal signals such as Head and Shoulders, Double Tops/Bottoms, Wedges, or Divergences. Be critical and cautious about false breakouts.",
  [ExpertType.RISK]: "Act as a Risk Management Consultant. Analyze the volatility in the chart. Identify where stop-losses should be placed for long/short positions. Highlight areas of high liquidity or potential choppy price action to avoid.",
  [ExpertType.SENTIMENT]: "Act as a Market Sentiment Analyst. Interpret the 'mood' of the chart. Do large candles indicate panic or greed? Combine this visual data with general knowledge of recent forex market behavior.",
  [ExpertType.SCALPER]: "Act as a Scalping Coach. Analyze the chart for short-term trading opportunities suitable for scalping. Focus on immediate price action, tick-level support/resistance, and quick momentum shifts. Advise on tight entry and exit points."
};

export const MOCK_HISTORY: TradeHistoryItem[] = [
  { id: '1', pair: 'EUR/USD', type: 'BUY', entryPrice: 1.0820, exitPrice: 1.0855, profit: 350, status: 'CLOSED', date: '2023-10-25' },
  { id: '2', pair: 'USD/JPY', type: 'SELL', entryPrice: 150.40, exitPrice: 149.80, profit: 420, status: 'CLOSED', date: '2023-10-24' },
  { id: '3', pair: 'GBP/USD', type: 'BUY', entryPrice: 1.2150, exitPrice: 1.2130, profit: -200, status: 'CLOSED', date: '2023-10-23' },
  { id: '4', pair: 'XAU/USD', type: 'BUY', entryPrice: 1980.00, exitPrice: 0, profit: 120, status: 'OPEN', date: '2023-10-26' },
  { id: '5', pair: 'AUD/USD', type: 'SELL', entryPrice: 0.6350, exitPrice: 0.6310, profit: 280, status: 'CLOSED', date: '2023-10-22' },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Price Alert', message: 'EUR/USD crossed 1.0850', type: 'info', timestamp: Date.now() - 1000 * 60 * 5, read: false },
  { id: '2', title: 'Trade Closed', message: 'TP Hit on USD/JPY +42 pips', type: 'success', timestamp: Date.now() - 1000 * 60 * 60 * 2, read: true },
  { id: '3', title: 'High Volatility', message: 'News event caused high volatility on GBP pairs', type: 'warning', timestamp: Date.now() - 1000 * 60 * 60 * 5, read: true },
];

export const MOCK_USER: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@trader.com',
  plan: 'Pro',
  avatar: 'JD',
  winRate: 68,
  totalTrades: 1245,
  profitFactor: 2.1
};