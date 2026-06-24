import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Scan, Info, Heart, Zap } from 'lucide-react';
import FoodScanner from '../components/Scanner/FoodScanner';
import BarcodeScanner from '../components/Scanner/BarcodeScanner';
import NutritionCard from '../components/Scanner/NutritionCard';
import HealthScore from '../components/Scanner/HealthScore';

interface SmartNutritionProps {
  onBack: () => void;
}

export default function SmartNutrition({ onBack }: SmartNutritionProps) {
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [activeScanner, setActiveScanner] = useState<'food' | 'barcode' | null>(null);

  const handleBackToExplorer = () => {
    if (activeScanner) {
      setActiveScanner(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#2C3E50] p-6 font-sans">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBackToExplorer}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold font-serif text-[#1A2521]">Vedic Vision Scanner</h1>
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Scan className="w-6 h-6 text-amber-600" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {!activeScanner && !nutritionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveScanner('food')}
              className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Heart className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">AI Food Scanner</h2>
              <p className="text-sm text-gray-500">Scan fresh meals to identify Dosha properties and calories.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveScanner('barcode')}
              className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                <Zap className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Barcode Scanner</h2>
              <p className="text-sm text-gray-500">Scan packaged goods to audit ingredients and additives.</p>
            </motion.button>
          </div>
        )}

        <div className="space-y-6">
          {activeScanner === 'food' && (
            <FoodScanner setNutritionData={(data: any) => {
              setNutritionData(data);
              setActiveScanner(null);
            }} />
          )}
          
          {activeScanner === 'barcode' && (
            <BarcodeScanner setNutritionData={(data: any) => {
              setNutritionData(data);
              setActiveScanner(null);
            }} />
          )}

          {nutritionData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500">Audit for: <span className="font-bold text-gray-800">Pitta-Kapha Protocol</span></p>
                <button 
                  onClick={() => setNutritionData(null)}
                  className="text-xs font-bold text-amber-600 uppercase tracking-widest"
                >
                  New Scan
                </button>
              </div>

              <NutritionCard data={nutritionData} />
              <HealthScore data={nutritionData} />
              
              <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Info size={120} />
                </div>
                <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Rishi Audit Insight
                </h3>
                <p className="text-emerald-100 leading-relaxed font-light italic">
                  "{nutritionData.aiSummary}"
                </p>
                <div className="mt-6 flex gap-4">
                    <div className="px-4 py-2 bg-white/10 rounded-full text-xs border border-white/20">
                        Status: {nutritionData.status || 'Active Audit'}
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-full text-xs border border-white/20">
                        Vital Impact: Minimal
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
