import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Droplets, Heart, Wind, Thermometer, Activity, Moon, Smile, Scale, Stethoscope, Brain, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { POLLING_CATEGORIES } from '../constants/polling';

interface QuickPulseProps {
  onClose: () => void;
  onComplete: (updates: Record<string, any>) => void;
  pollingState: Record<string, number>;
  healthData: any;
}

interface Question {
  id: string;
  label: string;
  question: string;
  icon: any;
  type: string;
  placeholder: string;
  category: string;
}

const QUESTION_METADATA: Record<string, Partial<Question>> = {
  hydration: { label: 'Hydration', question: 'How many liters of water have you had today?', icon: Droplets, type: 'number', placeholder: 'e.g. 2.5' },
  sleep: { label: 'Sleep', question: 'How many hours did you sleep?', icon: Moon, type: 'number', placeholder: 'e.g. 7.5' },
  steps: { label: 'Steps', question: 'What is your current step count?', icon: Activity, type: 'number', placeholder: 'e.g. 8000' },
  mood: { label: 'Mood', question: 'How is your current mood?', icon: Smile, type: 'text', placeholder: 'e.g. Energetic' },
  oxygen: { label: 'Oxygen', question: 'What is your Oxygen level (SpO2)?', icon: Wind, type: 'number', placeholder: 'e.g. 98' },
  heartRate: { label: 'Heart Rate', icon: Heart, question: 'What is your Heart Rate (BPM)?', type: 'number', placeholder: 'e.g. 72' },
  bloodSugar: { label: 'Blood Sugar', question: 'What is your Blood Sugar (Fasting/PP)?', icon: Thermometer, type: 'number', placeholder: 'e.g. 110' },
  bloodPressure: { label: 'Blood Pressure', question: 'What is your Blood Pressure (Systolic/Diastolic)?', icon: Activity, type: 'text', placeholder: 'e.g. 120/80' },
  weight: { label: 'Weight', question: 'What is your current weight?', icon: Scale, type: 'number', placeholder: 'e.g. 70' },
  symptoms: { label: 'Symptoms', question: 'Are you experiencing any major symptoms?', icon: Stethoscope, type: 'text', placeholder: 'e.g. None' },
  stress: { label: 'Stress', question: 'What is your stress score (1-10)?', icon: Brain, type: 'number', placeholder: 'e.g. 4' },
};

export function QuickPulse({ onClose, onComplete, pollingState, healthData }: QuickPulseProps) {
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [updates, setUpdates] = useState<Record<string, any>>({});

  const isDiabetic = useMemo(() => {
    return healthData.primaryGoal?.toLowerCase().includes('diabetes') || 
           healthData.lifestyleFocus?.toLowerCase().includes('diabetes');
  }, [healthData]);

  const queue = useMemo(() => {
    const now = Date.now();
    const result: Question[] = [];

    Object.entries(POLLING_CATEGORIES).forEach(([category, config]) => {
      config.metrics.forEach(metric => {
        const lastCheck = pollingState[metric] || 0;
        const hoursSince = (now - lastCheck) / (1000 * 60 * 60);
        
        let interval = config.standardIntervalHours;
        
        // Dynamic Personalization: Diabetes moves Sugar Level to Daily
        if (metric === 'bloodSugar' && isDiabetic) {
          interval = 24;
        }

        if (hoursSince >= interval) {
          const meta = QUESTION_METADATA[metric];
          if (meta) {
            result.push({
              id: metric,
              category,
              label: meta.label!,
              question: meta.question!,
              icon: meta.icon!,
              type: meta.type!,
              placeholder: meta.placeholder!,
            });
          }
        }
      });
    });

    return result;
  }, [pollingState, isDiabetic]);

  const currentQuestion = queue[step];

  const handleNext = () => {
    if (!inputValue.trim()) return;

    // Record update
    let valueToSave = inputValue;
    if (currentQuestion.id === 'stress') {
      const numValue = Number(inputValue);
      if (!isNaN(numValue) && numValue <= 10) {
        valueToSave = String(numValue * 10);
      }
    }
    const newUpdates = { ...updates, [currentQuestion.id]: valueToSave };
    setUpdates(newUpdates);

    // Show Green Glow
    setShowGlow(true);
    setTimeout(() => setShowGlow(false), 1000);

    if (step < queue.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
        setInputValue('');
      }, 300);
    } else {
      setIsSuccess(true);
    }
  };

  if (queue.length === 0 && !isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-[40px] p-12 w-full max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500">Your vitals are current. Dr. Kavya and the council are monitoring your progress.</p>
          <button onClick={onClose} className="w-full py-4 bg-sage-primary text-white rounded-2xl font-bold">Close</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[48px] p-12 w-full max-w-xl shadow-2xl text-center space-y-8 border border-emerald-100"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold text-gray-900">Rounds Complete</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Excellent work, {healthData.name || 'Swami'}. Your specialists (Rohini, Kavya, etc.) have been updated with your latest vitals.
              </p>
            </div>
            <button 
              onClick={() => onComplete(updates)}
              className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
            >
              Back to Dashboard
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="question"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className={cn(
              "bg-white rounded-[48px] p-10 w-full max-w-xl shadow-2xl space-y-10 border border-gray-100 transition-all duration-500",
              showGlow && "shadow-[0_0_40px_rgba(34,197,94,0.4)] border-emerald-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sage-primary font-bold text-xs uppercase tracking-[0.2em]">
                  <Activity className="w-4 h-4" />
                  Medical Rounds
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900">
                  {step === 0 ? `Good morning, ${healthData.name || 'Swami'}` : 'Next Metric'}
                </h3>
                <p className="text-gray-500">Let's do your quick health check for today.</p>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute -top-4 right-0 text-[10px] font-bold text-sage-primary/40 uppercase tracking-widest">
                Metric {step + 1} of {queue.length}
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / queue.length) * 100}%` }}
                  className="h-full bg-sage-primary"
                />
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xl font-medium text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </p>
              
              <div className={cn(
                "flex items-center gap-6 p-8 bg-gray-50 rounded-[32px] border-2 transition-all duration-300",
                inputValue ? "border-sage-primary/20 bg-white shadow-sm" : "border-transparent"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                  inputValue ? "bg-sage-primary text-white scale-110" : "bg-white text-sage-primary shadow-sm"
                )}>
                  <currentQuestion.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 block">
                    {currentQuestion.label}
                  </label>
                  <input 
                    type={currentQuestion.type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full bg-transparent outline-none text-2xl font-bold text-gray-900 placeholder:text-gray-200"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!inputValue.trim()}
              className={cn(
                "w-full py-6 rounded-[24px] font-bold text-lg transition-all flex items-center justify-center gap-3",
                inputValue.trim() 
                  ? "bg-sage-primary text-white shadow-xl shadow-sage-primary/20 hover:scale-[1.02]" 
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}
            >
              {step < queue.length - 1 ? 'Next Metric' : 'Complete Rounds'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
