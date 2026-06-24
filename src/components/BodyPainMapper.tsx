import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Accessibility, 
  ChevronLeft, 
  RotateCcw, 
  Activity, 
  Check, 
  AlertCircle, 
  Info,
  ChevronRight,
  X,
  Zap,
  Flame,
  Wind,
  Droplets,
  Thermometer,
  Save,
  Trash2
} from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface PainEntry {
  part: string;
  intensity: number;
  sensation: string[];
  duration: 'Acute' | 'Chronic';
  mobilityImpact: boolean;
  comment: string;
  timestamp: Date;
  view: 'front' | 'back';
}

interface BodyPainMapperProps {
  onBack: () => void;
  onSave: (entry: PainEntry) => void;
  existingEntries: PainEntry[];
  onDelete: (index: number) => void;
}

const BODY_PARTS = {
  front: [
    { id: 'Head', path: 'M100,20 C115,20 125,35 125,55 C125,75 115,90 100,90 C85,90 75,75 75,55 C75,35 85,20 100,20', label: 'Head' },
    { id: 'Neck', path: 'M85,90 L115,90 L112,105 L88,105 Z', label: 'Neck' },
    { id: 'Chest', path: 'M70,105 L130,105 L135,160 L65,160 Z', label: 'Chest' },
    { id: 'Stomach', path: 'M65,160 L135,160 L130,220 L70,220 Z', label: 'Abdomen' },
    { id: 'Right Shoulder', path: 'M130,105 L155,115 L150,135 L135,130 Z', label: 'Right Shoulder' },
    { id: 'Left Shoulder', path: 'M70,105 L45,115 L50,135 L65,130 Z', label: 'Left Shoulder' },
    { id: 'Right Arm', path: 'M155,115 L175,180 L160,185 L145,135 Z', label: 'Right Arm' },
    { id: 'Left Arm', path: 'M45,115 L25,180 L40,185 L55,135 Z', label: 'Left Arm' },
    { id: 'Right Thigh', path: 'M100,220 L130,220 L125,300 L105,300 Z', label: 'Right Thigh' },
    { id: 'Left Thigh', path: 'M100,220 L70,220 L75,300 L95,300 Z', label: 'Left Thigh' },
    { id: 'Right Knee', path: 'M105,300 L125,300 L122,325 L108,325 Z', label: 'Right Knee' },
    { id: 'Left Knee', path: 'M95,300 L75,300 L78,325 L92,325 Z', label: 'Left Knee' },
    { id: 'Right Shin', path: 'M108,325 L122,325 L118,385 L105,385 Z', label: 'Right Shin' },
    { id: 'Left Shin', path: 'M92,325 L78,325 L82,385 L95,385 Z', label: 'Left Shin' },
  ],
  back: [
    { id: 'Back Head', path: 'M100,20 C115,20 125,35 125,55 C125,75 115,90 100,90 C85,90 75,75 75,55 C75,35 85,20 100,20', label: 'Head (Back)' },
    { id: 'Upper Back', path: 'M70,105 L130,105 L135,160 L65,160 Z', label: 'Upper Back' },
    { id: 'Lower Back', path: 'M65,160 L135,160 L130,220 L70,220 Z', label: 'Lower Back' },
    { id: 'Right Scapula', path: 'M110,115 L130,115 L135,145 L115,145 Z', label: 'Right Scapula' },
    { id: 'Left Scapula', path: 'M90,115 L70,115 L65,145 L85,145 Z', label: 'Left Scapula' },
    { id: 'Glutes', path: 'M70,220 L130,220 L135,260 L65,260 Z', label: 'Glutes' },
    { id: 'Right Hamstring', path: 'M100,260 L130,260 L125,320 L105,320 Z', label: 'Right Hamstring' },
    { id: 'Left Hamstring', path: 'M100,260 L70,260 L75,320 L95,320 Z', label: 'Left Hamstring' },
    { id: 'Right Calf', path: 'M105,320 L122,320 L118,385 L105,385 Z', label: 'Right Calf' },
    { id: 'Left Calf', path: 'M95,320 L78,320 L82,385 L95,385 Z', label: 'Left Calf' },
  ]
};

const SENSATIONS = ['Sharp', 'Dull', 'Throbbing', 'Numb', 'Burning', 'Aching', 'Stiff'];

