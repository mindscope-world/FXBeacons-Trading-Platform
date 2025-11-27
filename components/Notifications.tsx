import React from 'react';
import { MOCK_NOTIFICATIONS } from '../constants';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const Notifications: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle size={18} className="text-green-500" />;
        case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
        case 'error': return <XCircle size={18} className="text-red-500" />;
        default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
            <Bell className="text-trade-accent" />
            Notifications
        </h2>
        <button className="text-xs text-trade-accent hover:underline">Mark all as read</button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                <p>No notifications yet.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {MOCK_NOTIFICATIONS.map((note) => (
                    <div key={note.id} className={`p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!note.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <div className="mt-1 flex-shrink-0">
                            {getIcon(note.type)}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-0.5">{note.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{note.message}</p>
                            <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <Clock size={10} />
                                {getTimeAgo(note.timestamp)}
                            </span>
                        </div>
                        {!note.read && (
                            <div className="mt-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;