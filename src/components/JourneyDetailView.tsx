import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Clock, Utensils, Dumbbell, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface Journey {
  id: string;
  title: string;
  description?: string;
  duration: number;
  currentDay: number;
  icon?: any;
  color?: string;
  gradient?: string;
  tags?: string[];
  isLocked?: boolean;
  dietaryBlueprint?: { time: string; meal: string; recommendation: string }[];
  movementPlan?: { type: string; duration: string; time: string }[];
  avoidList?: string[];
  vitals?: string[];
  status?: 'active' | 'completed' | 'missed';
  progress?: number[];
  category?: 'Weight' | 'Sleep' | 'Stress' | 'Strength';
}

interface JourneyDetailViewProps {
  journey: Journey;
  onBack: () => void;
}

export const JourneyDetailView: React.FC<JourneyDetailViewProps> = ({ journey, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[100] bg-[#FDFBF7] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-stone-600" />
          </button>
          
          <div className="flex-1 px-8 text-center">
            <h1 className="text-2xl font-serif font-bold text-stone-800">{journey.title}</h1>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="flex-1 max-w-xs h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage-primary" 
                  style={{ width: `${(journey.currentDay / journey.duration) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-stone-500">Day {journey.currentDay} of {journey.duration}</span>
            </div>
          </div>

          <button className="px-6 py-2.5 bg-sage-primary text-white rounded-full font-bold shadow-lg shadow-sage-primary/20 hover:scale-105 transition-all flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            Start Today's Routine
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Kabir's Monitoring Message */}
        {journey.id === 'sleep-quality' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[32px] p-8 shadow-2xl flex items-center gap-6 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
            <img 
              src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000633871fa83cefae6688ca347.png" 
              alt="Kabir" 
              className="w-24 h-24 rounded-full border-4 border-amber-400/30 shadow-lg relative z-10 object-cover"
            />
            <div className="relative z-10 flex-1">
              <h3 className="text-amber-400 font-bold text-lg mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Kabir (Primary Guide)
              </h3>
              <p className="text-blue-50 text-xl font-serif italic leading-relaxed">
                "I am monitoring your rest tonight. Ensure your room is 22°C for peak recovery."
              </p>
            </div>
          </motion.div>
        )}

        {/* Dietary Blueprint */}
        {journey.dietaryBlueprint && journey.dietaryBlueprint.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Utensils className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800">The Dietary Blueprint</h2>
            </div>
            
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Meal Type</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Ayurvedic Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {journey.dietaryBlueprint.map((item) => (
                    <tr key={`${item.time}-${item.meal}`} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-5 font-mono text-sm text-stone-600">{item.time}</td>
                      <td className="px-6 py-5 font-bold text-stone-800">{item.meal}</td>
                      <td className="px-6 py-5 text-stone-600 italic">{item.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Movement Plan */}
        {journey.movementPlan && journey.movementPlan.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800">The Movement Plan</h2>
            </div>
            
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Exercise Type</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-500 uppercase tracking-wider">Best Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {journey.movementPlan.map((item) => (
                    <tr key={`${item.type}-${item.time}`} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-stone-800">{item.type}</td>
                      <td className="px-6 py-5 text-stone-600">{item.duration}</td>
                      <td className="px-6 py-5 text-stone-600 italic">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Avoid List */}
        {journey.avoidList && journey.avoidList.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800">The 'Avoid' List (Red Zone)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journey.avoidList.map((item) => (
                <div key={item} className="flex items-center gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-stone-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Note */}
        <div className="p-8 bg-stone-100 rounded-[40px] text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-sage-primary" />
          </div>
          <p className="text-stone-500 italic">"Consistency is the key to transformation. Your AI team is monitoring your progress."</p>
        </div>
      </div>
    </motion.div>
  );
};