export function BodyPainMapper({ onBack, onSave, existingEntries, onDelete }: BodyPainMapperProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [duration, setDuration] = useState<'Acute' | 'Chronic'>('Acute');
  const [mobilityImpact, setMobilityImpact] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePartClick = (partId: string) => {
    setSelectedPart(partId);
    // Haptic feedback simulation
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const toggleSensation = (s: string) => {
    setSelectedSensations(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    if (!selectedPart) return;
    setIsSaving(true);
    
    const entry: PainEntry = {
      part: selectedPart,
      intensity,
      sensation: selectedSensations,
      duration,
      mobilityImpact,
      comment: notes,
      timestamp: new Date(),
      view
    };

    // Data Absorption Animation Delay
    setTimeout(() => {
      onSave(entry);
      setSelectedPart(null);
      setIntensity(5);
      setSelectedSensations([]);
      setDuration('Acute');
      setMobilityImpact(false);
      setNotes('');
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="space-y-8 relative min-h-[800px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-sage-primary">Body Pain Mapper</h2>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Interactive 3D Clinical Interface</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setView('front')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              view === 'front' ? "bg-white text-sage-primary shadow-sm" : "text-gray-400"
            )}
          >
            Front
          </button>
          <button 
            onClick={() => setView('back')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              view === 'back' ? "bg-white text-sage-primary shadow-sm" : "text-gray-400"
            )}
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3D Anatomical Engine */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-b from-sage-primary/5 to-transparent pointer-events-none" />
          
          <motion.div 
            key={view}
            initial={{ rotateY: view === 'front' ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative w-full max-w-sm aspect-[1/2]"
          >
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl filter blur-[0.5px]">
              {/* Glassmorphism Body Silhouette */}
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(240,245,240,0.4)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Base Silhouette */}
              <path 
                d="M100,20 C115,20 125,35 125,55 C125,75 115,90 100,90 C85,90 75,75 75,55 C75,35 85,20 100,20 M85,90 L115,90 L130,105 L155,115 L175,180 L160,185 L145,135 L135,160 L130,220 L130,260 L125,320 L118,385 L105,385 L100,320 L95,385 L82,385 L75,320 L70,260 L70,220 L65,160 L55,135 L40,185 L25,180 L45,115 L70,105 Z" 
                fill="url(#bodyGradient)"
                stroke="rgba(45, 90, 39, 0.1)"
                strokeWidth="2"
              />

              {/* Interactive Parts */}
              {BODY_PARTS[view].map((part) => {
                const isSelected = selectedPart === part.id;
                const existingEntry = existingEntries.find(e => e.part === part.id && e.view === view);
                const intensityColor = existingEntry 
                  ? existingEntry.intensity > 7 ? '#ef4444' : '#f59e0b'
                  : isSelected ? '#2D5A27' : 'transparent';

                return (
                  <g key={part.id} className="group cursor-pointer" onClick={() => handlePartClick(part.id)}>
                    <path 
                      d={part.path}
                      fill={isSelected ? 'rgba(45, 90, 39, 0.1)' : 'transparent'}
                      className="transition-all duration-300 group-hover:fill-sage-primary/5"
                    />
                    {/* Glow Effect */}
                    {(isSelected || existingEntry) && (
                      <motion.path 
                        d={part.path}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0.4, 0.8, 0.4],
                          fill: existingEntry ? intensityColor : '#2D5A27'
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        filter="url(#glow)"
                        className="pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* View Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm">
            <RotateCcw className="w-4 h-4 text-sage-primary animate-spin-slow" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{view} View</span>
          </div>
        </div>

        {/* Precision Data Panel (Sidebar) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {selectedPart ? (
              <motion.div 
                key="sidebar"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="bg-gray-50 rounded-[48px] p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden"
              >
                {isSaving && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-sage-primary/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white space-y-4"
                  >
                    <Zap className="w-12 h-12 animate-bounce" />
                    <p className="text-xl font-serif font-bold">Absorbing Data...</p>
                  </motion.div>
                )}

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinical Intelligence</p>
                    <h3 className="text-3xl font-serif font-bold text-sage-primary">{selectedPart}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPart(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intensity</label>
                    <span className={cn(
                      "text-2xl font-bold",
                      intensity > 7 ? "text-rose-500" : intensity > 4 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {intensity}/10
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${(intensity / 10) * 100}%` }}
                    />
                  </div>
                  <input 
                    type="range" min="1" max="10" value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full h-2 absolute opacity-0 cursor-pointer z-10"
                  />
                </div>

                {/* Sensation Chips */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sensation Type</label>
                  <div className="flex flex-wrap gap-2">
                    {SENSATIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSensation(s)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                          selectedSensations.includes(s)
                            ? "bg-sage-primary text-white border-sage-primary shadow-md shadow-sage-primary/20"
                            : "bg-white text-gray-400 border-gray-100 hover:border-sage-primary/30"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Mobility */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</label>
                    <div className="flex bg-white p-1 rounded-xl border border-gray-100">
                      {(['Acute', 'Chronic'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                            duration === d ? "bg-sage-primary text-white" : "text-gray-400"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mobility Impact</label>
                    <button
                      onClick={() => setMobilityImpact(!mobilityImpact)}
                      className={cn(
                        "w-full py-2 rounded-xl text-[10px] font-bold transition-all border flex items-center justify-center gap-2",
                        mobilityImpact 
                          ? "bg-rose-50 text-rose-600 border-rose-100" 
                          : "bg-white text-gray-400 border-gray-100"
                      )}
                    >
                      {mobilityImpact ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      {mobilityImpact ? 'Affects Movement' : 'No Impact'}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinical Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the sensation in your own words..."
                    className="w-full p-6 bg-white border border-gray-100 rounded-[32px] outline-none focus:ring-2 focus:ring-sage-primary/20 min-h-[120px] resize-none text-sm leading-relaxed"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-6 bg-sage-primary text-white rounded-[28px] font-bold text-xl shadow-xl shadow-sage-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-6 h-6" />
                  Save Pain Data
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-dashed border-gray-200 rounded-[48px] p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300">
                  <Accessibility className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-serif font-bold text-gray-400">Select an Area</h4>
                  <p className="text-sm text-gray-400 max-w-[200px]">Tap on the anatomical model to begin clinical logging.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Pain Points Summary */}
          <div className="bg-white border border-gray-100 rounded-[48px] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-serif font-bold text-sage-primary">Active Pain Points</h4>
              <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {existingEntries.length} Logged
              </span>
            </div>

            <div className="space-y-3">
              {existingEntries.length > 0 ? (
                existingEntries.map((entry, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                        entry.intensity > 7 ? "bg-rose-500" : entry.intensity > 4 ? "bg-amber-500" : "bg-emerald-500"
                      )}>
                        {entry.intensity}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{entry.part}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{entry.sensation.join(', ') || 'General'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(idx)}
                      className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-300 text-sm italic">No active pain points logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
