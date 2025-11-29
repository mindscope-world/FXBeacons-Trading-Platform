from pydantic import BaseModel
from typing import List, Optional


class Candle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class ChartResponse(BaseModel):
    symbol: str
    interval: str
    candles: List[Candle]


class AnalysisRequest(BaseModel):
    symbol: str = "GBP/USD"
    interval: str = "4h"


class AnalysisResponse(BaseModel):
    symbol: str
    interval: str
    sentiment: str
    trend_strength: str
    rsi: float
    adx: float
    macd_hist: float
    text: str


class RiskRequest(BaseModel):
    account_balance: float
    risk_percent: float
    stop_loss_pips: float
    pair: str = "EUR/USD"
    account_currency: str = "USD"


class RiskResponse(BaseModel):
    risk_amount: float
    suggested_lots: float
    pip_value_per_lot: float


class Quote(BaseModel):
    symbol: str
    name: str | None = None
    exchange: str | None = None
    currency: str | None = None
    datetime: str | None = None
    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None
    volume: float | None = None
    previous_close: float | None = None
    change: float | None = None
    percent_change: float | None = None
    is_market_open: bool | None = None


class QuoteResponse(BaseModel):
    quote: Quote


class PriceResponse(BaseModel):
    symbol: str
    price: float


class ScreenerItem(BaseModel):
    symbol: str
    price: float
    sma_50: float
    trend: str
    timestamp: str  # ISO string in EAT (+3)


class ScreenerResponse(BaseModel):
    base_currency: str
    items: List[ScreenerItem]


class SignalRequest(BaseModel):
    symbol: str = "EUR/USD"


class Signal(BaseModel):
    symbol: str
    type: str
    action: str
    timestamp: str


class SignalResponse(BaseModel):
    signal: Optional[Signal]