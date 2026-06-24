import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, CheckCircle2, Play, Utensils, Pill, Clock, Flame, X, Activity, ChevronDown, Calendar } from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { WorkoutSession } from './WorkoutSession';
import { ProtocolOverview } from './ProtocolOverview';

interface Task {
  id: string;
  time: string;
  hour: number;
  title: string;
  type: 'workout' | 'meal' | 'supplement';
  specialist: string;
  actionText: string;
  completed: boolean;
  details?: any;
}

interface MetaShredActiveZoneProps {
  onBack: () => void;
}

export const MetaShredActiveZone = ({ onBack }: MetaShredActiveZoneProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't0',
      time: '05:00 AM',
      hour: 5,
      title: 'Waking & Hydration',
      type: 'supplement',
      specialist: 'Kavya',
      actionText: 'Log Hydration',
      completed: false,
      details: {
        note: 'Drink 500ml of warm copper-charged water.'
      }
    },
    {
      id: 't1',
      time: '07:00 AM',
      hour: 7,
      title: 'Veer’s Morning Ignitor',
      type: 'workout',
      specialist: 'Veer',
      actionText: 'Start Now',
      completed: false,
      details: {
        exercise: 'Composite Metabolic Block',
        isComposite: true,
        intervals: [
          { type: 'work', name: 'Squats', duration: 60, videoId: 'WlGj3ABffAw' },
          { type: 'rest', name: 'Metabolic Recovery', duration: 120 },
          { type: 'work', name: 'Pushups', duration: 60, videoId: 'tWjBnQX3if0' },
          { type: 'rest', name: 'Final Recovery', duration: 120 }
        ],
        coaching: "Ignite the Agni, Swami!"
      }
    },
    {
      id: 't2',
      time: '09:00 AM',
      hour: 9,
      title: 'Rohini’s Metabolic Breakfast',
      type: 'meal',
      specialist: 'Rohini',
      actionText: 'View Recipe',
      completed: false,
      details: {
        ingredients: ['Warm Spiced Oats', 'Cinnamon', 'Ginger', 'Almonds'],
        timer: 120 // 2 minutes mindful eating timer
      }
    },
    {
      id: 't3',
      time: '01:00 PM',
      hour: 13,
      title: 'Kavya’s Herb Ritual',
      type: 'supplement',
      specialist: 'Kavya',
      actionText: 'Log Intake',
      completed: false,
      details: {
        herbs: ['Triphala', 'Ashwagandha']
      }
    },
    {
      id: 't4',
      time: '10:00 PM',
      hour: 22,
      title: 'Wind Down Protocol',
      type: 'meal',
      specialist: 'Mira',
      actionText: 'Start Meditation',
      completed: false,
      details: {
        ingredients: ['No Devices', 'Guided Meditation'],
        timer: 300
      }
    },
    {
      id: 't5',
      time: '10:30 PM',
      hour: 22,
      title: 'Sleep Optimization',
      type: 'supplement',
      specialist: 'Aryan',
      actionText: 'Log Sleep',
      completed: false,
      details: {
        note: 'Deep recovery window starts now.'
      }
    }
  ]);

  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [activeWorkout, setActiveWorkout] = useState<Task | null>(null);
  const [activeMeal, setActiveMeal] = useState<Task | null>(null);
  const [showProtocol, setShowProtocol] = useState(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // Parallax Scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    container: scrollRef
  });
  
  const headerY = useTransform(scrollY, [0, 300], [0, -150]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const contentMargin = useTransform(scrollY, [0, 300], [0, -100]);

  // Timer state at top level to ensure stability
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Workout Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (!isResting && timeLeft % 2 === 0) {
          setRepCount(prev => prev + 1);
        }
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      if (!isResting && activeWorkout?.details?.rest) {
        setIsResting(true);
        setTimeLeft(activeWorkout.details.rest);
      } else if (activeWorkout) {
        completeTask(activeWorkout.id);
        closeWorkout();
      }
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, isResting, activeWorkout]);

  // Meal Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeMeal && isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (activeMeal && isTimerActive && timeLeft === 0) {
      completeTask(activeMeal.id);
      closeMeal();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, activeMeal]);

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    // Play subtle success haptic/sound (simulated)
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleTaskClick = (task: Task) => {
    if (task.hour > currentHour) return; // Locked

    if (task.type === 'workout') {
      setActiveWorkout(task);
      setTimeLeft(task.details.duration);
      setIsResting(false);
      setRepCount(0);
      setIsTimerActive(false);
    } else if (task.type === 'meal') {
      setActiveMeal(task);
      setTimeLeft(task.details.timer);
      setIsTimerActive(false);
    } else if (task.type === 'supplement') {
      completeTask(task.id);
    }
  };

  const closeWorkout = () => {
    setActiveWorkout(null);
    setIsTimerActive(false);
  };

  const closeMeal = () => {
    setActiveMeal(null);
    setIsTimerActive(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col overflow-hidden"
    >
      {/* Parallax Header Image */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        className="absolute top-0 left-0 right-0 h-[300px] z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover"
          alt="MetaShred Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F8FAFC]" />
      </motion.div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Day 1 of 21</h2>
            <p className="text-sm text-gray-500">Meta-Shred Protocol</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowProtocol(true)}
            className="w-10 h-10 bg-sage-primary/10 text-sage-primary rounded-full flex items-center justify-center hover:bg-sage-primary/20 transition-all"
          >
            <Calendar className="w-5 h-5" />
          </button>
          {/* Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sage-primary transition-all duration-1000 ease-out"
                strokeWidth="3"
                strokeDasharray={`${progressPercentage}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-gray-700">{progressPercentage}%</span>
          </div>
        </div>
      </header>

      {/* Roadmap */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10"
      >
        <motion.div style={{ marginTop: useTransform(scrollY, [0, 300], [200, 0]) }}>
          {tasks.map((task) => {
          const isLocked = task.hour > currentHour;
          
          return (
            <motion.div 
              key={task.id}
              layout
              className={cn(
                "relative bg-white rounded-3xl p-6 border transition-all",
                task.completed ? "border-green-200 bg-green-50/50" : 
                isLocked ? "border-gray-100 opacity-60" : "border-gray-200 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase",
                    task.completed ? "bg-green-100 text-green-700" :
                    isLocked ? "bg-gray-100 text-gray-500" : "bg-sage-light/30 text-sage-primary"
                  )}>
                    {task.time}
                  </div>
                  {task.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                {isLocked && <Clock className="w-5 h-5 text-gray-400" />}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className={cn(
                  "text-xl font-bold flex items-center gap-3",
                  task.completed ? "text-green-900" : "text-gray-900"
                )}>
                  {task.title}
                  {task.type === 'workout' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewVideoId(task.details.isComposite ? task.details.intervals[0].videoId : 'fSaYfvSpAMI');
                      }}
                      className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </h3>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  {task.type === 'workout' && <Activity className="w-4 h-4" />}
                  {task.type === 'meal' && <Utensils className="w-4 h-4" />}
                  {task.type === 'supplement' && <Pill className="w-4 h-4" />}
                  <span className="capitalize">{task.type}</span>
                </div>
                
                <button
                  onClick={() => handleTaskClick(task)}
                  disabled={isLocked || task.completed}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                    task.completed ? "bg-green-100 text-green-700" :
                    isLocked ? "bg-gray-100 text-gray-400" :
                    "bg-black text-white hover:bg-gray-800 active:scale-95 shadow-md"
                  )}
                >
                  {task.type === 'workout' && !task.completed && !isLocked && <Play className="w-4 h-4 fill-current" />}
                  {task.completed ? 'Completed' : isLocked ? 'Locked' : task.actionText}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Specialist Integration Note */}
        <div className="mt-12 p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000dd9c71fa82104a147e55ce76.png" 
              className="w-12 h-12 rounded-full object-cover border-2 border-sage-primary/20"
              alt="Dr. Kavya"
            />
            <div>
              <h4 className="font-bold text-gray-900">Dr. Kavya's Bio-Log Note</h4>
              <p className="text-xs text-sage-primary font-bold uppercase tracking-widest">Lead Medical Strategist</p>
            </div>
          </div>
          <p className="text-gray-600 italic leading-relaxed">
            "Your metabolic fire (Agni) is highest during the morning Kapha window. By performing the Morning Igniter before 8 AM, we bypass the natural sluggishness of this period and set a baseline for fat oxidation that lasts 14 hours. Don't skip the Golden Milk; it's the 'coolant' your system needs after this intensity."
          </p>
        </div>
      </motion.div>
    </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewVideoId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setPreviewVideoId(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&modestbranding=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button 
                onClick={() => setPreviewVideoId(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Workout Player Modal */}
      <AnimatePresence>
        {activeWorkout && (
          <WorkoutSession 
            intervals={activeWorkout.details.isComposite ? activeWorkout.details.intervals : [
              { type: 'work', name: activeWorkout.title, duration: activeWorkout.details.duration, videoId: 'fSaYfvSpAMI' }
            ]}
            onComplete={() => {
              completeTask(activeWorkout.id);
              closeWorkout();
            }}
            onClose={closeWorkout}
          />
        )}
      </AnimatePresence>

      {/* Protocol Overview Screen */}
      <AnimatePresence>
        {showProtocol && (
          <ProtocolOverview 
            currentDay={1}
            onBack={() => setShowProtocol(false)}
          />
        )}
      </AnimatePresence>

      {/* Precision Meal Module Modal */}
      <AnimatePresence>
        {activeMeal && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            <header className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{activeMeal.title}</h2>
              <button 
                onClick={closeMeal}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  Ayurvedic Ingredients
                </h3>
                <ul className="space-y-3">
                  {activeMeal.details.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-orange-800 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-sage-light/20 rounded-3xl p-8 border border-sage-primary/10 text-center space-y-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-sage-primary">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Mindful Eating Timer</h3>
                  <p className="text-gray-600">Chew properly and eat without distraction. Dr. Mira recommends 2 minutes of focused eating.</p>
                </div>
                
                <div className="text-6xl font-black tabular-nums text-sage-primary tracking-tighter py-4">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>

                <button 
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95",
                    isTimerActive ? "bg-gray-100 text-gray-900 hover:bg-gray-200" : "bg-sage-primary text-white hover:bg-sage-accent shadow-lg shadow-sage-primary/30"
                  )}
                >
                  {isTimerActive ? "Pause" : "Start Mindful Eating"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
