import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Star } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface MetaShredImmersionProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const images = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80'
];

const texts = [
  "Rapid Metabolism Ignition",
  "Precision Ayurvedic Fat Oxidation",
  "Sustainable Energy, Zero Burnout"
];

export const MetaShredImmersion: React.FC<MetaShredImmersionProps> = ({ onBack, onGetStarted }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Dynamic Banner */}
      <div className="h-[25vh] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index]}
            src={images[index]}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={texts[index]}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="text-4xl md:text-6xl font-serif font-bold text-white text-center px-4"
            >
              {texts[index]}
            </motion.h2>
          </AnimatePresence>
        </div>
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>

      {/* Description & Review Block */}
      <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12">
        <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 leading-relaxed">
          <p>
            Meta-Shred uses a patented synchronization of high-intensity interval training (HIIT) with 'Kapha-Cooling' dietary principles. We don't just burn calories; we retrain your metabolic engine to operate at peak efficiency, turning your body into a fat-burning furnace.
          </p>
          <p>
            By aligning your movement with your circadian rhythm and specific Ayurvedic dosha balance, Meta-Shred ensures that you achieve rapid results without the typical burnout associated with standard weight-loss programs.
          </p>
        </div>

        {/* Community Pulse */}
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Community Pulse</h3>
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sage-primary text-white flex items-center justify-center font-bold">A</div>
              <div>
                <p className="font-bold">Aria K.</p>
                <div className="flex text-yellow-400"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                <p className="text-sm text-gray-600">"Lost 5kg in 3 weeks! The energy is unreal."</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Share your journey..." className="w-full p-4 rounded-xl border border-gray-200" />
            <button className="w-full py-4 bg-sage-primary text-white rounded-xl font-bold">Submit</button>
          </div>
        </div>
      </div>

      {/* Get Started Gate */}
      <button 
        onClick={onGetStarted}
        className="sticky bottom-0 w-full py-6 bg-sage-primary text-white text-2xl font-bold shadow-lg hover:bg-sage-accent transition-all"
      >
        Get Started
      </button>
    </div>
  );
};
