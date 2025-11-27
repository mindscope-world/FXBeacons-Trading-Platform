import { ChartDataPoint, ScreenerTicker } from '../types';
import { API_BASE_URL } from '../config';

export const fetchMarketData = async (
  symbol: string = 'EUR/USD',
  interval: '1' | '5' | '15' | '30' | '60' | 'D' = '15'
): Promise<ChartDataPoint[]> => {
  const map: Record<string, string> = {
    '1': '1min',
    '5': '5min',
    '15': '15min',
    '30': '30min',
    '60': '1h',
    D: '1day',
  };
  const intervalStr = map[interval];

  const url = `${API_BASE_URL}/chart?symbol=${encodeURIComponent(
    symbol
  )}&interval=${encodeURIComponent(intervalStr)}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error('Backend chart error', res.status);
    return [];
  }

  const data = await res.json();
  return (data.candles || []).map((c: any) => {
    const dt = new Date(c.time);
    const time = `${dt.getHours().toString().padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    return {
      time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    } as ChartDataPoint;
  });
};

// For screener, call /screener and adapt to ScreenerTicker[] as needed
export const fetchScreenerData = async (): Promise<ScreenerTicker[]> => {
  const res = await fetch(`${API_BASE_URL}/screener`);
  if (!res.ok) {
    console.error('Backend screener error', res.status);
    return [];
  }
  const data = await res.json();
  return data.items.map((item: any) => ({
    symbol: item.symbol,
    price: item.price,
    change: 0,
    changePercent: 0,
    high: item.price,
    low: item.price,
    volume: 0,
    rsi: 50,
    trend: item.trend === 'Bullish' ? 'UP' : item.trend === 'Bearish' ? 'DOWN' : 'SIDEWAYS',
    signal: 'NEUTRAL',
    volatility: 'MEDIUM',
    timestamp: item.timestamp, // EAT (+3) from backend
  }));
};