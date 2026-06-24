import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  Users, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import WisdomGallery from './WisdomGallery';
import RishiSabha from './RishiSabha';
import Dinacharya from './Dinacharya';

interface AyurvedaSangamProps {
  onBack: () => void;
  healthData: any;
}

export type SangamView = 'gallery' | 'sabha' | 'clock';

const AyurvedaSangam: React.FC<AyurvedaSangamProps> = ({ onBack, healthData }) => {
  const [activeView, setActiveView] = useState<SangamView>('gallery');

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-500 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">Ayurveda Sangam</h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">The Council of Wisdom</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center bg-gray-50 p-1 rounded-xl gap-1">
          <button 
            onClick={() => setActiveView('gallery')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeView === 'gallery' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Wisdom Gallery
          </button>
          <button 
            onClick={() => setActiveView('sabha')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeView === 'sabha' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Rishi Sabha
          </button>
          <button 
            onClick={() => setActiveView('clock')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeView === 'clock' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ayurvedic Clock
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto p-4 md:p-8"
            >
              <WisdomGallery healthData={healthData} />
            </motion.div>
          )}

          {activeView === 'sabha' && (
            <motion.div
              key="sabha"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full max-w-4xl mx-auto flex flex-col"
            >
              <RishiSabha healthData={healthData} />
            </motion.div>
          )}

          {activeView === 'clock' && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto p-4 md:p-8"
            >
              <Dinacharya />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-2 flex justify-around items-center">
          <button 
            onClick={() => setActiveView('gallery')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'gallery' ? 'text-emerald-600' : 'text-gray-400'}`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[9px] font-bold">GALLERY</span>
          </button>
          <button 
            onClick={() => setActiveView('sabha')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'sabha' ? 'text-rose-600' : 'text-gray-400'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-bold">SABHA</span>
          </button>
          <button 
            onClick={() => setActiveView('clock')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'clock' ? 'text-amber-600' : 'text-gray-400'}`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[9px] font-bold">CLOCK</span>
          </button>
        </div>
      </div>

      {/* Regulatory Footer */}
      <div className="bg-white/50 border-t border-gray-100 py-3 px-6 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <p className="text-[9px] text-gray-500 font-medium">EDUCATIONAL RESOURCE</p>
        </div>
        <p className="text-[10px] text-gray-400 max-w-lg mx-auto">
          Ayurveda Sangam provides traditional wisdom for balance. Consult a Vaidya for medical treatment.
        </p>
      </div>
    </div>
  );
};

export default AyurvedaSangam;
