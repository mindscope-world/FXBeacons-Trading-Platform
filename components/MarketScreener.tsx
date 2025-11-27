import React, { useState, useEffect } from 'react';
import { ScreenerTicker } from '../types';
import { fetchScreenerData } from '../services/marketDataService';
import { generateMarketReport } from '../services/geminiService';
import { ArrowUpRight, ArrowDownRight, Minus, Search, Activity, BarChart2, Zap, FileText, X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarketScreenerProps {
  onSelectPair: (pair: string) => void;
}

const MarketScreener: React.FC<MarketScreenerProps> = ({ onSelectPair }) => {
  const [data, setData] = useState<ScreenerTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ScreenerTicker; direction: 'asc' | 'desc' } | null>(null);

  // Report Modal State
  const [reportTicker, setReportTicker] = useState<ScreenerTicker | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchScreenerData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key: keyof ScreenerTicker) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = data.filter(item => 
    item.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY': return 'text-trade-green bg-green-900/30 border-green-800';
      case 'BUY': return 'text-green-400 bg-green-900/20 border-green-800/50';
      case 'STRONG_SELL': return 'text-trade-red bg-red-900/30 border-red-800';
      case 'SELL': return 'text-red-400 bg-red-900/20 border-red-800/50';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const handleOpenReport = async (e: React.MouseEvent, ticker: ScreenerTicker) => {
    e.stopPropagation(); // Prevent row click navigation
    setReportTicker(ticker);
    setReportLoading(true);
    setReportContent('');
    
    // Generate Report
    const content = await generateMarketReport(ticker);
    setReportContent(content);
    setReportLoading(false);
  };

  const closeReport = () => {
    setReportTicker(null);
    setReportContent('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 p-6 overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-2">
                <BarChart2 className="text-trade-accent" />
                Market Screener
            </h2>
            <p className="text-sm text-gray-400 mt-1">Real-time technical analysis & volatility tracking</p>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input 
                type="text" 
                placeholder="Search Pair..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 focus:border-trade-accent outline-none w-64"
            />
        </div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col shadow-xl">
        {/* Table Header */}
        <div className="grid grid-cols-8 bg-gray-850 p-4 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="cursor-pointer hover:text-white col-span-1" onClick={() => handleSort('symbol')}>Symbol</div>
            <div className="cursor-pointer hover:text-white text-right col-span-1" onClick={() => handleSort('price')}>Price</div>
            <div className="cursor-pointer hover:text-white text-right col-span-1" onClick={() => handleSort('changePercent')}>24h %</div>
            <div className="cursor-pointer hover:text-white text-center col-span-1" onClick={() => handleSort('trend')}>Trend</div>
            <div className="cursor-pointer hover:text-white text-center col-span-1" onClick={() => handleSort('rsi')}>RSI</div>
            <div className="cursor-pointer hover:text-white text-center col-span-1" onClick={() => handleSort('volatility')}>Volatility</div>
            <div className="cursor-pointer hover:text-white text-center col-span-1" onClick={() => handleSort('signal')}>Signal</div>
            <div className="text-center col-span-1">Analysis</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                    <div className="w-5 h-5 border-2 border-trade-accent border-t-transparent rounded-full animate-spin"></div>
                    Loading market data...
                </div>
            ) : (
                sortedData.map((ticker) => (
                    <div 
                        key={ticker.symbol} 
                        onClick={() => onSelectPair(ticker.symbol)}
                        className="grid grid-cols-8 p-4 border-b border-gray-800/50 hover:bg-gray-800 transition-colors items-center text-sm cursor-pointer group"
                    >
                        <div className="font-bold text-gray-200 group-hover:text-trade-accent transition-colors col-span-1">{ticker.symbol}</div>
                        <div className="text-right font-mono text-gray-300 col-span-1">{ticker.price}</div>
                        <div className={`text-right font-mono font-medium col-span-1 ${ticker.changePercent >= 0 ? 'text-trade-green' : 'text-trade-red'}`}>
                            {ticker.changePercent > 0 ? '+' : ''}{ticker.changePercent}%
                        </div>
                        <div className="flex justify-center col-span-1">
                            {ticker.trend === 'UP' && <ArrowUpRight className="text-trade-green" size={18} />}
                            {ticker.trend === 'DOWN' && <ArrowDownRight className="text-trade-red" size={18} />}
                            {ticker.trend === 'SIDEWAYS' && <Minus className="text-gray-500" size={18} />}
                        </div>
                        <div className="text-center font-mono text-gray-400 col-span-1">{ticker.rsi}</div>
                        <div className="flex justify-center col-span-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 border ${
                                ticker.volatility === 'HIGH' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                                ticker.volatility === 'MEDIUM' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                                'text-blue-400 border-blue-400/30 bg-blue-400/10'
                            }`}>
                                <Zap size={10} /> {ticker.volatility}
                            </span>
                        </div>
                        <div className="flex justify-center col-span-1">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getSignalColor(ticker.signal)}`}>
                                {ticker.signal.replace('_', ' ')}
                            </span>
                        </div>
                         <div className="flex justify-center col-span-1">
                            <button 
                                onClick={(e) => handleOpenReport(e, ticker)}
                                className="p-1.5 rounded hover:bg-gray-700 text-trade-accent hover:text-white transition-colors"
                                title="View AI Report"
                            >
                                <FileText size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Report Modal */}
      {reportTicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-gray-900 w-full max-w-2xl rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                      <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-100">{reportTicker.symbol} Report</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSignalColor(reportTicker.signal)}`}>
                              {reportTicker.signal.replace('_', ' ')}
                          </span>
                      </div>
                      <button onClick={closeReport} className="text-gray-400 hover:text-white transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 text-gray-300">
                      {reportLoading ? (
                          <div className="flex flex-col items-center justify-center h-64 gap-4">
                              <div className="w-8 h-8 border-4 border-trade-accent border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-sm text-gray-400 animate-pulse">Consulting AI Analyst...</p>
                          </div>
                      ) : (
                          <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>{reportContent}</ReactMarkdown>
                          </div>
                      )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end gap-3">
                      <button 
                        onClick={closeReport}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                      >
                          Close
                      </button>
                      <button 
                        onClick={() => {
                            onSelectPair(reportTicker.symbol);
                            closeReport();
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-trade-accent text-white hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                          <ExternalLink size={16} />
                          Open Chart
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MarketScreener;
