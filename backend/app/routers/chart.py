from fastapi import APIRouter, HTTPException, Query
from ..twelve_client import td
from ..schemas import ChartResponse, Candle

router = APIRouter(prefix="/chart", tags=["chart"])

VALID_INTERVALS = {"1min", "5min", "15min", "30min", "1h", "1day"}

@router.get("/", response_model=ChartResponse)
def get_chart(
    symbol: str = Query("EUR/USD"),
    interval: str = Query("15min")
):
    if interval not in VALID_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval '{interval}'")

    try:
        ts = td.time_series(
            symbol=symbol,
            interval=interval,
            outputsize=200,
        ).as_pandas()
    except Exception as e:
        print("Twelve Data chart error:", e)
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