import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

type QuestionType = 'single-choice' | 'multi-choice' | 'text-input' | 'number-input' | 'dual-number-input' | 'dual-text-input';

interface Question {
  id: string;
  phase: number;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  placeholder2?: string;
  condition?: (answers: Record<string, any>) => boolean;
}

const questions: Question[] = [
  {
    id: 'daily_sleep',
    phase: 1,
    title: 'How many hours did you sleep last night?',
    subtitle: 'This helps Kabir track your recovery cycle.',
    type: 'number-input',
    placeholder: 'e.g., 7.5'
  },
  {
    id: 'sleep_times',
    phase: 1,
    title: 'What were your sleep and wake-up times?',
    type: 'dual-text-input',
    placeholder: 'Bedtime (e.g., 10:30 PM)',
    placeholder2: 'Wake-up (e.g., 6:30 AM)'
  },
  // Phase 1
  {
    id: 'primary_goal',
    phase: 1,
    title: 'What is the primary focus of your wellness journey?',
    subtitle: 'This helps Dr. Kavya map your long-term health roadmap.',
    type: 'single-choice',
    options: [
      { label: 'Weight Loss & Metabolic Health', value: 'weight_loss' },
      { label: 'Longevity & Vitality', value: 'longevity' },
      { label: 'Disease Management', value: 'disease_management' },
      { label: 'Mental Clarity & Focus', value: 'mental_clarity' },
      { label: 'Strength & Physical Performance', value: 'strength' }
    ]
  },
  {
    id: 'conditions',
    phase: 1,
    title: 'Are you currently managing any of these conditions?',
    subtitle: 'Select all that apply. This ensures our specialists provide safe, targeted advice.',
    type: 'multi-choice',
    options: [
      { label: 'Diabetes / Insulin Resistance', value: 'diabetes' },
      { label: 'Hypertension (High BP)', value: 'hypertension' },
      { label: 'High Cholesterol', value: 'cholesterol' },
      { label: 'PCOS / PCOD', value: 'pcos' },
      { label: 'None of the above', value: 'none' }
    ]
  },
  {
    id: 'dosha',
    phase: 1,
    title: 'How would you describe your natural body frame and digestion?',
    subtitle: 'This helps us understand your Ayurvedic Dosha archetype.',
    type: 'single-choice',
    options: [
      { label: 'Lean frame, fast/variable digestion (Vata)', value: 'lean_fast' },
      { label: 'Athletic build, strong/quick digestion (Pitta)', value: 'athletic_medium' },
      { label: 'Broad frame, slow/steady digestion (Kapha)', value: 'broad_slow' }
    ]
  },
  {
    id: 'activity',
    phase: 1,
    title: 'What is your baseline daily movement?',
    type: 'single-choice',
    options: [
      { label: 'Sedentary (Mostly sitting)', value: 'sedentary' },
      { label: 'Lightly Active (Some walking/movement)', value: 'lightly_active' },
      { label: 'Athlete (Regular intense training)', value: 'athlete' }
    ]
  },
  {
    id: 'sleep',
    phase: 1,
    title: 'On average, how many hours of restful sleep do you get?',
    type: 'single-choice',
    options: [
      { label: 'Under 5 hours', value: 'under_5' },
      { label: '6 to 8 hours', value: '6_to_8' },
      { label: '9+ hours', value: '9_plus' }
    ]
  },
  // Phase 2: Diabetes
  {
    id: 'diabetes_class',
    phase: 2,
    title: 'To help us tailor your glucose strategy, how is your condition classified?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('diabetes'),
    options: [
      { label: 'Type 1', value: 'type_1' },
      { label: 'Type 2', value: 'type_2' },
      { label: 'Pre-diabetic', value: 'pre_diabetic' }
    ]
  },
  {
    id: 'diabetes_fbs',
    phase: 2,
    title: 'To help Rohini perfect your lunch plan, what was your last fasting sugar reading?',
    subtitle: 'Enter value in mg/dL',
    type: 'number-input',
    placeholder: 'e.g., 110',
    condition: (a) => a.conditions?.includes('diabetes')
  },
  {
    id: 'diabetes_meds',
    phase: 2,
    title: 'Are you currently on any protocols for blood sugar management?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('diabetes'),
    options: [
      { label: 'Insulin', value: 'insulin' },
      { label: 'Oral medication', value: 'oral' },
      { label: 'Diet & Lifestyle only', value: 'none' }
    ]
  },
  {
    id: 'diabetes_crashes',
    phase: 2,
    title: 'How frequently do you experience energy crashes or "sugar fog"?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('diabetes'),
    options: [
      { label: 'Rarely', value: 'rarely' },
      { label: 'Occasionally', value: 'occasionally' },
      { label: 'Frequently', value: 'frequently' }
    ]
  },
  // Phase 2: Hypertension
  {
    id: 'bp_reading',
    phase: 2,
    title: 'For precise cardiovascular tracking, what was your most recent blood pressure reading?',
    type: 'dual-number-input',
    placeholder: 'Systolic (e.g., 120)',
    placeholder2: 'Diastolic (e.g., 80)',
    condition: (a) => a.conditions?.includes('hypertension')
  },
  {
    id: 'bp_sodium',
    phase: 2,
    title: 'Do you notice water retention or edema after consuming salty meals?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('hypertension'),
    options: [
      { label: 'Yes, noticeably', value: 'yes' },
      { label: 'Sometimes', value: 'sometimes' },
      { label: 'No', value: 'no' }
    ]
  },
  {
    id: 'bp_stress',
    phase: 2,
    title: 'How strongly do your heart rate spikes correlate with work or emotional triggers?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('hypertension'),
    options: [
      { label: 'High correlation', value: 'high' },
      { label: 'Moderate correlation', value: 'moderate' },
      { label: 'Low/No correlation', value: 'low' }
    ]
  },
  // Phase 2: Cholesterol
  {
    id: 'cholesterol_target',
    phase: 2,
    title: 'When managing your lipid profile, what is your primary clinical target?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('cholesterol'),
    options: [
      { label: 'Lowering LDL (Bad Cholesterol)', value: 'lower_ldl' },
      { label: 'Raising HDL (Good Cholesterol)', value: 'raise_hdl' },
      { label: 'Both / Overall Balance', value: 'both' }
    ]
  },
  {
    id: 'cholesterol_lifestyle',
    phase: 2,
    title: 'How often do you consume processed oils or fried foods in a typical week?',
    type: 'single-choice',
    condition: (a) => a.conditions?.includes('cholesterol'),
    options: [
      { label: '0-1 times', value: '0_1' },
      { label: '2-4 times', value: '2_4' },
      { label: '5+ times', value: '5_plus' }
    ]
  },
  // Phase 3: Weight Loss
  {
    id: 'weight_hurdle',
    phase: 3,
    title: 'What do you feel is the biggest psychological or physiological barrier to your weight goals?',
    type: 'single-choice',
    condition: (a) => a.primary_goal === 'weight_loss',
    options: [
      { label: 'Emotional eating / Stress', value: 'emotional' },
      { label: 'Late-night cravings', value: 'cravings' },
      { label: 'Slow metabolism / Plateau', value: 'metabolism' }
    ]
  },
  {
    id: 'weight_metrics',
    phase: 3,
    title: 'To set a realistic trajectory, what is your current weight and your target "Dream Weight"?',
    type: 'dual-number-input',
    placeholder: 'Current Weight (kg/lbs)',
    placeholder2: 'Target Weight (kg/lbs)',
    condition: (a) => a.primary_goal === 'weight_loss'
  },
  {
    id: 'weight_diet',
    phase: 3,
    title: 'What are your dietary preferences for this journey?',
    type: 'single-choice',
    condition: (a) => a.primary_goal === 'weight_loss',
    options: [
      { label: 'Vegetarian', value: 'veg' },
      { label: 'Vegan', value: 'vegan' },
      { label: 'Non-Vegetarian', value: 'non_veg' }
    ]
  },
  // Phase 3: Longevity & Strength
  {
    id: 'longevity_recovery',
    phase: 3,
    title: 'After intense physical exertion, how long does it typically take for muscle soreness to dissipate?',
    type: 'single-choice',
    condition: (a) => ['longevity', 'strength'].includes(a.primary_goal),
    options: [
      { label: '1 day (Fast recovery)', value: '1_day' },
      { label: '2 days (Average)', value: '2_days' },
      { label: '3+ days (Slow recovery)', value: '3_plus' }
    ]
  },
  {
    id: 'longevity_supplements',
    phase: 3,
    title: 'Are you currently utilizing any bio-hacking supplements or Ayurvedic herbs?',
    subtitle: 'e.g., Ashwagandha, Shilajit, Creatine, Omega-3s',
    type: 'text-input',
    placeholder: 'List your supplements...',
    condition: (a) => ['longevity', 'strength'].includes(a.primary_goal)
  }
];

