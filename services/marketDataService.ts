import { ChartDataPoint, ScreenerTicker } from '../types';
import { MOCK_CHART_DATA, SCREENER_SYMBOLS } from '../constants';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string;

const FX_SYMBOL_MAP: Record<string, string> = {
  'EUR/USD': 'OANDA:EUR_USD',
  'GBP/USD': 'OANDA:GBP_USD',
  'USD/JPY': 'OANDA:USD_JPY',
  'XAU/USD': 'OANDA:XAU_USD',
  // Add any others you use in your app
};

function toFinnhubSymbol(symbol: string): string {
  if (FX_SYMBOL_MAP[symbol]) return FX_SYMBOL_MAP[symbol];
  const [base, quote] = symbol.split('/');
  return `OANDA:${base}_${quote}`;
}

// interval: Finnhub resolution: '1','5','15','30','60','D'
export const fetchMarketData = async (
  symbol: string = 'EUR/USD',
  interval: '1' | '5' | '15' | '30' | '60' | 'D' = '15'
): Promise<ChartDataPoint[]> => {
  try {
    if (!FINNHUB_API_KEY) {
      console.error('Missing VITE_FINNHUB_API_KEY in env.');
      return MOCK_CHART_DATA;
    }

    const finnhubSymbol = toFinnhubSymbol(symbol);
    const resolution = interval;

    const now = Math.floor(Date.now() / 1000);
    // last 24h for intraday; tweak as desired
    const from = now - 60 * 60 * 24;

    const url = new URL('https://finnhub.io/api/v1/forex/candle');
    url.searchParams.set('symbol', finnhubSymbol);
    url.searchParams.set('resolution', resolution);
    url.searchParams.set('from', String(from));
    url.searchParams.set('to', String(now));
    url.searchParams.set('token', FINNHUB_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Finnhub request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Expected shape: { c:[], o:[], h:[], l:[], v:[], t:[], s:'ok'|'no_data' }
    if (data.s !== 'ok' || !Array.isArray(data.t)) {
      console.warn('No Finnhub candle data; using fallback mock data.');
      return MOCK_CHART_DATA;
    }

    const transformed: ChartDataPoint[] = data.t.map((ts: number, idx: number) => {
      const date = new Date(ts * 1000);
      const time = `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      return {
        time,
        open: data.o[idx],
        high: data.h[idx],
        low: data.l[idx],
        close: data.c[idx],
        volume: data.v ? data.v[idx] : 0,
      };
    });

    return transformed.length > 0 ? transformed : MOCK_CHART_DATA;
  } catch (error) {
    console.error('Failed to fetch Finnhub market data (using fallback):', error);
    return MOCK_CHART_DATA;
  }
};

// interval: Finnhub resolution: '1','5','15','30','60','D'
export const fetchScreenerData = async (): Promise<ScreenerTicker[]> => {
  // Simulating live market scan for multiple pairs.
  // In a production app, this would use a batch API endpoint or WebSocket.
  return new Promise((resolve) => {
    setTimeout(() => {
      const data: ScreenerTicker[] = SCREENER_SYMBOLS.map(symbol => {
        const basePrice = symbol.includes('JPY')
          ? 145.0
          : symbol.includes('BTC')
          ? 65000
          : symbol.includes('XAU')
          ? 2300
          : 1.08;
        const variance = symbol.includes('BTC')
          ? 1000
          : symbol.includes('JPY')
          ? 0.5
          : 0.005;

        const changePercent = Math.random() * 2 - 1; // -1% to +1%
        const price = basePrice + Math.random() * variance;
        const change = price * (changePercent / 100);

        const rsi = 30 + Math.random() * 40; // 30-70
        let signal: ScreenerTicker['signal'] = 'NEUTRAL';
        if (rsi > 65) signal = 'STRONG_BUY';
        else if (rsi > 55) signal = 'BUY';
        else if (rsi < 35) signal = 'STRONG_SELL';
        else if (rsi < 45) signal = 'SELL';

        const volatilityVal = Math.random();
        const volatility: ScreenerTicker['volatility'] =
          volatilityVal > 0.8 ? 'HIGH' : volatilityVal > 0.4 ? 'MEDIUM' : 'LOW';

        const trend: ScreenerTicker['trend'] =
          changePercent > 0 ? 'UP' : changePercent < -0.2 ? 'DOWN' : 'SIDEWAYS';

        return {
          symbol,
          price: Number(
            price.toFixed(
              symbol.includes('JPY') || symbol.includes('XAU')
                ? 2
                : symbol.includes('BTC')
                ? 0
                : 5,
            ),
          ),
          change: Number(change.toFixed(5)),
          changePercent: Number(changePercent.toFixed(2)),
          high: Number((price * 1.002).toFixed(5)),
          low: Number((price * 0.998).toFixed(5)),
          volume: Math.floor(Math.random() * 100000),
          rsi: Math.floor(rsi),
          trend,
          signal,
          volatility,
        };
      });
      resolve(data);
    }, 600); // Simulate network delay
  });
};