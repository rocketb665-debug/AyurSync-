import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Edit2,
  X,
  Calendar as CalendarIcon,
  Bell,
  Heart,
  Info,
  Mic,
  Moon,
  Sun,
  Zap,
  Activity,
  Brain,
  Wind
} from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { AyurSyncLoader, AyurSyncLoaderModal } from './AyurSyncLoader';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration?: string;
  type: 'Medication' | 'Appointment' | 'Fasting' | 'Other' | 'Vibe' | 'Pain' | 'Wellness' | 'Lunar' | 'Fever' | 'Consultation';
  vibe?: 'Energy High' | 'Need Rest' | 'In Pain' | 'Focused' | 'Bloated' | 'Fever';
  notes?: string;
  date: string; // ISO string YYYY-MM-DD
}

interface HealthCalendarViewProps {
  onBack: () => void;
  gender?: string;
  menstrualData?: {
    lastPeriodDate?: string;
    cycleLength?: number;
    periodLength?: number;
    history?: Array<{ start: string; end: string }>;
  };
  painLogs?: Array<{ date: string; intensity: number }>;
  events?: CalendarEvent[];
  onUpdateEvents?: (events: CalendarEvent[]) => void;
}

export function HealthCalendarView({ 
  onBack, 
  gender, 
  menstrualData, 
  painLogs = [], 
  events = [], 
  onUpdateEvents 
}: HealthCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isViewingSummary, setIsViewingSummary] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'Wellness',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration: '30 mins'
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleAddEvent = (overrides?: Partial<CalendarEvent>) => {
    if (!selectedDate) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      const event: CalendarEvent = {
        id: editingEventId || Date.now().toString(),
        title: overrides?.title || newEvent.title || 'Health Log',
        time: overrides?.time || newEvent.time || '10:00',
        duration: overrides?.duration || newEvent.duration,
        type: overrides?.type || (newEvent.type as any) || 'Other',
        vibe: overrides?.vibe || newEvent.vibe,
        notes: overrides?.notes || newEvent.notes,
        date: selectedDate.toISOString().split('T')[0]
      };

      let newEvents;
      if (editingEventId) {
        newEvents = events.map(e => e.id === editingEventId ? event : e);
      } else {
        newEvents = [...events, event];
      }

      if (onUpdateEvents) {
        onUpdateEvents(newEvents);
      } else {
        localStorage.setItem('ayursync_calendar_events', JSON.stringify(newEvents));
      }
      setIsSaving(false);
      setIsAddingEvent(false);
      setIsViewingSummary(false);
      setEditingEventId(null);
      setNewEvent({ type: 'Wellness', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), duration: '30 mins' });
    }, 1500);
  };

  const deleteEvent = (id: string) => {
    const newEvents = events.filter(e => e.id !== id);
    if (onUpdateEvents) {
      onUpdateEvents(newEvents);
    } else {
      localStorage.setItem('ayursync_calendar_events', JSON.stringify(newEvents));
    }
  };

  const clearAllEvents = () => {
    if (onUpdateEvents) {
      onUpdateEvents([]);
    } else {
      localStorage.setItem('ayursync_calendar_events', JSON.stringify([]));
    }
    setShowClearConfirm(false);
  };

  const isPeriodDay = (date: Date) => {
    if (gender !== 'Female' || !menstrualData?.history) return false;
    const dateStr = date.toISOString().split('T')[0];
    return menstrualData.history.some(h => dateStr >= h.start && dateStr <= h.end);
  };

  const isPredictedPeriodDay = (date: Date) => {
    if (gender !== 'Female' || !menstrualData?.lastPeriodDate) return false;
    const lastDate = new Date(menstrualData.lastPeriodDate);
    const cycleLength = menstrualData.cycleLength || 28;
    const periodLength = menstrualData.periodLength || 5;
    
    const diffTime = date.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return false;
    const dayInCycle = diffDays % cycleLength;
    return dayInCycle < periodLength;
  };

  const isSelfCareWindow = (date: Date) => {
    if (gender !== 'Female' || !menstrualData?.lastPeriodDate) return false;
    const lastDate = new Date(menstrualData.lastPeriodDate);
    const cycleLength = menstrualData.cycleLength || 28;
    
    const diffTime = date.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return false;
    const dayInCycle = diffDays % cycleLength;
    return dayInCycle >= (cycleLength - 3) && dayInCycle < cycleLength;
  };

  const isRecoveryWindow = (date: Date) => {
    const threeDaysAgo = new Date(date);
    threeDaysAgo.setDate(date.getDate() - 3);
    const dateStr = threeDaysAgo.toISOString().split('T')[0];
    return painLogs.some(log => log.date === dateStr && log.intensity > 5);
  };

  const getMoonPhase = (date: Date) => {
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const cycleLength = 29.5305882;
    const diff = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (diff % cycleLength) / cycleLength;
    const normalized = phase < 0 ? phase + 1 : phase;
    
    if (normalized < 0.05 || normalized > 0.95) return 'new';
    if (normalized > 0.45 && normalized < 0.55) return 'full';
    return null;
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white text-gray-400 hover:text-sage-primary rounded-2xl transition-all shadow-sm border border-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-serif font-bold text-sage-primary tracking-tight">Bio-Log Calendar</h2>
          <button 
            onClick={() => setShowLegend(true)}
            className="p-1 text-gray-400 hover:text-sage-primary transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="p-3 text-gray-400 hover:text-red-500 transition-colors"
          title="Clear all logs"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <span className="px-4 font-bold text-gray-700 min-w-[140px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderGrid = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-gray-50 bg-gray-50/30" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const dayEvents = events.filter(e => e.date === dateStr);
      const period = isPeriodDay(date);
      const predicted = isPredictedPeriodDay(date);
      const selfCare = isSelfCareWindow(date);
      const recovery = isRecoveryWindow(date);
      const moon = getMoonPhase(date);

      const hasPain = dayEvents.some(e => e.type === 'Pain');
      const hasFever = dayEvents.some(e => e.type === 'Fever');
      const hasLunar = dayEvents.some(e => e.type === 'Lunar') || period;
      const hasWellness = dayEvents.some(e => e.type === 'Wellness');
      const hasDoctor = dayEvents.some(e => e.type === 'Appointment' || e.type === 'Consultation');
      const hasVitals = dayEvents.some(e => e.type === 'Pain' || e.type === 'Fever'); // Orange dot in legend is vitals

      const isHighPriority = hasPain || hasFever || hasDoctor;

      // Check for reminder due in the next 2 hours
      const isDueSoon = isToday && dayEvents.some(e => {
        const [hours, minutes] = e.time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);
        const now = new Date();
        const diff = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diff > 0 && diff <= 2;
      });

      days.push(
        <motion.button 
          key={d}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setSelectedDate(date);
            if (dayEvents.length > 0) {
              setIsViewingSummary(true);
            } else {
              setIsViewingSummary(false);
            }
            setIsAddingEvent(true);
          }}
          className={cn(
            "h-32 border-b border-r border-gray-100 p-2 transition-all relative group text-left w-full overflow-hidden",
            isSelected ? "bg-sage-light/10" : "hover:bg-gray-50/50",
            isToday && "bg-sage-light/5",
            selfCare && "bg-purple-50/50",
            recovery && "bg-orange-50/30"
          )}
        >
          {(recovery || (predicted && !period)) && (
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "absolute inset-0 pointer-events-none",
                recovery ? "bg-orange-400/20" : "bg-rose-400/10"
              )}
            />
          )}

          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
              <span className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold",
                isToday ? "bg-sage-primary text-white" : "text-gray-400",
                isSelected && !isToday && "border-2 border-sage-primary text-sage-primary"
              )}>
                {d}
              </span>
              {moon && (
                <div className="text-gray-400">
                  {moon === 'full' ? <Sun className="w-3 h-3 fill-amber-400 text-amber-400" /> : <Moon className="w-3 h-3 fill-gray-400" />}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {period && <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.4)]" />}
                {predicted && !period && <div className="w-2 h-2 rounded-full bg-rose-200" />}
                {selfCare && <div className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.4)]" />}
              </div>
              <div className="flex gap-1 flex-wrap justify-end max-w-[40px]">
                {hasDoctor && (
                  <motion.div 
                    animate={isDueSoon ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]" 
                  />
                )}
                {hasVitals && (
                  <motion.div 
                    animate={isDueSoon ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.6)]" 
                  />
                )}
                {hasWellness && (
                  <motion.div 
                    animate={isDueSoon ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" 
                  />
                )}
                {hasLunar && <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </div>
            </div>
          </div>
          
          <div className="mt-2 space-y-1 overflow-hidden pointer-events-none relative z-10">
            {recovery && !hasPain && (
              <p className="text-[8px] text-orange-600 font-bold uppercase tracking-tighter leading-tight">
                Recovery Check?
              </p>
            )}
            {selfCare && (
              <p className="text-[8px] text-purple-600 font-bold uppercase tracking-tighter leading-tight">
                Self-Care
              </p>
            )}
            {dayEvents.slice(0, 1).map(event => (
              <div 
                key={event.id}
                className="text-[9px] px-1.5 py-0.5 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm truncate font-bold text-gray-600 flex items-center gap-1"
              >
                {event.vibe ? (
                  <span className="text-[10px]">
                    {event.vibe === 'Energy High' ? '⚡' : 
                     event.vibe === 'Need Rest' ? '🌙' : 
                     event.vibe === 'In Pain' ? '🩹' : 
                     event.vibe === 'Focused' ? '🧠' : 
                     event.vibe === 'Fever' ? '🤒' : '☁️'}
                  </span>
                ) : (
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    event.type === 'Medication' ? "bg-blue-400" :
                    event.type === 'Appointment' ? "bg-sage-primary" :
                    event.type === 'Fasting' ? "bg-amber-400" : 
                    event.type === 'Fever' ? "bg-orange-500" : "bg-gray-400"
                  )} />
                )}
                {event.title}
              </div>
            ))}
          </div>
        </motion.button>
      );
    }

    return (
      <div className="bg-white border-t border-l border-gray-100 rounded-3xl overflow-hidden shadow-sm grid grid-cols-7">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-r border-gray-100 bg-gray-50/50">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setNewEvent(prev => ({ ...prev, notes: "Feeling a bit of a headache since morning. (Simulated)" }));
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewEvent(prev => ({ ...prev, notes: transcript }));
    };
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F8] min-h-screen p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {renderHeader()}

        <div className="w-full">
          {renderGrid()}
        </div>
      </div>

      {/* Bio-Log Overlay */}
      <AnimatePresence>
        {isAddingEvent && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingEvent(false)}
              className="absolute inset-0 bg-sage-primary/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) {
                  setIsAddingEvent(false);
                  setIsViewingSummary(false);
                  setEditingEventId(null);
                }
              }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-t-[48px] sm:rounded-[48px] p-10 shadow-2xl border border-white/50 space-y-8 touch-none"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-3xl font-serif font-bold text-sage-primary">
                    {isViewingSummary ? 'Day Summary' : (editingEventId ? 'Edit Bio-Log' : 'Bio-Log Check-in')}
                  </h3>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {selectedDate?.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {!isViewingSummary && (
                    <p className="text-[10px] font-bold text-sage-primary/60 uppercase tracking-tighter">
                      Dr. Kavya needs this to personalize your recovery plan for this day.
                    </p>
                  )}
                </div>
                <button onClick={() => {
                  setIsAddingEvent(false);
                  setIsViewingSummary(false);
                  setEditingEventId(null);
                }} className="p-3 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-10">
                {isViewingSummary ? (
                  <div className="space-y-6">
                    {events.filter(e => e.date === selectedDate?.toISOString().split('T')[0]).map(event => (
                      <div key={event.id} className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {event.vibe === 'Energy High' ? '⚡' : 
                                 event.vibe === 'Need Rest' ? '🌙' : 
                                 event.vibe === 'In Pain' ? '🩹' : 
                                 event.vibe === 'Fever' ? '🤒' : 
                                 event.vibe === 'Focused' ? '🧠' : '☁️'}
                              </span>
                              <h4 className="text-xl font-bold text-gray-800">{event.title}</h4>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.time}
                              </div>
                              {event.duration && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-4 h-4" />
                                  {event.duration}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingEventId(event.id);
                                setNewEvent({ ...event });
                                setIsViewingSummary(false);
                              }}
                              className="p-3 text-gray-400 hover:text-sage-primary hover:bg-sage-light/10 rounded-xl transition-all"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm("Remove this reminder?")) {
                                  deleteEvent(event.id);
                                  if (events.filter(e => e.date === selectedDate?.toISOString().split('T')[0]).length <= 1) {
                                    setIsAddingEvent(false);
                                    setIsViewingSummary(false);
                                  }
                                }
                              }}
                              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        {event.notes && (
                          <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed italic">
                            "{event.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setIsViewingSummary(false)}
                      className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-bold hover:border-sage-primary hover:text-sage-primary transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Another Log
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Vibe Selector */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">How's the Body?</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: 'Energy High', icon: '⚡', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                          { label: 'Need Rest', icon: '🌙', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                          { label: 'In Pain', icon: '🩹', color: 'bg-red-50 text-red-600 border-red-100' },
                          { label: 'Fever', icon: '🤒', color: 'bg-orange-50 text-orange-600 border-orange-100' },
                          { label: 'Focused', icon: '🧠', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                          { label: 'Bloated', icon: '☁️', color: 'bg-gray-50 text-gray-600 border-gray-100' }
                        ].map((vibe) => (
                          <button
                            key={vibe.label}
                            onClick={() => {
                              setNewEvent({ 
                                ...newEvent, 
                                vibe: vibe.label as any, 
                                title: vibe.label, 
                                type: vibe.label === 'In Pain' ? 'Pain' : 
                                      vibe.label === 'Fever' ? 'Fever' : 'Wellness' 
                              });
                            }}
                            className={cn(
                              "flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all font-bold text-sm",
                              newEvent.vibe === vibe.label ? vibe.color : "bg-white border-transparent text-gray-400 hover:bg-gray-50"
                            )}
                          >
                            <span className="text-xl">{vibe.icon}</span>
                            {vibe.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time & Duration */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Specific Time</label>
                        <div className="relative">
                          <input 
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sage-primary/20 outline-none transition-all font-bold text-gray-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Duration (Opt)</label>
                        <select 
                          value={newEvent.duration}
                          onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sage-primary/20 outline-none transition-all font-bold text-gray-700 appearance-none"
                        >
                          <option value="15 mins">15 mins</option>
                          <option value="30 mins">30 mins</option>
                          <option value="1 hour">1 hour</option>
                          <option value="2 hours">2 hours</option>
                        </select>
                      </div>
                    </div>

                    {/* Context-Aware Reminders */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Recommended Logs</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(gender === 'Female' ? ['Cycle Day', 'Iron Intake', 'Skin Health'] : ['Muscle Recovery', 'Stress Check', 'Meditation']).map((rec) => (
                          <button
                            key={rec}
                            onClick={() => {
                              handleAddEvent({ 
                                title: rec, 
                                type: rec === 'Cycle Day' ? 'Lunar' : 'Wellness',
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                              });
                            }}
                            className="p-4 bg-sage-light/10 border border-sage-primary/10 rounded-2xl text-left hover:bg-sage-light/20 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-bold text-sage-primary">{rec}</span>
                              <Plus className="w-4 h-4 text-sage-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Note */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Specialist Note</label>
                      <div className="relative">
                        <textarea 
                          value={newEvent.notes || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                          placeholder="Tell the Council what's happening..."
                          className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[32px] focus:ring-2 focus:ring-sage-primary/20 outline-none transition-all min-h-[120px] resize-none text-gray-700"
                        />
                        <button 
                          onClick={startListening}
                          className={cn(
                            "absolute right-4 bottom-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                            isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-sage-primary hover:bg-sage-light/20"
                          )}
                        >
                          <Mic className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          setIsAddingEvent(false);
                          setEditingEventId(null);
                        }}
                        className="py-5 bg-gray-100 text-gray-500 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleAddEvent()}
                        className="py-5 bg-sage-primary text-white rounded-2xl font-bold text-lg hover:bg-sage-dark transition-all shadow-xl shadow-sage-primary/20 flex items-center justify-center gap-3"
                      >
                        <AyurSyncLoader size="small" />
                        {editingEventId ? 'Update Bio-Log' : 'Save Bio-Log'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legend Modal */}
      <AnimatePresence>
        {showLegend && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLegend(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[48px] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-sage-primary">Visual Language</h3>
                <button onClick={() => setShowLegend(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                {[
                  { color: 'bg-red-500', label: 'High Priority', desc: 'Doctor, Surgery, Emergency', shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.4)]' },
                  { color: 'bg-green-500', label: 'Wellness/Routine', desc: 'Meditation, Yoga, Fasting', shadow: 'shadow-[0_0_8px_rgba(34,197,94,0.4)]' },
                  { color: 'bg-orange-500', label: 'Vitals Tracking', desc: 'BP, Sugar, Weight check', shadow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]' },
                  { color: 'bg-rose-400', label: 'Predicted Lunar Cycle', desc: 'For Females', shadow: 'shadow-[0_0_8px_rgba(251,113,133,0.4)]' }
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-gray-50 transition-colors">
                    <div className={cn("w-4 h-4 rounded-full shrink-0 mt-1", item.color, item.shadow)} />
                    <div className="space-y-1">
                      <p className="font-bold text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowLegend(false)}
                className="w-full py-4 bg-sage-primary text-white rounded-2xl font-bold hover:bg-sage-dark transition-all"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Clear All Logs?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone. All your bio-logs will be permanently deleted.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={clearAllEvents}
                  className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSaving && <AyurSyncLoaderModal />}
      </AnimatePresence>
    </div>
  );
}
