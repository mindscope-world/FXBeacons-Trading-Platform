import React from 'react';
import { TradeSignal } from '../types';
import { AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Target, Shield } from 'lucide-react';

interface TradeSignalsProps {
  signals: TradeSignal[];
  onScan: () => void;
  isScanning: boolean;
}

const TradeSignals: React.FC<TradeSignalsProps> = ({ signals, onScan, isScanning }) => {
  return (
    <div className="flex flex-col h-full bg-gray-850 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
        <h3 className="text-gray-200 font-medium flex items-center gap-2">
          <Target className="text-red-500" size={18} />
          Active Beacons
        </h3>
        <button 
          onClick={onScan}
          disabled={isScanning}
          className={`px-3 py-1 text-xs rounded font-medium transition-all ${
            isScanning 
            ? 'bg-gray-700 text-gray-400' 
            : 'bg-trade-accent hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Scan Market'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {signals.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm flex flex-col items-center">
            <AlertCircle className="mb-2 opacity-50" size={24} />
            <p>No active signals.</p>
            <p className="text-xs mt-1">Click scan to generate ideas.</p>
          </div>
        ) : (
          signals.map((signal, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-3 border border-gray-700 shadow-sm hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-200">{signal.pair}</span>
                    <span className="text-[10px] bg-gray-700 px-1.5 rounded text-gray-400">{signal.timeframe}</span>
                  </div>
                  <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                    signal.action === 'BUY' ? 'text-trade-green' : 
                    signal.action === 'SELL' ? 'text-trade-red' : 'text-gray-400'
                  }`}>
                    {signal.action === 'BUY' && <ArrowUpRight size={14} />}
                    {signal.action === 'SELL' && <ArrowDownRight size={14} />}
                    {signal.action} @ {signal.entry}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Confidence</div>
                  <div className={`font-mono font-bold ${
                    signal.confidence > 80 ? 'text-trade-green' : 'text-yellow-500'
                  }`}>
                    {signal.confidence}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Shield size={12} className="text-trade-red" />
                  SL: <span className="text-gray-300 font-mono">{signal.stopLoss}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Target size={12} className="text-trade-green" />
                  TP: <span className="text-gray-300 font-mono">{signal.takeProfit}</span>
                </div>
              </div>
              
              <p className="mt-2 text-[10px] text-gray-500 leading-tight border-l-2 border-gray-600 pl-2">
                {signal.reasoning.substring(0, 100)}...
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeSignals;
