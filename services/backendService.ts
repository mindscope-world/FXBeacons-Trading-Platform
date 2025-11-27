import { API_BASE_URL } from '../config';

export async function getMarketAnalysis(symbol: string, interval: string) {
  const res = await fetch(`${API_BASE_URL}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, interval }),
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function calculateRisk(payload: {
  account_balance: number;
  risk_percent: number;
  stop_loss_pips: number;
  pair: string;
  account_currency: string;
}) {
  const res = await fetch(`${API_BASE_URL}/risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Risk calc failed');
  return res.json();
}

export async function getTradeSignal(symbol: string) {
  const res = await fetch(`${API_BASE_URL}/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  });
  if (!res.ok) throw new Error('Signals failed');
  return res.json();
}