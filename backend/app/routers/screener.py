from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import ScreenerResponse, ScreenerItem

router = APIRouter(prefix="/screener", tags=["screener"])

EAT = timezone(timedelta(hours=3))  # UTC+3

@router.get("/", response_model=ScreenerResponse)
def screener(base_currency: str = "USD"):
    try:
        pairs = td.forex_pairs(currency_base=base_currency).as_json()["data"][:5]
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data error: {e}")

    symbols = [item["symbol"] for item in pairs]

    try:
        sma_batch = td.time_series(
            symbol=symbols,
            interval="1day",
            outputsize=1
        ).with_sma(time_period=50).as_pandas()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data batch error: {e}")

    now_eat = datetime.now(EAT).isoformat()
    items: list[ScreenerItem] = []
    for symbol in symbols:
        try:
            data = sma_batch.xs(symbol, level=0, axis=1)
            current_close = float(data["close"].iloc[0])
            sma_50 = float(data["sma"].iloc[0])

            if current_close > sma_50:
                trend = "Bullish"
            elif current_close < sma_50:
                trend = "Bearish"
            else:
                trend = "Neutral"

            items.append(
                ScreenerItem(
                    symbol=symbol,
                    price=current_close,
                    sma_50=sma_50,
                    trend=trend,
                    timestamp=now_eat,
                )
            )
        except Exception:
            continue

    return ScreenerResponse(base_currency=base_currency, items=items)