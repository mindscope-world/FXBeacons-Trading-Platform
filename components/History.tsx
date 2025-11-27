import React from 'react';
import { MOCK_HISTORY } from '../constants';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, Timer } from 'lucide-react';

const History: React.FC = () => {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2">
          <Clock className="text-trade-accent" />
          Trade History
      </h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Pair</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Entry</th>
                <th className="px-6 py-3 text-right">Exit</th>
                <th className="px-6 py-3 text-right">Profit/Loss</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-200">
                    {item.pair}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-medium ${item.type === 'BUY' ? 'text-green-600 dark:text-trade-green' : 'text-red-600 dark:text-trade-red'}`}>
                       {item.type === 'BUY' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                       {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                    {item.entryPrice.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                    {item.exitPrice > 0 ? item.exitPrice.toFixed(4) : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${item.profit > 0 ? 'text-green-600 dark:text-trade-green' : (item.profit < 0 ? 'text-red-600 dark:text-trade-red' : 'text-gray-500')}`}>
                    {item.profit > 0 ? '+' : ''}{item.profit}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === 'CLOSED' ? (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                         <CheckCircle size={10} /> Closed
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                         <Timer size={10} /> Open
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;