from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Query
from ..twelve_client import td
from ..schemas import ScreenerResponse, ScreenerItem, QuoteResponse, PriceResponse, Quote

router = APIRouter(prefix="/screener", tags=["screener"])

EAT = timezone(timedelta(hours=3))  # UTC+3

@router.get("/", response_model=ScreenerResponse)
def screener(base_currency: str = "USD"):
    # Fixed list of Forex pairs
    symbols = [
        "EUR/USD",
        "GBP/USD",
        "USD/JPY",
        "USD/CHF",
        "AUD/USD",
    ]

    now_eat = datetime.now(EAT).isoformat()
    items: list[ScreenerItem] = []

    for symbol in symbols:
        try:
            # Fetch a small daily history with SMA, RSI, ATR
            ts = (
                td.time_series(
                    symbol=symbol,
                    interval="1day",
                    outputsize=50,
                )
                .with_sma(time_period=50)
                .with_rsi(time_period=14)
                .with_atr(time_period=14)
                .as_json()
            )

            # as_json() returns a dict with "values": [...]
            values = ts.get("values", [])
            if not values:
                print(f"Screener: no values for {symbol}")
                continue

            last = values[0]  # most recent bar

            price = float(last["close"])
            sma_50 = float(last.get("sma", price))
            rsi = float(last.get("rsi", 50))
            atr = float(last.get("atr", 0.0))

            # Trend classification
            if price > sma_50 * 1.002:
                trend = "Bullish"
            elif price < sma_50 * 0.998:
                trend = "Bearish"
            else:
                trend = "Neutral"

            # Volatility bands based on ATR as fraction of price
            vol_ratio = atr / price if price else 0.0
            if vol_ratio > 0.015:
                volatility_band = "HIGH"
            elif vol_ratio > 0.007:
                volatility_band = "MEDIUM"
            else:
                volatility_band = "LOW"

            # Signal logic from RSI + trend
            if rsi > 70 and trend == "Bullish":
                signal = "STRONG_BUY"
            elif rsi > 55 and trend == "Bullish":
                signal = "BUY"
            elif rsi < 30 and trend == "Bearish":
                signal = "STRONG_SELL"
            elif rsi < 45 and trend == "Bearish":
                signal = "SELL"
            else:
                signal = "NEUTRAL"

            items.append(
                ScreenerItem(
                    symbol=symbol,
                    price=price,
                    sma_50=sma_50,
                    trend=trend,
                    timestamp=now_eat,
                    rsi=rsi,
                    atr=atr,
                    volatility_band=volatility_band,
                    signal=signal,
                )
            )
        except Exception as e:
            print(f"Screener symbol {symbol} error:", e)
            continue

    return ScreenerResponse(base_currency=base_currency, items=items)

@router.get("/quote", response_model=QuoteResponse)
def get_quote(symbol: str = Query(..., description="Symbol like EUR/USD")):
    try:
        raw = td.quote(symbol=symbol).as_json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data quote error: {e}")

    def to_float(v):
        try:
            return float(v)
        except Exception:
            return None

    quote = Quote(
        symbol=raw.get("symbol"),
        name=raw.get("name"),
        exchange=raw.get("exchange"),
        currency=raw.get("currency"),
        datetime=raw.get("datetime"),
        open=to_float(raw.get("open")),
        high=to_float(raw.get("high")),
        low=to_float(raw.get("low")),
        close=to_float(raw.get("close")),
        volume=to_float(raw.get("volume")),
        previous_close=to_float(raw.get("previous_close")),
        change=to_float(raw.get("change")),
        percent_change=to_float(raw.get("percent_change")),
        is_market_open=raw.get("is_market_open"),
    )

    return QuoteResponse(quote=quote)


@router.get("/price", response_model=PriceResponse)
def get_price(symbol: str = Query(..., description="Symbol like EUR/USD")):
    try:
        raw = td.price(symbol=symbol).as_json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data price error: {e}")

    return PriceResponse(
        symbol=symbol,
        price=float(raw.get("price")),
    )