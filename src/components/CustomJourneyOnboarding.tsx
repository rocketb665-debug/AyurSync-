import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { AyurSyncLoader } from './AyurSyncLoader';

interface CustomJourneyOnboardingProps {
  onBack: () => void;
  onComplete: (answers: any) => void;
}

const questions = [
  {
    id: 'focus',
    text: "What is your primary focus? (Weight, Sleep, Digestion, Skin, or Energy)",
    options: ['Weight', 'Sleep', 'Digestion', 'Skin', 'Energy']
  },
  {
    id: 'energy',
    text: "On a scale of 1-10, how is your current energy level?",
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  },
  {
    id: 'conditions',
    text: "Do you have any specific health conditions I should know about (e.g., Thyroid, Diabetes, PCOS)?",
    placeholder: "Type your conditions or 'None'..."
  },
  {
    id: 'commitment',
    text: "How many days can you commit to this initial transformation (7, 10, 15, or 21 days)?",
    options: ['7', '10', '15', '21']
  }
];

export const CustomJourneyOnboarding: React.FC<CustomJourneyOnboardingProps> = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { id: 'initial-1', role: 'ai', text: "Namaste! I am Dr. Kavya. Let's design your custom wellness journey together." },
    { id: 'initial-2', role: 'ai', text: questions[0].text }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[step];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    
    setMessages(prev => [...prev, { id: `user-${step}-${Date.now()}`, role: 'user', text: answer }]);
    
    if (step < questions.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: `ai-${step + 1}-${Date.now()}`, role: 'ai', text: questions[step + 1].text }]);
        setStep(step + 1);
      }, 600);
    } else {
      setIsGenerating(true);
      setTimeout(() => {
        onComplete(newAnswers);
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-stone-50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-stone-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-primary/10 rounded-full flex items-center justify-center">
            <img 
              src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000dd9c71fa82104a147e55ce76.png" 
              alt="Dr. Kavya" 
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div>
            <h2 className="font-bold text-stone-800">Dr. Kavya</h2>
            <p className="text-xs text-sage-primary font-medium">Health Strategist</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex max-w-[80%] items-end gap-2",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {msg.role === 'ai' && (
                <div className="w-6 h-6 bg-sage-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <img 
                    src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000dd9c71fa82104a147e55ce76.png" 
                    alt="Dr. Kavya" 
                    className="w-5 h-5 rounded-full"
                  />
                </div>
              )}
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-sage-primary text-white rounded-br-none" 
                  : "bg-white text-stone-700 border border-stone-100 rounded-bl-none"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <div className="relative">
              <AyurSyncLoader size="large" />
              <Sparkles className="w-6 h-6 text-sage-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-stone-500 font-medium animate-pulse">Dr. Kavya is crafting your personalized blueprint...</p>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-stone-100 bg-white">
        {!isGenerating && (
          <div className="max-w-4xl mx-auto">
            {questions[step].options ? (
              <div className="flex flex-wrap gap-3 mb-4">
                {questions[step].options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="px-6 py-2.5 bg-stone-50 hover:bg-sage-primary hover:text-white border border-stone-200 rounded-full text-sm font-medium transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && inputValue.trim() && (handleAnswer(inputValue), setInputValue(''))}
                  placeholder={questions[step].placeholder}
                  className="flex-1 px-6 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-sage-primary transition-colors"
                />
                <button 
                  onClick={() => inputValue.trim() && (handleAnswer(inputValue), setInputValue(''))}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-sage-primary text-white rounded-2xl disabled:opacity-50 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
