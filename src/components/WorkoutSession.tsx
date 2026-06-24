import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Clock, Activity, Flame, Wind } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface Interval {
  type: 'work' | 'rest';
  name: string;
  duration: number;
  videoId?: string;
}

interface WorkoutSessionProps {
  intervals: Interval[];
  onComplete: () => void;
  onClose: () => void;
}

export const WorkoutSession = ({ intervals, onComplete, onClose }: WorkoutSessionProps) => {
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [readyCountdown, setReadyCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(intervals[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentInterval = intervals[currentIntervalIndex];

  // Ready Countdown Logic
  useEffect(() => {
    if (readyCountdown > 0) {
      const timer = setTimeout(() => setReadyCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsActive(true);
    }
  }, [readyCountdown]);

  // Main Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (currentIntervalIndex < intervals.length - 1) {
        // Transition to next interval
        const nextIndex = currentIntervalIndex + 1;
        setCurrentIntervalIndex(nextIndex);
        setTimeLeft(intervals[nextIndex].duration);
        // If next is work, show a short ready countdown? 
        // For now, just transition directly
      } else {
        setIsActive(false);
        setIsFinished(true);
        setTimeout(onComplete, 2000);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, currentIntervalIndex, intervals, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black flex flex-col overflow-hidden"
    >
      {/* Top Layer: YouTube Video or Breathing Animation */}
      <div className="flex-1 relative bg-stone-900">
        {currentInterval.type === 'work' ? (
          isActive && (
            <iframe
              key={currentInterval.videoId}
              src={`https://www.youtube.com/embed/${currentInterval.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&mute=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-sage-light/10">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-64 h-64 bg-sage-primary rounded-full blur-3xl"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Wind className="w-16 h-16 text-sage-primary mb-6 animate-pulse" />
              <h3 className="text-4xl font-serif text-white mb-4">Metabolic Recovery</h3>
              <p className="text-xl text-sage-primary/80 max-w-md">Deep nasal breathing. Lower your heart rate for the next peak.</p>
            </div>
          </div>
        )}
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Ready Overlay */}
        <AnimatePresence>
          {readyCountdown > 0 && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[60]"
            >
              <motion.div
                key={readyCountdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-black text-sage-primary"
              >
                {readyCountdown}
              </motion.div>
              <p className="text-2xl font-bold text-white mt-8 tracking-widest uppercase">Get Ready</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Layer: Timer & Info */}
      <div className="h-[35vh] bg-white p-8 flex flex-col items-center justify-center relative">
        <div className="text-center">
          <div className={cn(
            "text-sm font-bold tracking-widest uppercase mb-2 flex items-center justify-center gap-2",
            currentInterval.type === 'work' ? "text-red-500" : "text-sage-primary"
          )}>
            {currentInterval.type === 'work' ? <Flame className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {currentInterval.name}
          </div>
          <div className={cn(
            "text-9xl font-black tabular-nums tracking-tighter transition-colors",
            timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-900"
          )}>
            {timeLeft}
            <span className="text-2xl font-bold text-gray-300 ml-2">s</span>
          </div>
          
          {/* Interval Progress */}
          <div className="mt-4 flex gap-2 justify-center">
            {intervals.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIntervalIndex ? "w-8 bg-sage-primary" : 
                  i < currentIntervalIndex ? "w-4 bg-green-500" : "w-4 bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-100">
          <motion.div 
            key={currentIntervalIndex}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / currentInterval.duration) * 100}%` }}
            className={cn(
              "h-full transition-colors",
              currentInterval.type === 'work' ? "bg-red-500" : "bg-sage-primary"
            )}
          />
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {isFinished && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Session Complete!</h3>
              <p className="text-gray-500">Metabolism Ignited.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
