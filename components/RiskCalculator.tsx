import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, Crosshair } from 'lucide-react';

const RiskCalculator: React.FC = () => {
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [pair, setPair] = useState<string>('EUR/USD');
  
  // Results
  const [lotSize, setLotSize] = useState<string>('0.00');
  const [riskAmount, setRiskAmount] = useState<string>('0.00');

  useEffect(() => {
    // Basic calculation: Risk Amount = Balance * (Percent / 100)
    // Lot Size (Standard) = Risk Amount / (Stop Loss * Pip Value)
    // Assuming 1 standard lot pip value for EUR/USD is approx $10
    const riskAmt = accountBalance * (riskPercent / 100);
    const pipValueStandardLot = 10; 
    const calculatedLots = riskAmt / (stopLossPips * pipValueStandardLot);

    setRiskAmount(riskAmt.toFixed(2));
    setLotSize(calculatedLots.toFixed(2));
  }, [accountBalance, riskPercent, stopLossPips]);

  return (
    <div className="bg-gray-850 p-4 rounded-lg border border-gray-700 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-trade-accent" size={20} />
        <h3 className="text-gray-200 font-medium">Risk Engine</h3>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Account Balance ($)</label>
          <input 
            type="number" 
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-200 text-sm focus:border-trade-accent outline-none"
          />
        </div>

        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Risk (%)</label>
                <input 
                    type="number" 
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-200 text-sm focus:border-trade-accent outline-none"
                />
            </div>
            <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">SL (Pips)</label>
                <input 
                    type="number" 
                    value={stopLossPips}
                    onChange={(e) => setStopLossPips(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-200 text-sm focus:border-trade-accent outline-none"
                />
            </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Risk Amount:</span>
                <span className="text-sm text-red-400 font-mono">-${riskAmount}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Position Size:</span>
                <span className="text-lg text-trade-green font-bold font-mono">{lotSize} Lots</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
