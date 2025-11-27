import { ChartDataPoint, ScreenerTicker } from '../types';
import { SERP_API_KEY, MOCK_CHART_DATA, SCREENER_SYMBOLS } from '../constants';

export const fetchMarketData = async (symbol: string = 'EUR/USD', interval: string = '1D'): Promise<ChartDataPoint[]> => {
  try {
    // Google Finance typically uses dash for pairs like "EUR-USD" or "GOOGL:NASDAQ"
    // For this app we assume input is "EUR/USD" so we convert to "EUR-USD"
    const query = symbol.replace('/', '-');
    
    // Construct SerpApi URL for Google Finance
    // window=1D gives us intraday data points
    const url = `https://serpapi.com/search.json?engine=google_finance&q=${query}&window=1D&api_key=${SERP_API_KEY}`;
    
    // Note: Calling SerpApi directly from browser might be blocked by CORS depending on the key's permissions.
    // If blocked, the catch block will trigger and return fallback data.
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if graph data exists in the response
    if (!data.graph || !Array.isArray(data.graph)) {
        console.warn('No graph data found in SerpApi response. Using fallback data.');
        return MOCK_CHART_DATA;
    }

    // Transform Google Finance Graph data (Date + Price) to ChartDataPoint (OHLC)
    // Since we only get a single price point for the line chart, we map O=H=L=C=Price
    const transformedData: ChartDataPoint[] = data.graph.map((point: any) => {
        const dateObj = new Date(point.date);
        const time = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        const price = point.price;

        return {
            time,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0 // Volume is not always provided in the graph summary
        };
    });

    return transformedData.length > 0 ? transformedData : MOCK_CHART_DATA;

  } catch (error) {
    console.error("Failed to fetch market data (using fallback):", error);
    // Return mock data so the app remains functional even if API quota is hit or CORS blocks it
    return MOCK_CHART_DATA;
  }
};

export const fetchScreenerData = async (): Promise<ScreenerTicker[]> => {
  // Simulating live market scan for multiple pairs. 
  // In a production app, this would use a batch API endpoint or WebSocket.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const data: ScreenerTicker[] = SCREENER_SYMBOLS.map(symbol => {
        // Generate pseudo-random realistic data
        const basePrice = symbol.includes('JPY') ? 145.00 : (symbol.includes('BTC') ? 65000 : (symbol.includes('XAU') ? 2300 : 1.0800));
        const variance = symbol.includes('BTC') ? 1000 : (symbol.includes('JPY') ? 0.5 : 0.0050);
        
        const changePercent = (Math.random() * 2 - 1); // -1% to +1%
        const price = basePrice + (Math.random() * variance);
        const change = price * (changePercent / 100);
        
        // Random Technicals
        const rsi = 30 + Math.random() * 40; // 30-70
        let signal: ScreenerTicker['signal'] = 'NEUTRAL';
        if (rsi > 65) signal = 'STRONG_BUY';
        else if (rsi > 55) signal = 'BUY';
        else if (rsi < 35) signal = 'STRONG_SELL';
        else if (rsi < 45) signal = 'SELL';

        const volatilityVal = Math.random();
        const volatility: ScreenerTicker['volatility'] = volatilityVal > 0.8 ? 'HIGH' : (volatilityVal > 0.4 ? 'MEDIUM' : 'LOW');

        // Explicitly define trend to match the ScreenerTicker interface type
        const trend: ScreenerTicker['trend'] = changePercent > 0 ? 'UP' : (changePercent < -0.2 ? 'DOWN' : 'SIDEWAYS');

        return {
          symbol,
          price: Number(price.toFixed(symbol.includes('JPY') || symbol.includes('XAU') ? 2 : (symbol.includes('BTC') ? 0 : 5))),
          change: Number(change.toFixed(5)),
          changePercent: Number(changePercent.toFixed(2)),
          high: Number((price * 1.002).toFixed(5)),
          low: Number((price * 0.998).toFixed(5)),
          volume: Math.floor(Math.random() * 100000),
          rsi: Math.floor(rsi),
          trend,
          signal,
          volatility
        };
      });
      resolve(data);
    }, 600); // Simulate network delay
  });
};