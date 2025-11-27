import React from 'react';
import { Moon, Sun, Monitor, Bell, Shield, Key } from 'lucide-react';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6">Settings</h2>
      
      <div className="grid gap-6 max-w-3xl">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <Monitor className="text-trade-accent" size={20}/>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Interface Theme</p>
               <p className="text-xs text-gray-500 mt-1">Select your preferred viewing mode.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
               <button 
                 onClick={() => setTheme('light')}
                 className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${theme === 'light' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <Sun size={16} /> Light
               </button>
               <button 
                 onClick={() => setTheme('dark')}
                 className={`p-2 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${theme === 'dark' ? 'bg-gray-700 shadow text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <Moon size={16} /> Dark
               </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <Bell className="text-trade-accent" size={20}/>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Trade Signals</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Risk Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
             </div>
          </div>
        </div>

        {/* API & Security */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <Shield className="text-trade-accent" size={20}/>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Twelve Data API Key</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                        type="password" 
                        value="••••••••••••••••" 
                        readOnly
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-200 outline-none cursor-not-allowed"
                    />
                </div>
                <button className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    Edit
                </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">API Keys are encrypted locally. Only used for data fetching.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;