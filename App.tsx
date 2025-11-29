import React, { useState, useEffect } from 'react';
import ForexChart from './components/ForexChart';
import AnalysisPanel from './components/AnalysisPanel';
import TradeSignals from './components/TradeSignals';
import RiskCalculator from './components/RiskCalculator';
import MarketScreener from './components/MarketScreener';
import Settings from './components/Settings';
import History from './components/History';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import { fetchMarketData } from './services/marketDataService';
import { generateTradeSignal } from './services/geminiService';
import { enrichDataWithIndicators } from './utils/technicalAnalysis';
import { ChartDataPoint, TradeSignal } from './types';
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Menu,
  Bell,
  Radio,
  BarChart3,
  ShieldCheck,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'screener' | 'history' | 'settings' | 'profile' | 'notifications'
  >('dashboard');
  const [activePair, setActivePair] = useState('EUR/USD');
  const [activeInterval, setActiveInterval] = useState<
    '1' | '5' | '15' | '30' | '60' | 'D'
  >('15');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Full Screen State
  const [isGraphFullScreen, setIsGraphFullScreen] = useState(false);

  // Market Data State
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Signals State
  const [signals, setSignals] = useState<TradeSignal[]>([]);

  // Derived Stats
  const [currentPrice, setCurrentPrice] = useState<string>('---');
  const [priceChange, setPriceChange] = useState<string>('---');
  const [isPositive, setIsPositive] = useState(false);
  const [dayHigh, setDayHigh] = useState<string>('---');
  const [dayLow, setDayLow] = useState<string>('---');

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadMarketData = async () => {
    setIsLoadingData(true);
    const rawData = await fetchMarketData(activePair, activeInterval);
    const enrichedData = enrichDataWithIndicators(rawData);
    setChartData(enrichedData);

    if (enrichedData.length > 0) {
      const lastPoint = enrichedData[enrichedData.length - 1];
      const prevPoint = enrichedData[enrichedData.length - 2] || enrichedData[0];

      setCurrentPrice(lastPoint.close.toFixed(5));

      const diff = lastPoint.close - prevPoint.close;
      const diffPct = (diff / prevPoint.close) * 100;
      setPriceChange(
        `${diff >= 0 ? '+' : ''}${diff.toFixed(5)} (${diffPct.toFixed(2)}%)`
      );
      setIsPositive(diff >= 0);

      const highs = enrichedData.map((d) => d.high);
      const lows = enrichedData.map((d) => d.low);
      setDayHigh(Math.max(...highs).toFixed(5));
      setDayLow(Math.min(...lows).toFixed(5));
    }

    setIsLoadingData(false);
  };

  // Reload data when pair or interval changes
  useEffect(() => {
    loadMarketData();
  }, [activePair, activeInterval]);

  const handleScanRequest = async (imageFile: File | null) => {
    if (isScanning) return;
    setIsScanning(true);
    const newSignal = await generateTradeSignal(imageFile, activePair);
    if (newSignal) {
      setSignals((prev) => [newSignal, ...prev]);
    }
    setIsScanning(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Top Bar - Hidden if full screen */}
      {!isGraphFullScreen && (
        <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="text-trade-accent" size={18} />
                  <span className="font-semibold text-gray-100">FXBeacons</span>
                </div>
                <p className="text-xs text-gray-500">
                  Smart Forex Dashboard · {activePair}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="text-gray-400">Price</span>
                <span
                  className={`font-mono ${
                    isPositive ? 'text-trade-green' : 'text-trade-red'
                  }`}
                >
                  {currentPrice} ({priceChange})
                </span>
              </div>
              <button className="relative text-gray-400 hover:text-white">
                <Bell size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Layout */}
      <div className={`mx-auto px-4 py-4 ${isGraphFullScreen ? 'w-full h-screen p-0' : 'max-w-7xl grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6'}`}>
        
        {/* Sidebar / Navigation - Hidden if full screen */}
        {!isGraphFullScreen && (
          <aside className="bg-gray-950 border border-gray-800 rounded-xl p-4 h-fit md:sticky md:top-20">
            <nav className="space-y-1 text-sm">
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'screener'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('screener')}
              >
                <BarChart3 size={16} />
                Market Screener
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'history'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('history')}
              >
                <HistoryIcon size={16} />
                History
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'settings'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('settings')}
              >
                <SettingsIcon size={16} />
                Settings
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'profile'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('profile')}
              >
                <User size={16} />
                Profile
              </button>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg gap-2 ${
                  currentView === 'notifications'
                    ? 'bg-trade-accent/10 text-trade-accent'
                    : 'text-gray-400 hover:bg-gray-900'
                }`}
                onClick={() => setCurrentView('notifications')}
              >
                <Radio size={16} />
                Notifications
              </button>
            </nav>

            <div className="mt-6 p-3 rounded-lg border border-gray-800 bg-gray-900/60 text-xs text-gray-400 flex items-center gap-2">
              <ShieldCheck className="text-trade-accent" size={16} />
              <span>Data from FXBeacons FastAPI · Twelve Data</span>
            </div>
            {/* Bottom: Risk Engine */}
            {currentView === 'dashboard' && (
              <div className="mt-4">
                <RiskCalculator currentPair={activePair} />
              </div> 
            )}
          </aside>
        )}

        {/* Content */}
        <main className={`space-y-4 ${isGraphFullScreen ? 'h-full w-full' : 'overflow-y-auto'}`}>
          {currentView === 'dashboard' && (
            <div className={`grid gap-6 ${isGraphFullScreen ? 'h-full grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'}`}>
              
              {/* Left: Chart */}
              <div 
                className={`
                  relative transition-all duration-300 ease-in-out
                  ${isGraphFullScreen 
                    ? 'fixed inset-0 z-50 bg-gray-950 p-4' 
                    : 'xl:col-span-2 h-[600px]' // Increased height from 420px to 600px
                  }
                `}
              >
                {/* Full Screen Toggle Button */}
                <button 
                  onClick={() => setIsGraphFullScreen(!isGraphFullScreen)}
                  className="absolute top-6 right-6 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md shadow-lg border border-gray-700 transition-colors"
                  title={isGraphFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isGraphFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>

                <div className="h-full w-full border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
                  <ForexChart
                    data={chartData}
                    theme={theme}
                    symbol={activePair}
                    interval={activeInterval}
                    onIntervalChange={setActiveInterval}
                  />
                </div>
              </div>

              {/* Right: Analysis + Signals + Risk (Hidden when full screen) */}
              {!isGraphFullScreen && (
                <div className="flex flex-col gap-4 h-[600px]"> {/* Height matches the Chart height */}
                  {/* Top: Analysis (AI panel) */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <AnalysisPanel
                      pair={activePair}
                      currentPrice={currentPrice}
                      priceChange={priceChange}
                      isPositive={isPositive}
                      dayHigh={dayHigh}
                      dayLow={dayLow}
                      isAnalyzing={isAnalyzing}
                      setIsAnalyzing={setIsAnalyzing}
                    />
                  </div>

                  {/* Middle: Active Beacons (signals) */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <TradeSignals
                      signals={signals}
                      onScanRequest={handleScanRequest}
                      isScanning={isScanning}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'screener' && (
            <MarketScreener
              onSelectPair={(pair) => {
                setActivePair(pair);
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'history' && <History />}
          {currentView === 'settings' && (
            <Settings theme={theme} setTheme={setTheme} />
          )}
          {currentView === 'profile' && <Profile />}
          {currentView === 'notifications' && <Notifications />}
        </main>
      </div>
    </div>
  );
};

export default App;