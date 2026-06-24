import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Utensils, Dumbbell, Coffee, Play, Info } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface ProtocolOverviewProps {
  onBack: () => void;
  currentDay: number;
}

interface ProtocolDay {
  day: number;
  activities: {
    time: string;
    activity: string;
    category: 'Food' | 'Work' | 'Rest' | 'Workout';
    specialist?: string;
    note?: string;
  }[];
}

const protocolData: ProtocolDay[] = Array.from({ length: 21 }, (_, i) => ({
  day: i + 1,
  activities: [
    { time: '07:00 AM', activity: 'Veer’s Morning Igniter', category: 'Workout', specialist: 'Veer', note: 'Ignite Agni with high-intensity movement.' },
    { time: '09:00 AM', activity: 'Rohini’s Metabolic Breakfast', category: 'Food', specialist: 'Rohini', note: 'Warm spiced oats to scrape excess Kapha.' },
    { time: '01:00 PM', activity: 'Kavya’s Herb Ritual', category: 'Rest', specialist: 'Kavya', note: 'Triphala & Ashwagandha for cellular reset.' },
    { time: '04:00 PM', activity: 'Deep Work Session', category: 'Work', note: 'Peak cognitive performance window.' },
    { time: '07:30 PM', activity: 'Light Ayurvedic Dinner', category: 'Food', note: 'Easy to digest vegetable soup.' },
    { time: '09:00 PM', activity: 'Golden Milk Detox', category: 'Rest', specialist: 'Aryan', note: 'Night recovery and inflammation reduction.' },
  ]
}));

export const ProtocolOverview = ({ onBack, currentDay }: ProtocolOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[150] bg-[#F8FAFC] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="px-6 py-6 bg-white border-b border-gray-100 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">21-Day Meta-Shred Protocol</h2>
            <p className="text-sm text-gray-500 font-medium">Full Timeline & Specialist Strategy</p>
          </div>
        </div>
      </header>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          {protocolData.map((dayData) => (
            <div key={dayData.day} className="relative">
              {/* Day Header */}
              <div className={cn(
                "sticky top-0 z-10 py-3 px-6 rounded-2xl mb-6 flex items-center justify-between shadow-sm",
                dayData.day === currentDay 
                  ? "bg-sage-primary text-white" 
                  : "bg-white text-gray-900 border border-gray-100"
              )}>
                <h3 className="text-lg font-bold">Day {dayData.day}</h3>
                {dayData.day === currentDay && (
                  <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Current Day</span>
                )}
              </div>

              {/* Activities Table/List */}
              <div className="space-y-4 ml-4 border-l-2 border-gray-100 pl-8">
                {dayData.activities.map((act, idx) => (
                  <div key={idx} className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    {/* Category Indicator */}
                    <div className={cn(
                      "absolute -left-[41px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-[#F8FAFC] flex items-center justify-center",
                      act.category === 'Workout' ? "bg-red-500" :
                      act.category === 'Food' ? "bg-orange-500" :
                      act.category === 'Work' ? "bg-blue-500" : "bg-purple-500"
                    )}>
                      {act.category === 'Workout' && <Dumbbell className="w-2.5 h-2.5 text-white" />}
                      {act.category === 'Food' && <Utensils className="w-2.5 h-2.5 text-white" />}
                      {act.category === 'Work' && <Clock className="w-2.5 h-2.5 text-white" />}
                      {act.category === 'Rest' && <Coffee className="w-2.5 h-2.5 text-white" />}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-bold text-gray-400 min-w-[80px]">{act.time}</span>
                        <div>
                          <h4 className="font-bold text-gray-900">{act.activity}</h4>
                          <p className="text-sm text-gray-500">{act.category}</p>
                        </div>
                      </div>

                      {act.specialist && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-sage-primary/20 flex items-center justify-center text-[10px] font-bold text-sage-primary">
                            {act.specialist[0]}
                          </div>
                          <span className="text-xs font-bold text-gray-600">{act.specialist}</span>
                        </div>
                      )}
                    </div>

                    {act.note && (
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-start gap-2">
                        <Info className="w-4 h-4 text-sage-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          <span className="font-bold not-italic text-gray-400 uppercase mr-1">Specialist Note:</span>
                          {act.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
