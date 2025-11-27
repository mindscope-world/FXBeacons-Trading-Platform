from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import chart, analysis, risk, screener, signals

app = FastAPI(title="FXBeacons API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chart.router)
app.include_router(analysis.router)
app.include_router(risk.router)
app.include_router(screener.router)
app.include_router(signals.router)