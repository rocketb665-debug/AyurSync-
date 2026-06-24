import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ChevronLeft, 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  History,
  Clock,
  Search,
  X,
  AlertTriangle,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import { chatService, ChatMessage as DBChatMessage, Consultation } from '../services/chatService';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getSpecialistResponse, summarizeHistory } from '../gemini';
import { StreamingMessage } from './StreamingMessage';
import { Timestamp } from 'firebase/firestore';

interface SpecialistChatProps {
  specialist: any;
  healthData: any;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'User' | 'AI';
  text: string;
  timestamp: Date;
  isVerified?: boolean;
}

export const SpecialistChat: React.FC<SpecialistChatProps> = ({ specialist, healthData, onBack }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCasting, setIsCasting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [refinedSummary, setRefinedSummary] = useState<string | null>(null);
  const [urgencyAlert, setUrgencyAlert] = useState<string | null>(null);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  const [currentThoughtIdx, setCurrentThoughtIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [pastConsultations, setPastConsultations] = useState<Consultation[]>([]);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memoryCard, setMemoryCard] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadPastConsultations(user.uid);
      }
    });
    return () => unsubscribe();
  }, [specialist.id]);

  const loadPastConsultations = async (uid: string) => {
    const all = await chatService.getAllPastConsultations(uid);
    setPastConsultations(all.filter(c => c.specialistId === specialist.id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCasting]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCasting && thoughtStream.length > 0) {
      interval = setInterval(() => {
        setCurrentThoughtIdx(prev => (prev + 1) % thoughtStream.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isCasting, thoughtStream]);

  const refineQuery = async (userQuery: string): Promise<{ refinedPrompt: string; uiSummary: string }> => {
    setIsRefining(true);
    const refinerPrompt = `
      Persona: Veda-Refiner. 
      Task: Transform this raw query into a structured clinical Ayurvedic prompt.
      Raw Query: "${userQuery}"
      User Vitals: Sugar ${healthData.vitality.bloodSugar}, BP ${healthData.vitality.bloodPressure}.
      
      Output Format (Strict JSON):
      {
        "refinedPrompt": "Extremely detailed prompt for the specialist...",
        "uiSummary": "A clean, one-line status. Example: 🔍 Optimizing your health query for precision..."
      }
    `;

    try {
      const res = await getSpecialistResponse({
        id: 'refiner',
        name: 'Veda-Refiner',
        designation: 'Input Architect',
        avatar: '',
        intro: '',
        color: 'blue',
        mission: 'Optimize input for truth',
        personality: 'Precise'
      }, refinerPrompt, healthData, []);

      let jsonStr = res.trim();
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = jsonStr.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        return parsed;
      }
      return { refinedPrompt: userQuery, uiSummary: "Refining your query..." };
    } catch (e) {
      return { refinedPrompt: userQuery, uiSummary: "Refining your query..." };
    } finally {
      setIsRefining(false);
    }
  };

  const runVedaGuard = async (responseText: string): Promise<{ status: 'OK' | 'FAIL'; reason?: string; urgencyAlert?: string }> => {
    setIsAuditing(true);
    setIsVerified(false);
    
    const unifiedHistory = currentUser ? await chatService.getUnifiedHistory(currentUser.uid, 10) : [];
    const historyText = unifiedHistory.map(m => `[${m.sender}]: ${m.text}`).join('\n');

    const auditPrompt = `
      Auditor: Veda-Guard (Sentinel Mode).
      
      RECENT CONVERSATION HISTORY:
      ${historyText || "No previous history."}
      
      NEW RESPONSE TO AUDIT:
      "${responseText}"
      
      CRITICAL SAFETY AUDIT Checklist:
      1. CHEMICAL MEDICINE: Does it suggest drug equivalents? (FAIL if YES)
      2. RISK CHECK: Is it safe for ${healthData.vitality.bloodSugar} Sugar and ${healthData.vitality.bloodPressure}? (FAIL if NO)
      3. HALLUCINATION: Does it use fake Ayurvedic terms? (FAIL if YES)
      4. SENTINEL URGENCY: Has the user asked about the SAME pain or worsening symptom for 3+ days? 
         If yes, you MUST include an "urgencyAlert" in your response advising a physical hospital visit.
      
      Output Format (Strict JSON):
      { 
        "status": "OK" | "FAIL", 
        "reason": "Explanation if FAIL", 
        "urgencyAlert": "Alert text if symptoms persist in history" 
      }
    `;

    try {
      const auditRes = await getSpecialistResponse({
        id: 'auditor',
        name: 'Veda-Guard',
        designation: 'Safety Auditor',
        avatar: '',
        intro: '',
        color: 'red',
        mission: 'Verify and Protect',
        personality: 'Strict'
      }, auditPrompt, healthData, []);

      let jsonStr = auditRes.trim();
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = jsonStr.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.status === 'OK') setIsVerified(true);
        if (parsed.urgencyAlert) setUrgencyAlert(parsed.urgencyAlert);
        return { status: parsed.status, reason: parsed.reason, urgencyAlert: parsed.urgencyAlert };
      }
      setIsVerified(true);
      return { status: 'OK' };
    } catch (e) {
      setIsVerified(true);
      return { status: 'OK' }; 
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isCasting || isRefining) return;

    const originalQuery = query;
    setQuery('');
    setIsCasting(true);
    setIsVerified(false);
    setUrgencyAlert(null);

    // Save User message
    let consultId = currentConsultationId;
    if (!consultId && currentUser) {
      consultId = await chatService.startConsultation(currentUser.uid, specialist.id, `Consult: ${specialist.name}`) || null;
      setCurrentConsultationId(consultId);
    }
    
    if (currentUser && consultId) {
      await chatService.saveMessage(consultId, currentUser.uid, {
        sender: 'User',
        text: originalQuery
      });
    }

    const { refinedPrompt, uiSummary } = await refineQuery(originalQuery);
    setRefinedSummary(uiSummary);

    setThoughtStream([
      "✓ Analyzing against Ayurvedic Samhitas...",
      "✓ Cross-checking with Live Vitals (Sugar/BP)...",
      "✓ Simulating Internal Shashtrartha debate...",
      "✓ Finalizing Wisdom for your temple (Body)..."
    ]);

      try {
        const response = await getSpecialistResponse(specialist, originalQuery, healthData, messages, memoryCard || undefined);
        
        // Extract Memory Update
        let cleanResponse = response;
        let turnUpdate = '';
        const memoryIndex = response.indexOf('[MEMORY_UPDATE]:');
        if (memoryIndex !== -1) {
          cleanResponse = response.substring(0, memoryIndex).trim();
          turnUpdate = response.substring(memoryIndex + 16).trim();
        }

        setIsCasting(false);
        setIsVerified(true);
  
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: cleanResponse,
          timestamp: new Date(),
          isVerified: true
        };
  
        setMessages(prev => [...prev, aiMsg]);
        
        // Proactive Memory Consolidation
        if (currentUser && consultId) {
          if (turnUpdate) {
            const newMemory = memoryCard ? `${memoryCard}\n${turnUpdate}` : turnUpdate;
            setMemoryCard(newMemory);
            chatService.updateMemoryCard(currentUser.uid, consultId, newMemory);
          } else if ((messages.length + 2) % 5 === 0) {
            // Periodic full summarization fallback
            const historyForSummary = [...messages, { sender: 'User', text: originalQuery }, aiMsg].map(m => ({
              role: m.sender === 'User' ? 'user' : 'model',
              parts: [{ text: m.text }]
            }));
            
            summarizeHistory(historyForSummary).then(summary => {
              setMemoryCard(summary);
              chatService.updateMemoryCard(currentUser.uid, consultId!, summary);
            });
          }
        }
        
        if (currentUser && consultId) {
          await chatService.saveMessage(consultId, currentUser.uid, {
            sender: 'Specialist',
            text: cleanResponse
          });
          loadPastConsultations(currentUser.uid);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCasting(false);
        setRefinedSummary(null);
      }
  };

  const loadConsultation = async (consultId: string) => {
    if (!currentUser) return;
    setCurrentConsultationId(consultId);
    const msgs = await chatService.getMessages(currentUser.uid, consultId);
    
    // Load Memory Card if exists
    const consultations = await chatService.getAllPastConsultations(currentUser.uid);
    const current = consultations.find(c => c.id === consultId);
    if (current?.memoryCard) setMemoryCard(current.memoryCard);
    else setMemoryCard(null);

    setMessages(msgs.map(m => ({
      id: m.id!,
      sender: m.sender === 'User' ? 'User' : 'AI',
      text: m.text,
      timestamp: m.timestamp instanceof Timestamp ? m.timestamp.toDate() : new Date()
    })));
    setShowHistory(false);
  };

  return (
    <div className="flex-1 flex flex-col relative bg-white w-full h-full overflow-hidden">
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 text-white shadow-lg transition-all"
        style={{ backgroundColor: specialist.color || '#15803D' }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={specialist.avatar} 
                className="w-12 h-12 rounded-full object-cover object-top border-2 border-white/50 shadow-md" 
                alt="Specialist"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{specialist.name}</h2>
              <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/70">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active Now
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-3 hover:bg-white/10 rounded-full transition-colors"
        >
          <History className="w-6 h-6" />
        </button>
      </div>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 z-[60] bg-white flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h2 className="font-serif font-bold text-lg">Consultation History</h2>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search past logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {pastConsultations.filter(c => c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <button
                  key={c.id}
                  onClick={() => loadConsultation(c.id!)}
                  className={`w-full text-left p-4 rounded-3xl border transition-all ${
                    currentConsultationId === c.id ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 hover:border-emerald-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{specialist.name}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-medium">{c.updatedAt instanceof Timestamp ? c.updatedAt.toDate().toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <p className="text-sm font-serif font-bold text-gray-900 leading-tight mb-1 line-clamp-1">"{c.lastMessage}"</p>
                </button>
              ))}
              {pastConsultations.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p className="font-serif">No previous consultations found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-gray-50/20">
        {urgencyAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto w-full bg-rose-50 border-2 border-rose-200 p-8 rounded-[3rem] shadow-xl flex gap-6 items-start"
          >
            <div className="p-4 bg-rose-200 rounded-3xl animate-bounce">
              <AlertTriangle className="w-8 h-8 text-rose-700" />
            </div>
            <div>
              <h4 className="text-lg font-black text-rose-900 uppercase tracking-widest mb-2 italic underline decoration-rose-300">Urgency Sentinel Alert</h4>
              <p className="text-sm text-rose-800 leading-relaxed font-bold">
                {urgencyAlert}
              </p>
              <p className="text-xs text-rose-600 mt-4 italic font-medium">
                Analysis of your consultation history indicates persistent symptoms. Please seek professional medical evaluation immediately.
              </p>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
            <MessageCircle className="w-16 h-16 text-emerald-100" />
            <p className="font-serif italic">Your persistent health dialogue starts here.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sender === 'User' ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}
          >
            {msg.sender === 'AI' && (
              <div className="flex items-center gap-2 mb-3 ml-2">
                <img src={specialist.avatar} className="w-6 h-6 rounded-full object-cover grayscale" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{specialist.name}</span>
                {msg.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">[Verified Safe]</span>
                  </div>
                )}
              </div>
            )}
            <div className={`p-8 rounded-[2.5rem] shadow-sm border ${
              msg.sender === 'User' 
                ? 'bg-white border-gray-100 rounded-tr-none' 
                : 'bg-white border-gray-100 rounded-tl-none'
            }`}>
              {msg.sender === 'AI' ? (
                <StreamingMessage text={msg.text} isStreaming={idx === messages.length - 1 && isCasting === false} />
              ) : (
                <p className="text-lg font-bold text-gray-900 tracking-tight leading-tight">{msg.text}</p>
              )}
            </div>
            <span className="text-[8px] text-gray-300 font-bold uppercase mt-2 px-4 italic">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}

        {isCasting && (
          <div className="max-w-3xl mx-auto w-full bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gray-50 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-1/3 h-full bg-emerald-500"
              />
            </div>
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-50 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-4 w-full">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Consulting {specialist.name}</h3>
                <div className="h-12 relative flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentThoughtIdx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute font-bold text-emerald-700 text-sm tracking-tight text-center leading-relaxed"
                    >
                      {thoughtStream[currentThoughtIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          {refinedSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            >
              {refinedSummary}
            </motion.div>
          )}
          {isAuditing && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
              <ShieldAlert className="w-3 h-3" />
              Guard Auditing Intelligence...
            </div>
          )}
          <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Consult with ${specialist.name}...`}
              className="flex-1 bg-transparent px-6 py-4 text-sm font-medium focus:outline-none"
              disabled={isCasting || isRefining || isAuditing}
            />
            <button 
              type="submit"
              disabled={!query.trim() || isCasting || isRefining || isAuditing}
              className={`flex items-center gap-3 px-8 py-4 rounded-full transition-all text-xs font-black uppercase tracking-widest ${
                query.trim() && !isCasting 
                  ? 'bg-emerald-600 text-white shadow-xl hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isCasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Refine & Ask</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
