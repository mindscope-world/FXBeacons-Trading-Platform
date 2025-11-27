from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import SignalRequest, SignalResponse, Signal

router = APIRouter(prefix="/signals", tags=["signals"])

@router.post("/", response_model=SignalResponse)
def golden_cross(req: SignalRequest):
    try:
        ma_batch = td.time_series(
            symbol=req.symbol,
            interval="1day",
            outputsize=2
        ).with_sma(time_period=50).with_sma(time_period=200).as_json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data error: {e}")

    try:
        values = ma_batch[0]["values"]
        today = values[0]
        yesterday = values[1]

        sma_50_today = float(today["sma1"])
        sma_200_today = float(today["sma2"])
        sma_50_prev = float(yesterday["sma1"])
        sma_200_prev = float(yesterday["sma2"])
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected SMA format")

    signal = None

    if sma_50_today > sma_200_today and sma_50_prev < sma_200_prev:
        signal = Signal(
            symbol=req.symbol,
            type="GOLDEN CROSS",
            action="BUY",
            timestamp=today["datetime"],
        )
    elif sma_50_today < sma_200_today and sma_50_prev > sma_200_prev:
        signal = Signal(
            symbol=req.symbol,
            type="DEATH CROSS",
            action="SELL",
            timestamp=today["datetime"],
        )

    return SignalResponse(signal=signal)