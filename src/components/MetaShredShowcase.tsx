import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, MessageSquare, Send, Zap, Flame, Coffee, Activity } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface MetaShredShowcaseProps {
  onBack: () => void;
  onStart: () => void;
}

export const MetaShredShowcase = ({ onBack, onStart }: MetaShredShowcaseProps) => {
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80',
      text: 'Rapid Metabolism Ignition'
    },
    {
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80',
      text: 'Precision Fat Oxidation'
    },
    {
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80',
      text: 'Sustainable Energy Mastery'
    },
    {
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
      text: 'Total Vitality Transformation'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [goal, setGoal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const testimonials = [
    { name: "Arjun K.", text: "Lost 4kg in 2 weeks. The timing of the meals made all the difference.", rating: 5 },
    { name: "Sarah M.", text: "I never thought Ayurvedic principles could be this intense. My energy is through the roof!", rating: 5 },
    { name: "David L.", text: "The Golden Milk Detox at 9 PM is a game changer for my sleep and recovery.", rating: 4 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden"
    >
      {/* Header Override */}
      <header className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif font-bold text-white tracking-widest uppercase">Meta-Shred</h2>
        <div className="w-12" /> {/* Spacer */}
      </header>

      {/* Opposite-Motion Banner (Top 25%) */}
      <div className="h-[30vh] md:h-[35vh] relative overflow-hidden shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${currentIndex}`}
            className="absolute inset-0"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Visual Slide: Right to Left */}
            <motion.img
              src={slides[currentIndex].image}
              variants={{
                initial: { x: '100%' },
                animate: { x: 0 },
                exit: { x: '-100%' }
              }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Text Slide: Left to Right */}
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <motion.h1
                variants={{
                  initial: { x: '-100%', opacity: 0 },
                  animate: { x: 0, opacity: 1 },
                  exit: { x: '100%', opacity: 0 }
                }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white text-center drop-shadow-2xl max-w-4xl"
              >
                {slides[currentIndex].text}
              </motion.h1>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-16 pb-32">
          
          {/* Deep-Dive Description */}
          <section className="space-y-8">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p className="font-medium text-gray-900">
                Meta-Shred is not just a workout; it's a biological recalibration. By synchronizing high-intensity metabolic triggers with the natural rhythms of your body, we ignite a fat-burning furnace that lasts long after the session ends.
              </p>
              <p>
                The secret lies in our <span className="text-sage-primary font-bold">Precision Timing</span>. We target the Kapha period of the morning (6 AM - 10 AM) when the body is naturally more sluggish, using explosive movements to clear stagnation and spike your basal metabolic rate.
              </p>
              <p>
                Complementing the physical intensity is our <span className="text-sage-primary font-bold">Kapha-Balancing Nutrition</span>. We focus on pungent, bitter, and astringent tastes that "scrape" away excess adipose tissue (Medas Dhatu) while keeping your digestive fire (Agni) roaring throughout the day.
              </p>
            </div>

            {/* Inclusions List */}
            <div className="bg-sage-light/20 rounded-[32px] p-8 border border-sage-primary/10">
              <h3 className="text-xl font-bold text-sage-primary mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                What's Included
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { text: "7:00 AM HIIT Sessions", icon: Activity },
                  { text: "9:00 PM Golden Milk Detox", icon: Coffee },
                  { text: "Daily Mira Counseling", icon: MessageSquare },
                  { text: "Kapha-Pacifying Meal Plans", icon: Flame },
                  { text: "Metabolic Biomarker Tracking", icon: Activity },
                  { text: "Weekly Specialist Review", icon: CheckCircle2 }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sage-primary shadow-sm">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Social Proof & Community */}
          <section className="space-y-8">
            <h3 className="text-2xl font-serif font-bold text-gray-900">Community Success</h3>
            <div className="flex overflow-x-auto gap-6 pb-4 -mx-2 px-2 hide-scrollbar snap-x snap-mandatory">
              {testimonials.map((t, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] bg-stone-50 rounded-[24px] p-6 snap-start border border-stone-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Zap key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 leading-relaxed">"{t.text}"</p>
                  <p className="text-sm font-bold text-sage-primary uppercase tracking-widest">— {t.name}</p>
                </div>
              ))}
            </div>

            {/* Share Your Goal */}
            <div className="bg-stone-900 rounded-[32px] p-8 text-white space-y-6">
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Set Your Intention</h4>
                <p className="text-stone-400 text-sm">What do you want to achieve with Meta-Shred?</p>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Lose 5kg and regain my morning energy..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-6 pr-16 outline-none focus:ring-2 focus:ring-sage-primary transition-all text-white placeholder:text-stone-500"
                />
                <button 
                  onClick={() => {
                    if (goal.trim()) setIsSubmitted(true);
                  }}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-sage-primary text-white rounded-xl hover:bg-sage-accent transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {isSubmitted && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sage-primary font-bold text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Intention locked. Let's make it happen.
                </motion.p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Start Protocol - Sticky Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-[110]">
        <button 
          onClick={onStart}
          className="w-full py-6 bg-sage-primary text-white rounded-[24px] font-bold text-xl shadow-2xl shadow-sage-primary/40 hover:bg-sage-accent hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
        >
          <Flame className="w-6 h-6 group-hover:animate-pulse" />
          START PROTOCOL: DAY 1
          <ArrowLeft className="w-6 h-6 rotate-180" />
        </button>
      </div>
    </motion.div>
  );
};
