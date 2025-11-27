import React from 'react';
import { MOCK_USER } from '../constants';
import { User, Mail, Award, TrendingUp, BarChart, Percent } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2">
          <User className="text-trade-accent" />
          Trader Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
                    {MOCK_USER.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{MOCK_USER.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{MOCK_USER.email}</p>
                <div className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-700">
                    {MOCK_USER.plan} Member
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600 dark:text-trade-green mb-3">
                    <Percent size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{MOCK_USER.winRate}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Win Rate</div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-trade-accent mb-3">
                    <BarChart size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{MOCK_USER.totalTrades}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Trades</div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400 mb-3">
                    <TrendingUp size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{MOCK_USER.profitFactor}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Profit Factor</div>
            </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Achievements
        </h3>
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-200 text-sm">Consistent Earner</h4>
                    <p className="text-xs text-gray-500">Maintained positive PnL for 3 consecutive months.</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 opacity-60">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Award size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-200 text-sm">Risk Master (Locked)</h4>
                    <p className="text-xs text-gray-500">Keep max drawdown under 2% for 50 trades.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;