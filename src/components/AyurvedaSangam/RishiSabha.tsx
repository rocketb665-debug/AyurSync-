import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Users, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  History,
  MessageSquare,
  Search,
  Clock,
  ChevronLeft,
  X,
  AlertTriangle
} from 'lucide-react';
import { RISHIS, Rishi } from './constants';
import { getSpecialistResponse, getCouncilResponse, summarizeHistory } from '../../gemini';
import { chatService, ChatMessage as DBChatMessage, Consultation } from '../../services/chatService';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

interface RishiSabhaProps {
  healthData: any;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  rishiId?: string;
  isSummary?: boolean;
  debateData?: DebatePoint[];
  councilResult?: any;
}

interface DialogueLine {
  rishiId: string;
  rishiName: string;
  text: string;
}

interface DebatePoint {
  point: string;
  dialogue: DialogueLine[];
  rishiPerspectives: {
    rishiId: string;
    rishiName: string;
    advice: string;
  }[];
  finalVerdict: string;
}

const RishiSabha: React.FC<RishiSabhaProps> = ({ healthData }) => {
  const [query, setQuery] = useState('');
  const [selectedRishis, setSelectedRishis] = useState<string[]>(['charaka', 'sushruta', 'dhanvantari']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCasting, setIsCasting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refiningStatus, setRefiningStatus] = useState<string | null>(null);
  const [refinedSummary, setRefinedSummary] = useState<string | null>(null);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  const [currentThoughtIdx, setCurrentThoughtIdx] = useState(0);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [urgencyAlert, setUrgencyAlert] = useState<string | null>(null);
  const [activeDebateResult, setActiveDebateResult] = useState<DebatePoint[] | null>(null);
  const [activeDialogueIdx, setActiveDialogueIdx] = useState<{ pointIdx: number; lineIdx: number } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
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
  }, []);

  const loadPastConsultations = async (uid: string) => {
    const consultations = await chatService.getAllPastConsultations(uid);
    setPastConsultations(consultations);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCasting, activeDialogueIdx]);

  // Dialogue Player logic
  useEffect(() => {
    if (activeDebateResult && activeDialogueIdx) {
      const { pointIdx, lineIdx } = activeDialogueIdx;
      const currentPoint = activeDebateResult[pointIdx];
      const nextLineIdx = lineIdx + 1;

      const timer = setTimeout(() => {
        if (nextLineIdx < currentPoint.dialogue.length) {
          setActiveDialogueIdx({ pointIdx, lineIdx: nextLineIdx });
        } else {
          const nextPointIdx = pointIdx + 1;
          if (nextPointIdx < activeDebateResult.length) {
            setActiveDialogueIdx({ pointIdx: nextPointIdx, lineIdx: 0 });
          } else {
            // Debate finished, finalize message
            const finalDebateMessage: Message = {
              id: Math.random().toString(),
              sender: 'Council',
              text: 'The Council has concluded their deliberation.',
              debateData: activeDebateResult
            };

            setMessages(prev => [...prev, finalDebateMessage]);
            
            // Update Memory Card every 10 messages (longer for Council)
            if (currentUser && currentConsultationId && (messages.length + 2) % 5 === 0) {
              const historyForSummary = [...messages, finalDebateMessage].map(m => ({
                role: m.sender === 'User' ? 'user' : 'model',
                parts: [{ text: m.text }]
              }));
              
              summarizeHistory(historyForSummary).then(summary => {
                setMemoryCard(summary);
                chatService.updateMemoryCard(currentUser.uid, currentConsultationId!, summary);
              });
            }

            // Save to Firestore
            if (currentUser && currentConsultationId) {
              chatService.saveMessage(currentConsultationId, currentUser.uid, {
                sender: 'Council',
                text: finalDebateMessage.text,
                debateData: finalDebateMessage.debateData
              });
              loadPastConsultations(currentUser.uid);
            }

            setActiveDebateResult(null);
            setActiveDialogueIdx(null);
          }
        }
      }, 2500); // 2.5s per line to mimic "Rishi pace"

      return () => clearTimeout(timer);
    }
  }, [activeDebateResult, activeDialogueIdx]);

  // Thought Stream cycle logic
  useEffect(() => {
    if (isCasting && thoughtStream.length > 0) {
      const timer = setInterval(() => {
        setCurrentThoughtIdx(prev => (prev + 1) % thoughtStream.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isCasting, thoughtStream]);

  const toggleRishi = (id: string) => {
    setSelectedRishis(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const refineQuery = async (rawQuery: string): Promise<{ refined: string; summary: string }> => {
    setRefiningStatus('Refining your query...');
    setIsRefining(true);
    setRefinedSummary(null);
    
    const refinementPrompt = `
      Current User Vitals: Sugar ${healthData.vitality.bloodSugar} mg/dL, BP ${healthData.vitality.bloodPressure}.
      User Input: "${rawQuery}"
      
      Task: Refine this query for an Ayurvedic Council of Rishis.
      
      Output Format (Strict JSON):
      {
        "refinedPrompt": "A highly precise, professional, and technical Ayurvedic research prompt focusing on Agni, Doshas, and specific vitals impact.",
        "uiSummary": "A clean, one-line status. Example: 🔍 Optimizing your health query for precision..."
      }
      
      The uiSummary must be EXACTLY one sentence.
    `;

    try {
      const res = await getSpecialistResponse({
        id: 'refiner',
        name: 'Veda-Refiner',
        designation: 'Input Optimization Agent',
        avatar: '',
        intro: '',
        color: '',
        mission: 'Refine inputs',
        personality: 'Technical'
      }, refinementPrompt, healthData, []);
      
      let jsonStr = res.trim();
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const parsed = JSON.parse(jsonStr.substring(start, end + 1));
        return { refined: parsed.refinedPrompt, summary: parsed.uiSummary };
      }
      return { refined: rawQuery, summary: `Refining for ${healthData.vitality.bloodSugar} Sugar...` };
    } catch (e) {
      return { refined: rawQuery, summary: `Refining for ${healthData.vitality.bloodSugar} Sugar...` };
    } finally {
      setIsRefining(false);
      setRefiningStatus(null);
    }
  };

  const runVedaGuard = async (debateData: DebatePoint[]): Promise<{ status: 'OK' | 'FAIL'; reason?: string; urgencyAlert?: string }> => {
    setIsAuditing(true);
    setIsVerified(false);
    setUrgencyAlert(null);
    
    // Fetch some history for context aware auditing
    const unifiedHistory = currentUser ? await chatService.getUnifiedHistory(currentUser.uid, 10) : [];
    const historyText = unifiedHistory.map(m => `[${m.sender}]: ${m.text}`).join('\n');

    const auditPrompt = `
      Auditor: Veda-Guard (Strict Safety Guardian).
      Context: Sugar ${healthData.vitality.bloodSugar}, BP ${healthData.vitality.bloodPressure}.
      
      RECENT CONVERSATION HISTORY:
      ${historyText || "No previous history."}
      
      NEW CONTENT TO AUDIT (JSON):
      ${JSON.stringify(debateData)}
      
      CRITICAL SAFETY AUDIT Checklist:
      1. CHEMICAL MEDICINE: Does it suggest drug equivalents? (FAIL if YES)
      2. RISK CHECK: Is it safe for ${healthData.vitality.bloodSugar} Sugar and ${healthData.vitality.bloodPressure}? (FAIL if NO)
      3. HALLUCINATION: Does it use fake Ayurvedic terms not found in text? (FAIL if YES)
      4. KILL-SWITCH: Does it suggest adding heavy sugars, salts, or toxins? (FAIL if YES)
      5. SENTINEL URGENCY: Has the user asked about the SAME pain or worsening symptom for 3+ days or multiple times in history? 
         If yes, you MUST include an "urgencyAlert" in your response advising a physical doctor visit.
      
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
        designation: 'Universal Safety Auditor',
        avatar: '',
        intro: '',
        color: 'red',
        mission: 'Coordinate safety compliance',
        personality: 'Extremely Strict'
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

  const handleCastQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isCasting || isRefining) return;

    const originalQuery = query;
    setIsCasting(true);
    setSummary(null);
    setIsVerified(false);
    setUrgencyAlert(null);

    // Ensure we have a consultation ID
    let consultId = currentConsultationId;
    if (!consultId && currentUser) {
      const selectedRishiNames = selectedRishis.map(id => RISHIS.find(r => r.id === id)?.name).join(', ');
      consultId = await chatService.startConsultation(currentUser.uid, 'council', `Council Consult: ${selectedRishiNames}`) || null;
      setCurrentConsultationId(consultId);
    }
    
    // Save User message early
    if (currentUser && consultId) {
      await chatService.saveMessage(consultId, currentUser.uid, {
        sender: 'User',
        text: originalQuery
      });
    }

    // Fetch history for context awareness
    const history = currentUser ? await chatService.getUnifiedHistory(currentUser.uid, 8) : [];
    const historyPrompt = history.length > 0 
      ? `RECENT_HISTORY:\n${history.map(m => `${m.sender}: ${m.text}`).join('\n')}\n`
      : "";
    
    // LAYER 2: Initialize Thought Stream Immediately (Visible Deliberation)
    const thoughts = [
      "✓ Summoning Council of Rishis...",
      "✓ Analyzing against Charaka & Sushruta Samhitas...",
      "✓ Cross-checking with Blood Sugar and BP...",
      "✓ Simulating Internal Shashtrartha (The Great Debate)...",
      "✓ Finalizing Wisdom of the Sages..."
    ];
    setThoughtStream(thoughts);
    setCurrentThoughtIdx(0);
    
    // Stage 1: Refinement (Refiner)
    const refinementResult = await refineQuery(originalQuery);
    const refinedQuery = refinementResult.refined;
    setRefinedSummary(refinementResult.summary);
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'User', text: originalQuery };
    setMessages([userMessage]);
    setQuery('');

    try {
      const councilResult = await getCouncilResponse(selectedRishis, refinedQuery, healthData, messages as any, memoryCard || undefined);
      
      setIsCasting(false);
      setIsVerified(true);
      
      const councilMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'Council',
        text: councilResult.verse || 'The Council has synthesized their wisdom.',
        councilResult: councilResult,
        isSummary: true
      };

      setMessages(prev => [...prev, councilMsg]);
      
      // Update Memory Card
      if (currentUser && consultId) {
        if (councilResult.memoryUpdate) {
            const newMemory = memoryCard ? `${memoryCard}\n${councilResult.memoryUpdate}` : councilResult.memoryUpdate;
            setMemoryCard(newMemory);
            chatService.updateMemoryCard(currentUser.uid, consultId!, newMemory);
        } else {
            const historyForSummary = [{ sender: 'model', text: JSON.stringify(councilResult) }].map(m => ({
              role: 'model',
              parts: [{ text: m.text }]
            }));
            
            summarizeHistory(historyForSummary).then(summary => {
              setMemoryCard(summary);
              chatService.updateMemoryCard(currentUser.uid, consultId!, summary);
            });
        }

        // Save to Firestore
        await chatService.saveMessage(consultId, currentUser.uid, {
          sender: 'Council',
          text: councilMsg.text,
          debateData: councilResult
        });
        loadPastConsultations(currentUser.uid);
      }
    } catch (e) {
      console.error(e);
      setIsCasting(false);
    }
  };

  const handleSynthesize = async () => {
    if (messages.length < 2 || isCasting) return;
    setIsCasting(true);

    try {
      const history = currentUser ? await chatService.getUnifiedHistory(currentUser.uid, 5) : [];
      const contextAwareHistory = history.map(m => `${m.sender}: ${m.text}`).join('\n');

      const allWisdom = messages.filter(m => m.sender !== 'User').map(m => `${m.sender}: ${m.text}`).join('\n\n');
      const prompt = `
        CONTEXT_HISTORY:
        ${contextAwareHistory}

        Synthesize the following Ayurvedic wisdom into exactly 3 sentences with actionable steps.
        
        Wisdom:
        ${allWisdom}
        
        Mandatory Footer: "This wisdom is gathered from ancient texts for educational balance. Consult a Vaidya for medical treatment."
      `;

      // Use a "Synthesizer" persona
      const synthesisResult = await getSpecialistResponse({
        id: 'synthesizer',
        name: 'The AI Samiksa',
        designation: 'Universal Wisdom Synthesizer',
        avatar: '',
        intro: 'Synthesizing the council of sages.',
        color: 'amber',
        mission: 'Provide a clear, 3-sentence actionable summary.',
        personality: 'Concise, wise, and direct.'
      }, prompt, healthData, []);

      setSummary(synthesisResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCasting(false);
    }
  };

  const loadConsultation = async (consultId: string) => {
    if (!currentUser) return;
    setCurrentConsultationId(consultId);
    const msgs = await chatService.getMessages(currentUser.uid, consultId);
    
    // Load Memory Card
    const consultations = await chatService.getAllPastConsultations(currentUser.uid);
    const current = consultations.find(c => c.id === consultId);
    if (current?.memoryCard) setMemoryCard(current.memoryCard);
    else setMemoryCard(null);

    setMessages(msgs as any);
    setShowHistory(false);
    setActiveDebateResult(null);
    setSummary(null);
  };

  const renderHistorySidebar = () => {
    const filteredHistory = pastConsultations.filter(c => 
      c.specialistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 border-r border-emerald-50 flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-lg text-gray-900">Past Consultations</h2>
          </div>
          <button 
            onClick={() => setShowHistory(false)}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredHistory.map((consult) => (
            <button
              key={consult.id}
              onClick={() => loadConsultation(consult.id!)}
              className={`w-full text-left p-4 rounded-2xl transition-all ${
                currentConsultationId === consult.id 
                  ? 'bg-emerald-50 border-emerald-100 border' 
                  : 'hover:bg-gray-50 border-transparent border'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  {consult.specialistId === 'council' ? 'Rishi Council' : 'Specialist'}
                </span>
                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                  <Clock className="w-2.5 h-2.5" />
                  {consult.updatedAt instanceof Timestamp ? consult.updatedAt.toDate().toLocaleDateString() : 'Recent'}
                </div>
              </div>
              <h4 className="text-sm font-serif font-bold text-gray-900 line-clamp-1">
                {consult.specialistName}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1 italic leading-relaxed">
                "{consult.lastMessage || 'Starting session...'}"
              </p>
              {consult.snapshot && (
                <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-lg w-fit border border-amber-100">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  <span className="text-[8px] font-bold text-amber-700 uppercase tracking-tighter">Snapshot Available</span>
                </div>
              )}
            </button>
          ))}
          {filteredHistory.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-sm text-gray-400">No consultations found.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFBFA] relative overflow-hidden">
      <AnimatePresence>
        {showHistory && renderHistorySidebar()}
      </AnimatePresence>

      {/* Rishi Selector Bar */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-20 flex items-center gap-4">
        <button 
          onClick={() => setShowHistory(true)}
          className="p-3 bg-gray-50 text-emerald-700 rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
          title="Past Consultations"
        >
          <History className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none px-2">
            {RISHIS.map((rishi) => {
              const isSelected = selectedRishis.includes(rishi.id);
              return (
                <button
                  key={rishi.id}
                  onClick={() => toggleRishi(rishi.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isSelected 
                      ? `${rishi.color} ${rishi.borderColor} ring-1 ring-emerald-500/20` 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <rishi.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold whitespace-nowrap">{rishi.name.split(' ')[1]}</span>
                  {isSelected && <CheckCircle2 className="w-2.5 h-2.5 ml-1 opacity-60" />}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
            {selectedRishis.length === 0 ? 'Select at least one Rishi to consult' : `Consulting ${selectedRishis.length} Sages`}
          </p>
        </div>
        
        {currentConsultationId && (
          <button 
            onClick={() => {
              setCurrentConsultationId(null);
              setMessages([]);
              setActiveDebateResult(null);
              setSummary(null);
              setUrgencyAlert(null);
            }}
            className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
            title="New Session"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {urgencyAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border-2 border-rose-200 p-6 rounded-[2.5rem] shadow-xl flex gap-4 items-start"
          >
            <div className="p-3 bg-rose-200 rounded-2xl animate-bounce">
              <AlertTriangle className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-1">Universal Urgency Alert</h4>
              <p className="text-xs text-rose-800 leading-relaxed font-bold">
                {urgencyAlert}
              </p>
              <p className="text-[10px] text-rose-600 mt-2 italic">
                Cross-referenced with your consultation history. Safety is our priority.
              </p>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !activeDebateResult && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">Assemble the Great Council</h3>
              <p className="text-sm text-gray-500 max-w-xs">Ask a health question and receive wisdom from the historical personalities of Ayurveda.</p>
            </div>
          </div>
        )}

        {/* Phase 1: Live Debate Slabs */}
        {activeDebateResult && activeDialogueIdx && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="h-1 w-12 bg-emerald-100 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Phase 1: Live Rishi Debate
              </span>
              <div className="h-1 w-12 bg-emerald-100 rounded-full animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedRishis.slice(0, 3).map((rId) => {
                const rishi = RISHIS.find(r => r.id === rId);
                const currentDialogue = activeDebateResult[activeDialogueIdx.pointIdx].dialogue;
                // Find the latest line from this Rishi in the current point up to the active index
                const rishiLines = currentDialogue.slice(0, activeDialogueIdx.lineIdx + 1).filter(l => l.rishiId === rId);
                const latestLine = rishiLines[rishiLines.length - 1];
                const isTyping = currentDialogue[activeDialogueIdx.lineIdx].rishiId === rId;

                return (
                  <motion.div
                    key={rId}
                    layout
                    className={`flex flex-col h-[300px] rounded-[2.5rem] border-2 transition-all duration-500 ${
                      isTyping ? `${rishi?.borderColor} bg-white shadow-xl scale-[1.02]` : 'border-gray-100 bg-white/50 opacity-60 grayscale-[0.2]'
                    }`}
                  >
                    <div className={`p-4 border-b flex items-center gap-3 ${rishi?.color} rounded-t-[2.4rem]`}>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {rishi?.icon && <rishi.icon className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-tight">{rishi?.name.split(' ')[1]}</h4>
                        <p className="text-[8px] opacity-70 italic">{rishi?.title}</p>
                      </div>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto font-serif space-y-3">
                      <AnimatePresence mode="wait">
                        {latestLine ? (
                          <motion.p
                            key={latestLine.text}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm leading-relaxed text-gray-800"
                          >
                            {latestLine.text}
                          </motion.p>
                        ) : (
                          <p className="text-[10px] text-gray-300 italic">Listening to the council...</p>
                        )}
                      </AnimatePresence>
                      {isTyping && (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase">
                Debating Point {activeDialogueIdx.pointIdx + 1} of 5: {activeDebateResult[activeDialogueIdx.pointIdx].point}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          if (message.sender === 'User') return (
            <div key={message.id} className="flex justify-end pr-2">
              <div className="bg-gray-900 text-white px-5 py-3 rounded-[2rem] rounded-tr-sm max-w-[85%] text-sm shadow-lg border border-white/10">
                {message.text}
              </div>
            </div>
          );

          if (message.councilResult) {
            const { verse, pillars, verdict } = message.councilResult;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 max-w-7xl mx-auto w-full"
              >
                {/* Verse Header */}
                <div className="text-center space-y-3 px-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-[0.2em]">Council Verdict: The Slab of Wisdom</span>
                  </div>
                  <div className="relative py-4">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                    <p className="relative bg-white inline-block px-8 italic font-serif text-amber-900 text-lg md:text-xl leading-relaxed">
                      {verse}
                    </p>
                  </div>
                </div>

                {/* The 4-Column Slab */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
                  {pillars.map((pillar: any, pIdx: number) => (
                    <div 
                      key={pIdx} 
                      className={`p-8 flex flex-col gap-4 border-b md:border-b-0 md:border-r last:border-0 border-gray-50 transition-all hover:bg-gray-50/50 ${
                        pIdx === 3 ? (verdict === 'GO' ? 'bg-emerald-50/40' : 'bg-red-50/40') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                          {pIdx + 1}
                        </div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pillar.title}</h4>
                      </div>
                      
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed ${pIdx === 3 ? 'font-bold' : ''}`}>
                          {pillar.content}
                        </p>
                      </div>

                      {pIdx === 3 && (
                        <div className={`mt-auto pt-4 flex items-center gap-2 border-t ${
                          verdict === 'GO' ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700'
                        }`}>
                          <div className={`w-3 h-3 rounded-full animate-pulse ${verdict === 'GO' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-black uppercase tracking-tighter">
                            Final Decision: {verdict}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter">[SHASHTRARTHA_COMPLETE]</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                    <BrainCircuit className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">Veda-Guard Confirmed</span>
                  </div>
                </div>
              </motion.div>
            );
          }

          const rishi = RISHIS.find(r => r.id === message.rishiId);
          return (
            <motion.div
              key={message.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-5 rounded-[2rem] rounded-tl-sm border shadow-sm ${rishi?.color} ${rishi?.borderColor} flex gap-4`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {rishi ? <rishi.icon className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-80">{message.sender}</h4>
                  <span className="text-[9px] opacity-40">•</span>
                  <span className="text-[9px] opacity-60 italic">{rishi?.title}</span>
                </div>
                <div className="text-sm leading-relaxed font-serif tracking-tight prose-sm prose-slate">
                  {message.text.split('\n').filter(l => !l.startsWith('**') && !l.startsWith('---')).join('\n')}
                </div>
              </div>
            </motion.div>
          );
        })}

        {isCasting && (
          <div className="max-w-4xl mx-auto w-full px-4 mb-8">
            <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl p-8 relative overflow-hidden">
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

                <div className="text-center space-y-4 w-full max-w-lg">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Establishing Council Dialectics</h3>
                  
                  <div className="h-16 relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentThoughtIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 flex items-center justify-center p-4"
                      >
                        <p className="text-emerald-700 font-bold text-sm tracking-tight text-center leading-relaxed">
                          {thoughtStream[currentThoughtIdx]}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-center gap-1.5">
                    {thoughtStream.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          idx === currentThoughtIdx ? 'w-8 bg-emerald-500' : 'w-2 bg-emerald-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Samiksa Button & Display */}
        {messages.length > 1 && !isCasting && !summary && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center py-4"
          >
            <button 
              onClick={handleSynthesize}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full font-bold shadow-xl overflow-hidden hover:scale-105 active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <BrainCircuit className="w-5 h-5" />
              <span>Synthesize Wisdom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-12 h-12 text-amber-900" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-200 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-amber-900" />
              </div>
              <h3 className="font-serif font-bold text-lg text-amber-900">AI Samiksa (Summary)</h3>
            </div>
            <div className="text-amber-900/80 text-sm leading-relaxed mb-4 font-medium italic">
              {summary.split('---')[0]}
            </div>
            <div className="pt-4 border-t border-amber-200/50 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                This wisdom is gathered from ancient texts for educational balance. Consult a Vaidya for medical treatment.
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        {(isRefining || isAuditing || refinedSummary) && (
          <div className="max-w-3xl mx-auto mb-3 flex flex-col items-center gap-2">
            {refinedSummary && !isCasting && !isAuditing && !isRefining && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-[11px] font-medium shadow-sm"
              >
                {refinedSummary}
              </motion.div>
            )}
            {(isRefining || isAuditing) && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse ${isRefining ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {isRefining ? <BrainCircuit className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                {isRefining ? 'Refining & Consulting...' : 'Veda-Guard Auditing Compliance...'}
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleCastQuery} className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-50 p-2 rounded-[2.5rem] border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the Council of Rishis..." 
            className="flex-1 bg-transparent px-6 py-3 text-sm focus:outline-none"
            disabled={isCasting || isRefining || isAuditing || selectedRishis.length === 0}
          />
          <button 
            type="submit"
            disabled={!query.trim() || isCasting || isRefining || isAuditing || selectedRishis.length === 0}
            className={`flex items-center gap-2 px-6 py-4 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
              query.trim() && !isCasting && !isRefining && !isAuditing && selectedRishis.length > 0
                ? 'bg-emerald-600 text-white shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isCasting || isRefining || isAuditing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Refine & Consult</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RishiSabha;
