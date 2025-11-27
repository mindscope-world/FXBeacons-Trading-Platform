from fastapi import APIRouter, HTTPException
from ..twelve_client import td
from ..schemas import RiskRequest, RiskResponse

router = APIRouter(prefix="/risk", tags=["risk"])

@router.post("/", response_model=RiskResponse)
def calc_risk(req: RiskRequest):
    risk_amount = req.account_balance * (req.risk_percent / 100.0)

    base, quote = req.pair.split("/")
    standard_lot_units = 100000
    pip_decimal = 0.0001 if "JPY" not in req.pair else 0.01

    exchange_rate = 1.0
    if req.account_currency != quote:
        conversion_symbol = f"{quote}/{req.account_currency}"
        try:
            rate_data = td.exchange_rate(symbol=conversion_symbol).as_json()
            exchange_rate = float(rate_data["rate"])
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Exchange rate error: {e}")

    pip_value_per_lot = (standard_lot_units * pip_decimal) * exchange_rate
    position_size_lots = risk_amount / (req.stop_loss_pips * pip_value_per_lot)

    return RiskResponse(
        risk_amount=round(risk_amount, 2),
        suggested_lots=round(position_size_lots, 2),
        pip_value_per_lot=round(pip_value_per_lot, 2),
    )