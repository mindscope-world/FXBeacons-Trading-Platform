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
import { LayoutDashboard, Settings as SettingsIcon, History as HistoryIcon, Menu, Bell, RefreshCw, Radio, BarChart3, ShieldCheck, User } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'screener' | 'history' | 'settings' | 'profile' | 'notifications'>('dashboard');
  const [activePair, setActivePair] = useState('EUR/USD');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
  // Use activePair for fetching data
  const rawData = await fetchMarketData(activePair, '15'); // 15-minute candles
  // Add SMA, RSI, Bollinger Bands locally
  const enrichedData = enrichDataWithIndicators(rawData);
  setChartData(enrichedData);

  if (enrichedData.length > 0) {
    const lastPoint = enrichedData[enrichedData.length - 1];
    const prevPoint = enrichedData[enrichedData.length - 2] || enrichedData[0];
    // ... rest of the function
  }

  setIsLoadingData(false);
};

  const handleScanRequest = async (imageFile: File | null) => {
    if (isScanning) return;
    setIsScanning(true);
    const newSignal = await generateTradeSignal(imageFile, activePair);
    if (newSignal) {
        setSignals(prev => [newSignal, ...prev]);
    }
    setIsScanning(false);
  };

  const handlePairSelect = (pair: string) => {
    setActivePair(pair);
    setCurrentView('dashboard');
  };

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 300000); 
    return () => clearInterval(interval);
  }, [activePair]); // Reload when activePair changes

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200 font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-16 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-colors duration-300">
        <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-gray-200 dark:border-gray-800 h-16">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                <Radio size={18} />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">FXBeacons</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide">MARKET GUIDANCE</span>
            </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 px-3">
          <NavItem 
            icon={<LayoutDashboard size={20}/>} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem 
            icon={<BarChart3 size={20}/>} 
            label="Market Screener" 
            active={currentView === 'screener'} 
            onClick={() => setCurrentView('screener')}
          />
          <NavItem 
            icon={<HistoryIcon size={20}/>} 
            label="History" 
            active={currentView === 'history'} 
            onClick={() => setCurrentView('history')}
          />
          <NavItem 
            icon={<SettingsIcon size={20}/>} 
            label="Settings" 
            active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')}
          />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 hidden lg:block border border-gray-200 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-2 uppercase tracking-wider">System Status</p>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${isAnalyzing || isScanning ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">{isAnalyzing || isScanning ? 'PROCESSING' : 'ONLINE'}</span>
            </div>
            <div className="text-[10px] text-gray-500">v2.5 Flash Model Active</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 z-20 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-medium text-gray-900 dark:text-gray-200 hidden sm:block">{activePair}</h1>
              {currentView === 'dashboard' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{currentPrice}</span>
                  <span className={`text-sm font-mono ${isPositive ? 'text-green-600 dark:text-trade-green' : 'text-red-600 dark:text-trade-red'}`}>{priceChange}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={loadMarketData} 
                className={`text-gray-500 dark:text-gray-400 hover:text-trade-accent transition-colors ${isLoadingData ? 'animate-spin' : ''}`}
                title="Refresh Data"
              >
                  <RefreshCw size={18} />
            </button>
             <button 
                onClick={() => setCurrentView('notifications')}
                className={`relative transition-colors ${currentView === 'notifications' ? 'text-trade-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
             >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <button 
                onClick={() => setCurrentView('profile')}
                className={`w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium transition-colors ${currentView === 'profile' ? 'bg-trade-accent text-white border-trade-accent' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-trade-accent'}`}
             >
                JD
             </button>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <div className="flex-1 overflow-hidden relative">
            {currentView === 'screener' ? (
                <MarketScreener onSelectPair={handlePairSelect} />
            ) : currentView === 'history' ? (
                <History />
            ) : currentView === 'settings' ? (
                <Settings theme={theme} setTheme={setTheme} />
            ) : currentView === 'profile' ? (
                <Profile />
            ) : currentView === 'notifications' ? (
                <Notifications />
            ) : (
                <div className="flex-1 p-3 lg:p-4 overflow-y-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                        
                        {/* Left Column: Chart & Risk */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            {/* Main Chart */}
                            <div className="flex-1 min-h-[400px] bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col relative group transition-colors duration-300">
                                <ForexChart data={chartData} theme={theme} />
                            </div>
                            
                            {/* Bottom Tools */}
                            <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <RiskCalculator />
                                {/* Info / Sentiment Placeholder */}
                                <div className="bg-white dark:bg-gray-850 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                    <h3 className="text-gray-900 dark:text-gray-200 font-medium mb-3 flex items-center gap-2">
                                        <ShieldCheck className="text-trade-accent" size={18} />
                                        Why FXBeacons?
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Our <strong>Visual LLM Engine</strong> analyzes chart patterns just like a pro trader. 
                                        We combine standard indicators (RSI, Bollinger) with visual pattern recognition 
                                        (Head & Shoulders, Wedges) to provide a complete "Beacon" for your trading journey.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: AI & Signals */}
                        <div className="lg:col-span-4 flex flex-col gap-4 min-h-[600px]">
                            {/* Signals Panel */}
                            <div className="h-1/3 min-h-[200px]">
                                <TradeSignals 
                                    signals={signals} 
                                    onScan={() => handleScanRequest(null)} 
                                    isScanning={isScanning} 
                                />
                            </div>
                            
                            {/* AI Chat */}
                            <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg flex flex-col transition-colors duration-300">
                                <AnalysisPanel 
                                    onAnalyzeStart={() => setIsAnalyzing(true)}
                                    onAnalyzeEnd={() => setIsAnalyzing(false)}
                                    onScanRequest={handleScanRequest}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner App.tsx
const NavItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
      active 
      ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600/20' 
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
  }`}>
    <span className={active ? 'text-trade-accent' : ''}>{icon}</span>
    <span className="hidden lg:block font-medium text-sm">{label}</span>
  </button>
);

export default App;