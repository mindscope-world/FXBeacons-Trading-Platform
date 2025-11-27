from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import AnalysisRequest, AnalysisResponse

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/", response_model=AnalysisResponse)
def analyze(req: AnalysisRequest):
    symbol = req.symbol
    interval = req.interval
    try:
        rsi = td.rsi(symbol=symbol, interval=interval, time_period=14).as_json()
        adx = td.adx(symbol=symbol, interval=interval, time_period=14).as_json()
        macd = td.macd(symbol=symbol, interval=interval).as_json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Twelve Data error: {e}")

    try:
        rsi_val = float(rsi["values"][0]["rsi"])
        adx_val = float(adx["values"][0]["adx"])
        macd_hist = float(macd["values"][0]["macd_hist"])
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected indicator format")

    sentiment = "NEUTRAL"
    signal_strength = 0.0

    if rsi_val > 70:
        signal_strength -= 3
    elif rsi_val < 30:
        signal_strength += 3

    if macd_hist > 0:
        signal_strength += 2
    else:
        signal_strength -= 2

    trend_strength = "Weak"
    if adx_val > 25:
        trend_strength = "Strong"
        signal_strength *= 1.5

    if signal_strength >= 3:
        sentiment = "BULLISH"
    elif signal_strength <= -3:
        sentiment = "BEARISH"

    text = (
        f"Market Analysis for {symbol} ({interval}):\n"
        f"Sentiment: {sentiment}\n"
        f"Trend Strength: {trend_strength} (ADX: {adx_val:.2f})\n"
        f"RSI is at {rsi_val:.2f}, indicating market is "
        f"{'Overbought' if rsi_val > 70 else 'Oversold' if rsi_val < 30 else 'Neutral'}.\n"
        f"MACD Histogram is {'Positive' if macd_hist > 0 else 'Negative'}, "
        f"suggesting {'Upward' if macd_hist > 0 else 'Downward'} momentum."
    )

    return AnalysisResponse(
        symbol=symbol,
        interval=interval,
        sentiment=sentiment,
        trend_strength=trend_strength,
        rsi=rsi_val,
        adx=adx_val,
        macd_hist=macd_hist,
        text=text,
    )