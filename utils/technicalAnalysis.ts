import { ChartDataPoint } from '../types';

export const calculateSMA = (data: ChartDataPoint[], period: number): number[] => {
  const smaValues: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smaValues.push(NaN); // Not enough data
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
    smaValues.push(sum / period);
  }
  return smaValues;
};

export const calculateBollingerBands = (data: ChartDataPoint[], period: number = 20, multiplier: number = 2) => {
  const sma = calculateSMA(data, period);
  const bands = data.map((point, i) => {
    if (i < period - 1) return { upper: NaN, lower: NaN };
    
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const squaredDiffs = slice.map(p => Math.pow(p.close - mean, 2));
    const variance = squaredDiffs.reduce((acc, curr) => acc + curr, 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: mean + (stdDev * multiplier),
      lower: mean - (stdDev * multiplier)
    };
  });
  return bands;
};

export const calculateRSI = (data: ChartDataPoint[], period: number = 14): number[] => {
  const rsiValues: number[] = [];
  let gains = 0;
  let losses = 0;

  // First RSI calculation
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < data.length; i++) {
    if (i <= period) {
      rsiValues.push(NaN);
      continue;
    }

    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }

    const rs = avgGain / avgLoss;
    rsiValues.push(100 - (100 / (1 + rs)));
  }
  return rsiValues;
};

export const enrichDataWithIndicators = (data: ChartDataPoint[]): ChartDataPoint[] => {
  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);
  const bands = calculateBollingerBands(data, 20, 2);
  const rsi = calculateRSI(data, 14);

  return data.map((point, i) => ({
    ...point,
    sma20: sma20[i] || undefined,
    sma50: sma50[i] || undefined,
    upperBand: bands[i].upper || undefined,
    lowerBand: bands[i].lower || undefined,
    rsi: rsi[i] || undefined
  }));
};
