from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import ChartResponse, Candle

router = APIRouter(prefix="/chart", tags=["chart"])

@router.get("/", response_model=ChartResponse)
def get_chart(symbol: str = "EUR/USD", interval: str = "1h"):
    try:
        ts = td.time_series(
            symbol=symbol,
            interval=interval,
            outputsize=200
        ).as_pandas()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data error: {e}")

    if ts is None or ts.empty:
        raise HTTPException(status_code=404, detail="No data from Twelve Data")

    candles = []
    for idx, row in ts.iterrows():
        candles.append(
            Candle(
                time=idx.isoformat(),
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                volume=float(row.get("volume", 0.0)),
            )
        )

    return ChartResponse(symbol=symbol, interval=interval, candles=candles)