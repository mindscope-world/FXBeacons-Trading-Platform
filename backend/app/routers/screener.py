from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import ScreenerResponse, ScreenerItem

router = APIRouter(prefix="/screener", tags=["screener"])

EAT = timezone(timedelta(hours=3))  # UTC+3

@router.get("/", response_model=ScreenerResponse)
def screener(base_currency: str = "USD"):
    # 1. Get list of pairs
    try:
        pairs = td.forex_pairs(currency_base=base_currency).as_json()["data"][:5]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data error: {e}")

    symbols = [item["symbol"] for item in pairs]

    # 2. Fetch daily time series with SMA 50, RSI, ATR in batch
    try:
        ts_batch = (
            td.time_series(
                symbol=symbols,
                interval="1day",
                outputsize=50,     # enough history for ATR/RSI
            )
            .with_sma(time_period=50)
            .with_rsi(time_period=14)
            .with_atr(time_period=14)
            .as_pandas()
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data batch error: {e}")

    now_eat = datetime.now(EAT).isoformat()
    items: list[ScreenerItem] = []

    for symbol in symbols:
        try:
            data = ts_batch.xs(symbol, level=0, axis=1)

            # last row is current
            last = data.iloc[-1]

            price = float(last["close"])
            sma_50 = float(last["sma"])
            rsi = float(last["rsi"])
            atr = float(last["atr"])

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
        except Exception:
            continue

    return ScreenerResponse(base_currency=base_currency, items=items)