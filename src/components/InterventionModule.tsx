import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wind, Droplets, Thermometer, Check, ArrowRight, Activity, ShieldAlert, Sparkles, Timer } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface InterventionModuleProps {
  type: 'bp' | 'hydration' | 'sugar';
  onClose: () => void;
  onStabilized: (metric: string, newValue: any) => void;
  healthData: any;
}

export function InterventionModule({ type, onClose, onStabilized, healthData }: InterventionModuleProps) {
  const [step, setStep] = useState<'intro' | 'action' | 'verification' | 'success'>('intro');
  const [breathCount, setBreathCount] = useState(0);
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Module A: BP Breathing Logic
  useEffect(() => {
    if (type === 'bp' && step === 'action') {
      let count = 0;
      let cycle = 0;
      const interval = setInterval(() => {
        setTimer((prev) => {
          const next = prev + 1;
          if (breathState === 'inhale' && next >= 4) {
            setBreathState('hold');
            return 0;
          }
          if (breathState === 'hold' && next >= 6) {
            setBreathState('exhale');
            return 0;
          }
          if (breathState === 'exhale' && next >= 8) {
            setBreathState('inhale');
            setBreathCount((c) => {
              if (c + 1 >= 5) {
                clearInterval(interval);
                setStep('verification');
              }
              return c + 1;
            });
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type, step, breathState]);

  const handleBPVerify = () => {
    const systolic = parseInt(inputValue.split('/')[0]);
    const diastolic = parseInt(inputValue.split('/')[1] || '80');
    
    if (isNaN(systolic)) {
      setError('Please enter a valid BP reading (e.g. 120/80)');
      return;
    }

    if (systolic <= 130 && diastolic <= 85) {
      setStep('success');
      onStabilized('bloodPressure', inputValue);
    } else {
      setError('Still Elevated. Let\'s try 5 more deep breaths.');
      setTimeout(() => {
        setError(null);
        setStep('action');
        setBreathCount(0);
        setBreathState('inhale');
        setTimer(0);
      }, 3000);
    }
  };

  const handleHydrationVerify = () => {
    const glasses = parseInt(inputValue);
    if (isNaN(glasses)) return;

    if (glasses >= 2) {
      const newHydration = healthData.vitality.hydration + (glasses * 250);
      const hydrationPercentage = (newHydration / 3000) * 100;

      if (hydrationPercentage > 60) {
        setStep('success');
        onStabilized('hydration', newHydration);
      } else {
        setError(`Hydration is now ${Math.round(hydrationPercentage)}%. You need to reach 60% (1800ml). Please drink more.`);
        setTimeout(() => setError(null), 3000);
      }
    } else {
      setError('Your body needs more. Please finish at least 2 glasses.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const [sugarTimer, setSugarTimer] = useState<number | null>(null);

  useEffect(() => {
    if (sugarTimer !== null && sugarTimer > 0) {
      const interval = setInterval(() => {
        setSugarTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    } else if (sugarTimer === 0) {
      setStep('verification');
      setSugarTimer(null);
    }
  }, [sugarTimer]);

  const handleSugarVerify = () => {
    const sugar = parseInt(inputValue);
    if (isNaN(sugar)) return;

    if (sugar <= 140) {
      setStep('success');
      onStabilized('bloodSugar', sugar);
    } else {
      setError('Still High. Please follow the instructions and re-test.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (type) {
      case 'bp':
        return (
          <div className="space-y-8 text-center">
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                  <Activity className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-gray-900">Respiratory Reset</h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  Your blood pressure is elevated. We will perform 5 cycles of guided breathing to stabilize your system.
                </p>
                <button 
                  onClick={() => setStep('action')}
                  className="w-full py-5 bg-sage-primary text-white rounded-[24px] font-bold text-xl shadow-xl shadow-sage-primary/20"
                >
                  Start Reset
                </button>
              </motion.div>
            )}

            {step === 'action' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: breathState === 'inhale' ? 1.5 : breathState === 'hold' ? 1.5 : 1,
                      opacity: breathState === 'inhale' ? 0.4 : 0.2
                    }}
                    transition={{ duration: breathState === 'inhale' ? 4 : breathState === 'exhale' ? 8 : 0 }}
                    className="absolute inset-0 bg-sage-primary rounded-full"
                  />
                  <div className="relative z-10 text-center">
                    <h3 className="text-5xl font-serif font-bold text-sage-primary uppercase tracking-widest mb-2">
                      {breathState}
                    </h3>
                    <p className="text-2xl font-bold text-gray-400">{timer}s</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-4 h-4 rounded-full transition-all duration-500",
                        i < breathCount ? "bg-sage-primary scale-125" : "bg-gray-100"
                      )} 
                    />
                  ))}
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Cycle {breathCount + 1} of 5</p>
              </motion.div>
            )}

            {step === 'verification' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-gray-900">Verification</h3>
                  <p className="text-gray-500">Please re-measure your BP now. Enter reading:</p>
                </div>
                <div className="max-w-xs mx-auto">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. 120/80"
                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[24px] text-center text-3xl font-bold outline-none focus:border-sage-primary transition-all"
                  />
                  {error && <p className="mt-4 text-rose-500 font-bold">{error}</p>}
                </div>
                <button 
                  onClick={handleBPVerify}
                  className="w-full py-5 bg-sage-primary text-white rounded-[24px] font-bold text-xl"
                >
                  Verify Stability
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'hydration':
        return (
          <div className="space-y-8 text-center">
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="w-24 h-24 bg-cyan-100 text-cyan-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                  <Droplets className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-gray-900">Hydration Recovery</h2>
                <div className="bg-cyan-50 p-6 rounded-[32px] border border-cyan-100">
                  <p className="text-cyan-900 font-medium text-lg">
                    "Dr. Kavya recommends drinking 2 large glasses (500ml) of water immediately."
                  </p>
                </div>
                <button 
                  onClick={() => setStep('verification')}
                  className="w-full py-5 bg-cyan-500 text-white rounded-[24px] font-bold text-xl shadow-xl shadow-cyan-500/20"
                >
                  I've Consumed Water
                </button>
              </motion.div>
            )}

            {step === 'verification' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-gray-900">Verification</h3>
                  <p className="text-gray-500">How many glasses have you consumed just now?</p>
                </div>
                <div className="max-w-xs mx-auto">
                  <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="0"
                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[24px] text-center text-5xl font-bold outline-none focus:border-cyan-500 transition-all"
                  />
                  {error && <p className="mt-4 text-rose-500 font-bold">{error}</p>}
                </div>
                <button 
                  onClick={handleHydrationVerify}
                  className="w-full py-5 bg-cyan-500 text-white rounded-[24px] font-bold text-xl"
                >
                  Update Levels
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'sugar':
        return (
          <div className="space-y-8 text-center">
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                  <Thermometer className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif font-bold text-gray-900">Glucose Stabilizer</h2>
                <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 text-left space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">R</div>
                    <span className="font-bold text-orange-900">Specialist Rohini's Advice</span>
                  </div>
                  <ul className="space-y-3 text-orange-800">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      Walk briskly for 10 minutes to help muscles absorb glucose.
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      Drink 1 liter of water to assist kidneys in flushing excess sugar.
                    </li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSugarTimer(15 * 60)}
                    className="py-5 bg-orange-500 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-orange-500/20"
                  >
                    Start 15-Min Timer
                  </button>
                  <button 
                    onClick={() => setStep('verification')}
                    className="py-5 bg-white border-2 border-orange-100 text-orange-600 rounded-[24px] font-bold text-lg"
                  >
                    Skip to Re-Test
                  </button>
                </div>
              </motion.div>
            )}

            {sugarTimer !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-12">
                <div className="w-32 h-32 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-orange-200 animate-pulse">
                  <Timer className="w-16 h-16" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-5xl font-serif font-bold text-gray-900">{formatTime(sugarTimer)}</h3>
                  <p className="text-gray-500 font-medium uppercase tracking-widest">Activity in Progress</p>
                </div>
                <p className="text-orange-700 bg-orange-50 p-4 rounded-2xl border border-orange-100 max-w-sm mx-auto">
                  Please complete your 10-minute walk and hydration. We'll re-test once the timer ends.
                </p>
                <button 
                  onClick={() => setSugarTimer(null)}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Cancel Timer
                </button>
              </motion.div>
            )}

            {step === 'verification' && sugarTimer === null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-gray-900">Re-Test Verification</h3>
                  <p className="text-gray-500">Please re-test your blood sugar now. Enter reading:</p>
                </div>
                <div className="max-w-xs mx-auto">
                  <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="mg/dL"
                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[24px] text-center text-4xl font-bold outline-none focus:border-orange-500 transition-all"
                  />
                  {error && <p className="mt-4 text-rose-500 font-bold">{error}</p>}
                </div>
                <button 
                  onClick={handleSugarVerify}
                  className="w-full py-5 bg-orange-500 text-white rounded-[24px] font-bold text-xl"
                >
                  Verify Glucose
                </button>
              </motion.div>
            )}
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className={cn(
          "bg-white rounded-[56px] p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden transition-colors duration-1000",
          step === 'success' && "bg-emerald-50"
        )}
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          {type === 'bp' && <Activity className="w-64 h-64" />}
          {type === 'hydration' && <Droplets className="w-64 h-64" />}
          {type === 'sugar' && <Thermometer className="w-64 h-64" />}
        </div>

        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
                <Sparkles className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-serif font-bold text-emerald-900">Stabilized</h2>
                <p className="text-emerald-700 text-xl font-medium">
                  {type === 'bp' && "Blood Pressure Stabilized. Excellent work, Seeker."}
                  {type === 'hydration' && "Hydration levels returning to normal."}
                  {type === 'sugar' && "Glucose levels stabilized. Great discipline."}
                </p>
              </div>
              <div className="bg-white/50 p-6 rounded-[32px] border border-emerald-100 inline-flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-6 h-6" />
                </div>
                <span className="font-bold text-emerald-900">+3% Vitality Score • +50 Dharma</span>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-6 bg-emerald-500 text-white rounded-[28px] font-bold text-2xl shadow-xl shadow-emerald-200 hover:scale-[1.02] transition-transform"
              >
                Return to Dashboard
              </button>
            </motion.div>
          ) : (
            <div key="content">
              {renderContent()}
            </div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-4 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
