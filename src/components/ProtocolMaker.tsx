import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  Dumbbell,
  Utensils,
  Moon,
  Zap,
  Brain,
  Flame,
  Activity,
  Stethoscope
} from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { GoogleGenAI } from "@google/genai";
import { AyurSyncLoader } from './AyurSyncLoader';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProtocolMakerProps {
  onComplete: (protocol: any) => void;
  onBack: () => void;
}

export const ProtocolMaker = ({ onComplete, onBack }: ProtocolMakerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "To architect your 21-day evolution, I must understand your primary objective. What is the one shift in your vitality that is non-negotiable for you right now?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = genAI.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          maxOutputTokens: 1000,
          systemInstruction: `
            You are the Chief Protocol Architect & Human Performance Scientist, a master of human physiology with 30+ years of experience.
            Voice: Professional, humble, authoritative, and clinical. Use words like "Optimization," "Synthesis," "Equilibrium," and "Vitality."
            Behavior:
            - Never ask two questions at once.
            - Analyze user inputs for hidden patterns (e.g., afternoon tiredness -> blood-sugar or "Kapha" crash).
            - Apply Chronobiology: Align suggestions with the body's natural circadian rhythms.
            - Keep the user's answers short. If they ramble, gently bring them back to the point.
            - Your goal is to gather enough data (5-7 questions) to construct a 21-day "Bio-Blueprint."
          `
        },
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage({ message: input });
      const text = result.text || "";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I apologize, I encountered a connection issue. Could you please repeat that?",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateProtocol = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        You are the Chief Protocol Architect. Your task is to synthesize a unique 21-day "Bio-Blueprint" based on the user's interview data.
        
        ### USER PROFILE DATA:
        ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
        
        ### ARCHITECTURAL GUIDELINES:
        1. **Deep Scan Analysis**: Identify hidden patterns (e.g., Kapha crashes, Pitta imbalances) and address them through Chronobiology.
        2. **The 21-Day Engine**:
           - Days 1-7 (The Cellular Cleanse): Focus on mobility, hydration, and gut-reset.
           - Days 8-15 (The Metabolic Spike): High-intensity Agni work using exercise.
           - Days 16-21 (The Neural Lock): Strength consolidation and deep meditation.
        3. **Workout Integration**: 
           - Use 'fSaYfvSpAMI' for Core
           - Use 'WlGj3ABffAw' for Lower Body
           - Use 'tWjBnQX3if0' for Upper Body
           - Use 'FPjppcOquE4' for Yoga/Flow
        
        ### SESSION BLUEPRINT (THE "BODY PROFIT" SYSTEM):
        Every activity in the timeline must have a "SessionDetails" object with three phases:
        - **Phase 1: Mobilize (Warm-Up)**: 10% of duration. Focus on joint lubrication and breath.
        - **Phase 2: Perform (Peak Work)**: 80% of duration. The core activity. Link specific YouTube ID if it's a workout.
        - **Phase 3: Restore (Cool-Down)**: 10% of duration. Focus on Dosha balancing and heart rate recovery.
        
        ### OUTPUT FORMAT (JSON ONLY):
        {
          "reasoning": "Detailed biological synthesis of why this plan works for them",
          "title": "Protocol Title",
          "description": "Brief description",
          "whyLabel": "5-word Problem-Solution hook (e.g., 'Extinguishes Cortisol, Ignites Core')",
          "doshaImpact": { "vata": 0-100, "pitta": 0-100, "kapha": 0-100 },
          "architectNote": "One specific biological benefit of this plan",
          "days": [
            {
              "day": 1,
              "activities": [
                { 
                  "time": "05:00 AM", 
                  "title": "...", 
                  "type": "workout|meal|supplement|rest", 
                  "specialist": "Veer|Rohini|Kavya|Mira|Kabir|Aryan|Zara",
                  "actionText": "...",
                  "details": { "note": "..." },
                  "sessionDetails": {
                    "phases": [
                      {
                        "type": "mobilize",
                        "name": "Mobilize",
                        "description": "Joint lubrication and breath prep",
                        "duration": "5m",
                        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
                      },
                      {
                        "type": "perform",
                        "name": "Perform",
                        "description": "Peak metabolic work",
                        "duration": "40m",
                        "videoId": "...",
                        "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80"
                      },
                      {
                        "type": "restore",
                        "name": "Restore",
                        "description": "Dosha balancing cool-down",
                        "duration": "5m",
                        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
        
        Return ONLY the JSON object.
      `;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const text = result.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rawProtocol = JSON.parse(jsonMatch[0]);
        
        // Map to Protocol interface
        const protocol = {
          id: `custom-${Date.now()}`,
          title: rawProtocol.title,
          description: rawProtocol.description,
          specialist: 'The Grand Architect',
          duration: '21 Days',
          dosha: 'Tridoshic', // Default or derived
          whyLabel: rawProtocol.whyLabel,
          vitalityImpact: Math.max(...Object.values(rawProtocol.doshaImpact || { v: 0 }) as number[]),
          architectNote: rawProtocol.architectNote,
          days: rawProtocol.days.map((d: any) => ({
            day: d.day,
            sessions: d.activities.map((a: any, idx: number) => ({
              id: `s-${d.day}-${idx}`,
              time: a.time,
              title: a.title,
              type: a.type,
              specialist: a.specialist,
              actionText: a.actionText,
              completed: false,
              details: a.details,
              sessionDetails: a.sessionDetails
            }))
          }))
        };
        
        setIsGenerating(false);
        setIsAssembling(true);
        
        // Simulate "Blueprint Assembly" animation
        setTimeout(() => {
          setGeneratedProtocol(protocol);
          setIsAssembling(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const questionCount = messages.filter(m => m.role === 'assistant').length;
  const isDataComplete = questionCount >= 6;

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
      {/* Header */}
      <div className="px-8 py-8 bg-black border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">The Grand Architect</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">Physiological Consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-sage-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Phase {questionCount}/7</span>
          </div>
          {isDataComplete && !generatedProtocol && (
            <button 
              onClick={generateProtocol}
              disabled={isGenerating}
              className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sage-light transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-3"
            >
              {isGenerating ? <AyurSyncLoader size="small" /> : <Zap className="w-4 h-4" />}
              Construct 21-Day Protocol
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0A0A0A] custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-6 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105",
                m.role === 'assistant' ? "bg-white text-black" : "bg-white/5 text-white/40 border border-white/10"
              )}>
                {m.role === 'assistant' ? <Brain className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className={cn(
                "p-6 rounded-[32px] text-base leading-relaxed shadow-xl",
                m.role === 'assistant' 
                  ? "bg-white/5 text-white/90 rounded-tl-none border border-white/10 backdrop-blur-md" 
                  : "bg-white text-black rounded-tr-none font-medium"
              )}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div className="bg-white/5 p-6 rounded-[32px] rounded-tl-none border border-white/10 shadow-xl flex gap-1.5 items-center">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-white rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-white rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-white rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAssembling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <AyurSyncLoader size="large" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold text-white">Blueprint Assembly</h3>
              <p className="text-white/40 text-sm uppercase tracking-widest animate-pulse">Synthesizing Biological Equilibrium...</p>
            </div>
          </motion.div>
        )}

        {generatedProtocol && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pt-12"
          >
            <div className="bg-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
              {/* Watermark */}
              <div className="absolute top-8 right-8 pointer-events-none opacity-10 select-none">
                <div className="text-right">
                  <p className="text-black font-black text-xs uppercase tracking-[0.3em]">Designed for</p>
                  <p className="text-black font-serif italic text-2xl">User</p>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-96 h-96 bg-sage-primary/5 rounded-full -mr-48 -mt-48 blur-[100px]" />
              <div className="relative space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center shadow-2xl">
                    <Zap className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-bold text-black tracking-tight">{generatedProtocol.title}</h3>
                    <p className="text-sage-primary font-black uppercase tracking-[0.3em] text-[10px] mt-2">{generatedProtocol.whyLabel}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">{generatedProtocol.description}</p>
                  <div className="bg-sage-light/30 p-6 rounded-3xl border border-sage-primary/10">
                    <h4 className="text-[10px] font-black text-sage-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Stethoscope className="w-3 h-3" />
                      Architect's Note
                    </h4>
                    <p className="text-gray-700 text-sm italic leading-relaxed">"{generatedProtocol.architectNote}"</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Calendar, label: 'Duration', value: '21 Days', color: 'text-black' },
                    { icon: Flame, label: 'Dosha Impact', value: 'Balanced', color: 'text-orange-600' },
                    { icon: Activity, label: 'Synthesis', value: 'Optimal', color: 'text-blue-600' },
                    { icon: Moon, label: 'Neural Lock', value: 'Active', color: 'text-purple-600' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 transition-transform hover:scale-105">
                      <div className={cn("mb-3", stat.color)}><stat.icon className="w-6 h-6" /></div>
                      <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onComplete(generatedProtocol)}
                  className="w-full py-6 bg-black text-white rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-gray-900 transition-all shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <CheckCircle2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  Activate My Bio-Blueprint
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      {!generatedProtocol && (
        <div className="px-10 py-10 bg-black border-t border-white/5 shrink-0">
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-white/5 rounded-[32px] blur-2xl group-focus-within:bg-white/10 transition-all" />
            <div className="relative bg-white/5 border border-white/10 rounded-[32px] p-3 flex items-center shadow-2xl focus-within:bg-white/10 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Respond to the Architect..."
                className="flex-1 bg-transparent border-none outline-none px-8 py-4 text-white placeholder:text-white/20 text-lg font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-sage-light transition-all shadow-xl disabled:opacity-20 disabled:grayscale"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-8">
            AyurSync Systems • Precision Biological Architecture
          </p>
        </div>
      )}
    </div>
  );
};
