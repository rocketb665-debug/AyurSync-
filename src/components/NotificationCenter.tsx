import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Bell, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'action' | 'update' | 'alarm';
  status: 'pending' | 'completed';
  read: boolean;
  icon?: any;
  color?: string;
  bg?: string;
}

interface NotificationCenterProps {
  onClose: () => void;
  notifications: AppNotification[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (id: string) => void;
}

export function NotificationCenter({ onClose, notifications, onComplete, onDelete, onClearAll, onNavigate }: NotificationCenterProps) {
  const actionRequired = notifications.filter(n => n.type === 'action');
  const updates = notifications.filter(n => n.type === 'update' || n.type === 'alarm');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/90 backdrop-blur-xl w-full max-w-md h-full shadow-2xl flex flex-col border-l border-white/50"
      >
        <div className="flex justify-between items-center shrink-0 p-8 pb-6 border-b border-gray-100/50">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-gray-900">Notification Hub</h3>
            <p className="text-sm text-gray-500">Centralized health alerts</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-50/50 rounded-2xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="px-8 py-4 flex justify-end border-b border-gray-100/50">
            <button 
              onClick={onClearAll}
              className="text-sm font-medium text-sage-primary hover:text-sage-dark transition-colors"
            >
              Mark all as Read
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="w-24 h-24 bg-sage-50 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10 text-sage-primary/50" />
              </div>
              <p className="text-gray-500 font-medium italic">Your Vitals are balanced. No new alerts, Swami.</p>
            </div>
          ) : (
            <>
              {actionRequired.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-rose-500 px-2">Urgent Advisories</h4>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {actionRequired.map((n) => (
                        <NotificationCard 
                          key={n.id} 
                          notification={n} 
                          onComplete={() => onComplete(n.id)} 
                          onDelete={() => onDelete(n.id)} 
                          onNavigate={() => onNavigate(n.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {updates.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 px-2">Updates & Reminders</h4>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {updates.map((n) => (
                        <NotificationCard 
                          key={n.id} 
                          notification={n} 
                          onComplete={() => onComplete(n.id)} 
                          onDelete={() => onDelete(n.id)} 
                          onNavigate={() => onNavigate(n.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function NotificationCard({ 
  notification, 
  onComplete, 
  onDelete,
  onNavigate
}: { 
  notification: AppNotification; 
  onComplete: () => void; 
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const isCompleted = notification.status === 'completed';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => {
        if (!isCompleted && notification.type === 'action') {
          onComplete();
        } else {
          onNavigate();
        }
      }}
      className={cn(
        "group relative p-6 rounded-[32px] border-2 transition-all duration-500 flex items-center gap-6 cursor-pointer hover:scale-[1.02]",
        !isCompleted && notification.type === 'action' && "active:scale-[0.98]",
        isCompleted 
          ? "bg-gray-50/50 border-gray-100 opacity-75" 
          : cn("bg-white border-transparent shadow-sm hover:shadow-md", notification.bg?.replace('bg-', 'border-').replace('50', '100') || "border-gray-100")
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
        isCompleted ? "bg-gray-200 text-gray-500" : cn(notification.bg || "bg-gray-50", notification.color || "text-gray-500")
      )}>
        {isCompleted ? <Check className="w-7 h-7" /> : (notification.icon ? <notification.icon className="w-7 h-7" /> : <Bell className="w-7 h-7" />)}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className={cn(
            "font-bold text-lg transition-colors duration-500",
            isCompleted ? "text-gray-500 line-through" : "text-gray-900"
          )}>
            {notification.title}
          </p>
          {isCompleted && (
            <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">Done</span>
          )}
        </div>
        <p className={cn(
          "text-sm transition-colors duration-500",
          isCompleted ? "text-gray-400" : "text-gray-600"
        )}>
          {notification.description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!isCompleted && notification.type === 'action' && (
          <button 
            onClick={onComplete}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all flex items-center gap-2 group/btn"
          >
            Complete
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        )}
        
        <button 
          onClick={onDelete}
          className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          title="Delete notification"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
