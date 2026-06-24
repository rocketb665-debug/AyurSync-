import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Clock, 
  Activity, 
  Info,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { cn } from '../contexts/lib/utils';

interface SleepRecord {
  day: string;
  date: string;
  total: number;
  deep: number;
  rem: number;
  bedtime: string;
  wakeup: string;
  quality: number;
}

interface SleepAnalyticsViewProps {
  onBack: () => void;
  sleepHistory: SleepRecord[];
}

export function SleepAnalyticsView({ onBack, sleepHistory }: SleepAnalyticsViewProps) {
  const [selectedDay, setSelectedDay] = useState<SleepRecord | null>(
    sleepHistory[sleepHistory.length - 1] || null
  );

  const averageSleep = useMemo(() => {
    if (sleepHistory.length === 0) return 0;
    const sum = sleepHistory.reduce((acc, curr) => acc + curr.total, 0);
    return parseFloat((sum / sleepHistory.length).toFixed(1));
  }, [sleepHistory]);

  const getBarColor = (hours: number) => {
    if (hours >= 8) return '#1e3a8a'; // Deep Blue
    if (hours >= 7) return '#3b82f6'; // Blue
    if (hours >= 6) return '#60a5fa'; // Light Blue
    return '#f59e0b'; // Amber
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {payload[0].payload.day}
          </p>
          <p className="text-lg font-serif font-bold text-sage-primary">
            {payload[0].value}h Sleep
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-stone-50"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-serif font-bold text-gray-900">Sleep Horizon</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Weekly Summary Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">7-Day Average</p>
              <h2 className="text-3xl font-serif font-bold text-sage-primary">{averageSleep}h</h2>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
              averageSleep >= 7 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
            )}>
              {averageSleep >= 7 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {averageSleep >= 7 ? "Optimal" : "Below Target"}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={sleepHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(data: any) => {
                  if (data && data.activePayload) {
                    setSelectedDay(data.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar 
                  dataKey="total" 
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                >
                  {sleepHistory.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.total)}
                      fillOpacity={selectedDay?.day === entry.day ? 1 : 0.6}
                      stroke={selectedDay?.day === entry.day ? getBarColor(entry.total) : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={8} stroke="#1e3a8a" strokeDasharray="3 3" label={{ position: 'right', value: 'Goal', fill: '#1e3a8a', fontSize: 10, fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-4">
            Tap any bar for detailed clinical breakdown
          </p>
        </div>

        {/* Detailed Breakdown Card */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={selectedDay.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900">{selectedDay.day} Breakdown</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedDay.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-serif font-bold text-sage-primary">{selectedDay.total}h</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Duration</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bedtime</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedDay.bedtime}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Sun className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Wake-up</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedDay.wakeup}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-2">
                  <span className="text-indigo-600">Deep Sleep ({selectedDay.deep}h)</span>
                  <span className="text-purple-600">REM Sleep ({selectedDay.rem}h)</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(selectedDay.deep / selectedDay.total) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: `${(selectedDay.rem / selectedDay.total) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-blue-300" 
                    style={{ width: `${((selectedDay.total - selectedDay.deep - selectedDay.rem) / selectedDay.total) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Restorative Phase</span>
                  <span>Light Sleep</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Specialist Insight (Kabir) */}
        <div className="bg-indigo-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Specialist Insight</span>
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Kabir (Sleep Scientist)</span>
              </div>
              <p className="text-sm font-medium leading-relaxed italic">
                "Your REM sleep is 15% higher on days you finish dinner before 8 PM. Maintaining this consistency will accelerate neural recovery."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Optional) */}
      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none">
        <button className="bg-white text-indigo-600 px-6 py-3 rounded-full shadow-2xl border border-indigo-50 flex items-center gap-2 font-bold text-sm pointer-events-auto hover:scale-105 transition-transform">
          <Zap className="w-4 h-4" />
          Optimize Routine
        </button>
      </div>
    </motion.div>
  );
}