export function HealthQuestionnaire({ onComplete, onCancel, initialData = {} }: { onComplete: (data: any) => void, onCancel: () => void, initialData?: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const visibleQuestions = useMemo(() => {
    return questions.filter(q => !q.condition || q.condition(answers));
  }, [answers]);

  // Ensure currentIndex is valid if visibleQuestions shrinks
  React.useEffect(() => {
    if (currentIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
      setCurrentIndex(visibleQuestions.length - 1);
    }
  }, [visibleQuestions, currentIndex]);

  const currentQuestion = visibleQuestions[currentIndex];
  const progress = ((currentIndex) / visibleQuestions.length) * 100;

  if (!currentQuestion) return null;

  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const currentAnswer = answers[currentQuestion.id];

  const handleSingleChoice = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setTimeout(handleNext, 400);
  };

  const handleMultiChoice = (value: string) => {
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || [];
      if (value === 'none') return { ...prev, [currentQuestion.id]: ['none'] };
      
      let newValues = current.includes(value) 
        ? current.filter((v: string) => v !== value)
        : [...current.filter((v: string) => v !== 'none'), value];
        
      return { ...prev, [currentQuestion.id]: newValues };
    });
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
  };

  const handleDualInput1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ 
      ...prev, 
      [currentQuestion.id]: { ...(prev[currentQuestion.id] || {}), val1: e.target.value } 
    }));
  };

  const handleDualInput2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers(prev => ({ 
      ...prev, 
      [currentQuestion.id]: { ...(prev[currentQuestion.id] || {}), val2: e.target.value } 
    }));
  };

  const canProceed = () => {
    if (!currentAnswer) return false;
    if (currentQuestion.type === 'multi-choice' && currentAnswer.length === 0) return false;
    if (currentQuestion.type === 'dual-number-input' || currentQuestion.type === 'dual-text-input') {
      return currentAnswer.val1 && currentAnswer.val2;
    }
    return true;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div 
          className="h-full bg-sage-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute top-8 left-8">
        <button 
          onClick={handleBack}
          className="p-3 bg-white text-gray-400 hover:text-sage-primary rounded-2xl shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-2xl px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-12"
          >
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold tracking-widest text-sage-primary uppercase">
                Phase {currentQuestion.phase}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
                {currentQuestion.title}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-gray-500 text-lg">{currentQuestion.subtitle}</p>
              )}
            </div>

            <div className="space-y-4">
              {currentQuestion.type === 'single-choice' && currentQuestion.options?.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleChoice(opt.value)}
                  className={cn(
                    "w-full p-6 rounded-3xl border text-left transition-all duration-300 flex items-center justify-between group",
                    currentAnswer === opt.value 
                      ? "bg-white border-sage-primary shadow-[0_0_20px_rgba(113,142,118,0.15)]" 
                      : "bg-white/50 border-gray-100 hover:bg-white hover:border-sage-primary/30 hover:shadow-sm"
                  )}
                >
                  <span className={cn(
                    "text-lg font-medium transition-colors",
                    currentAnswer === opt.value ? "text-sage-primary" : "text-gray-700 group-hover:text-gray-900"
                  )}>
                    {opt.label}
                  </span>
                  {currentAnswer === opt.value && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-6 h-6 text-sage-primary" />
                    </motion.div>
                  )}
                </button>
              ))}

              {currentQuestion.type === 'multi-choice' && currentQuestion.options?.map(opt => {
                const isSelected = (currentAnswer || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultiChoice(opt.value)}
                    className={cn(
                      "w-full p-6 rounded-3xl border text-left transition-all duration-300 flex items-center justify-between group",
                      isSelected 
                        ? "bg-white border-sage-primary shadow-[0_0_20px_rgba(113,142,118,0.15)]" 
                        : "bg-white/50 border-gray-100 hover:bg-white hover:border-sage-primary/30 hover:shadow-sm"
                    )}
                  >
                    <span className={cn(
                      "text-lg font-medium transition-colors",
                      isSelected ? "text-sage-primary" : "text-gray-700 group-hover:text-gray-900"
                    )}>
                      {opt.label}
                    </span>
                    <div className={cn(
                      "w-6 h-6 rounded-md border flex items-center justify-center transition-colors",
                      isSelected ? "bg-sage-primary border-sage-primary" : "border-gray-300 group-hover:border-sage-primary/50"
                    )}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}

              {(currentQuestion.type === 'text-input' || currentQuestion.type === 'number-input') && (
                <div className="relative">
                  <input
                    type={currentQuestion.type === 'number-input' ? 'number' : 'text'}
                    step={currentQuestion.type === 'number-input' ? '0.1' : undefined}
                    value={currentAnswer || ''}
                    onChange={handleTextInput}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-6 text-xl bg-white border border-gray-200 rounded-3xl focus:outline-none focus:border-sage-primary focus:ring-4 focus:ring-sage-primary/10 transition-all placeholder:text-gray-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canProceed()) handleNext();
                    }}
                  />
                </div>
              )}

              {(currentQuestion.type === 'dual-number-input' || currentQuestion.type === 'dual-text-input') && (
                <div className="flex gap-4">
                  <input
                    type={currentQuestion.type === 'dual-number-input' ? 'number' : 'text'}
                    value={currentAnswer?.val1 || ''}
                    onChange={handleDualInput1}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-6 text-xl bg-white border border-gray-200 rounded-3xl focus:outline-none focus:border-sage-primary focus:ring-4 focus:ring-sage-primary/10 transition-all placeholder:text-gray-300"
                    autoFocus
                  />
                  <input
                    type={currentQuestion.type === 'dual-number-input' ? 'number' : 'text'}
                    value={currentAnswer?.val2 || ''}
                    onChange={handleDualInput2}
                    placeholder={currentQuestion.placeholder2}
                    className="w-full p-6 text-xl bg-white border border-gray-200 rounded-3xl focus:outline-none focus:border-sage-primary focus:ring-4 focus:ring-sage-primary/10 transition-all placeholder:text-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canProceed()) handleNext();
                    }}
                  />
                </div>
              )}
            </div>

            {currentQuestion.type !== 'single-choice' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: canProceed() ? 1 : 0 }}
                className="flex justify-end pt-8"
              >
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-8 py-4 bg-sage-primary text-white rounded-2xl hover:bg-sage-dark transition-colors shadow-lg shadow-sage-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-bold tracking-wide">Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
