import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '../../types';

interface ToastContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(n => (
        <div 
          key={n.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-in slide-in-from-right fade-in duration-300
            ${n.type === 'success' ? 'bg-emerald-600' : 
              n.type === 'error' ? 'bg-red-600' : 
              n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'}
          `}
        >
          {n.type === 'success' && <CheckCircle size={20} />}
          {n.type === 'error' && <AlertCircle size={20} />}
          {n.type === 'warning' && <AlertTriangle size={20} />}
          {n.type === 'info' && <Info size={20} />}
          
          <p className="text-sm font-medium flex-1">{n.message}</p>
          
          <button onClick={() => removeNotification(n.id)} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
