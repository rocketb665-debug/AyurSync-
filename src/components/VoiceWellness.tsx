import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Activity, 
  Heart,
  Droplets,
  Flame,
  Brain,
  ShieldAlert,
  Info,
  History,
  X,
  Camera,
  CameraOff,
  Zap,
  Leaf
} from 'lucide-react';
import { getVoiceCoachResponse, genAI } from '../gemini';
import { cn } from '../contexts/lib/utils';
import { AyurSyncLoader } from './AyurSyncLoader';
import { LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

interface NutritionCardData {
  name: string;
  type: 'FOOD' | 'MEDICINE';
  ayurvedicVerdict: 'Sattvic' | 'Rajasic' | 'Tamasic';
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  summary: string;
}

interface VoiceWellnessProps {
  setExploreView: (view: any) => void;
  healthData: any;
  vitalityScore: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

export const VoiceWellness = ({ setExploreView, healthData, vitalityScore }: VoiceWellnessProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detectedItem, setDetectedItem] = useState<NutritionCardData | null>(null);

  const [isLensActive, setIsLensActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(30).fill(10));

  // Visual Stream Timer
  const visualTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopSession();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startSession = async () => {
    setError(null);
    setTranscript('');
    setDetectedItem(null);
    try {
      // 1. Setup Audio Context for Capture & Playback
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const showNutritionCard: FunctionDeclaration = {
        name: "show_nutrition_card",
        description: "Displays a detailed nutrition and Ayurvedic card for the detected food or medicine. Use it when you are confident about what you see.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the detected item" },
            type: { type: Type.STRING, enum: ["FOOD", "MEDICINE"] },
            ayurvedicVerdict: { type: Type.STRING, enum: ["Sattvic", "Rajasic", "Tamasic"] },
            calories: { type: Type.STRING, description: "Calories per 100g or serving (never N/A)" },
            protein: { type: Type.STRING, description: "Protein in g (never N/A)" },
            carbs: { type: Type.STRING, description: "Carbs in g (never N/A)" },
            fat: { type: Type.STRING, description: "Fat in g (never N/A)" },
            summary: { type: Type.STRING, description: "A one-sentence Ayurvedic summary" }
          },
          required: ["name", "type", "ayurvedicVerdict", "calories", "protein", "carbs", "fat", "summary"]
        }
      };

      // 2. Connect to Live API
      const sysPrompt = `
        Role: You are the "AyurSync Voice Coach." You are a warm, human-like health expert with a maternal, professional Indian English voice.
        
        VITAL METRICS (Live Dashboard):
        - Blood Sugar: ${healthData.vitality.bloodSugar} mg/dL
        - Blood Pressure: ${healthData.vitality.bloodPressure}
        - Heart Rate: ${healthData.vitality.heartRate} bpm
        - Vitality Score: ${vitalityScore}%

        REGULATORY PROTOCOLS (NON-NEGOTIABLE):
        1. NO-PRESCRIPTION: Strictly prohibited from recommending specific brand-name medicines or dosages. If asked, you MUST reply: "I cannot recommend specific medicines. Please consult a healthcare professional for a prescription."
        2. SAFE VOCABULARY: BANNED words: "Cure," "Treat," "Prescribe," "Diagnose," "Medical Advice." 
           Instead use: "Support," "Balance," "Improve," "Promote," "Traditional Ayurvedic Wisdom."
           Example: Instead of "This will cure your sugar," use "This food choice may help balance your glucose levels."
        3. EMERGENCY REDIRECTION: If user mentions "chest pain," "difficulty breathing," or their sugar exceeds 300mg/dL (Current: ${healthData.vitality.bloodSugar}), you MUST stop all advice and say: "This sounds serious. Please stop using this app and seek emergency medical help immediately."
        4. EDUCATIONAL ANCHOR: Every single voice and text response MUST end with: "This information is for educational purposes only."

        THE LOGIC (Biological Impact):
        - If the user shows/asks about food (e.g., Jalebi), check their ${healthData.vitality.bloodSugar} sugar.
        - Explain the impact: "Your sugar is ${healthData.vitality.bloodSugar}. This Jalebi will cause a sharp spike, likely leading to fatigue or a headache."

        STYLE: 
        - 3-4 short, punchy sentences. 
        - Use human sounds: "Hmm," "I see," "Natural pauses."
        - Total full-duplex: stop speaking immediately if the user interrupts.
      `;

      sessionRef.current = await genAI.live.connect({
        model: "gemini-2.0-flash-exp",
        callbacks: {
          onopen: () => {
            setIsActive(true);
            startMic();
            if (isLensActive) startVisualFeed();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.serverContent?.modelTurn?.parts) {
              const toolCalls = message.serverContent.modelTurn.parts.filter(p => 'toolCall' in p);
              for (const tc of toolCalls) {
                const call = (tc as any).toolCall;
                if (call.name === "show_nutrition_card") {
                  setDetectedItem(call.args as NutritionCardData);
                  sessionRef.current.sendToolResponse({
                    functionResponses: [{
                      name: "show_nutrition_card",
                      response: { success: true },
                      id: call.id
                    }]
                  });
                }
              }

              const audioData = message.serverContent.modelTurn.parts.find(p => p.inlineData)?.inlineData?.data;
              if (audioData) {
                queueAudio(audioData);
              }
              const text = message.serverContent.modelTurn.parts.find(p => p.text)?.text;
              if (text) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, parts: [{ text: (last.parts[0].text + text) }] }];
                  }
                  return [...prev, { role: 'model', parts: [{ text }], timestamp: new Date().toISOString() }];
                });
              }
            }

            if (message.serverContent?.interrupted) {
              console.info("[VoiceCoach] User interrupted - stopping playback.");
              stopPlayback();
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection lost. Reconnecting...");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            stopSession();
          }
        },
        config: {
          generationConfig: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
            }
          },
          tools: [{ functionDeclarations: [showNutritionCard] }],
          systemInstruction: { parts: [{ text: sysPrompt }] },
          // @ts-ignore - valid for live connect sessions
          turnDetection: {
             type: "server_vad",
             threshold: 0.5
          }
        }
      });
    } catch (err) {
      console.error("Session start failed:", err);
      setError("Could not establish a direct neural link. Please check your connection.");
    }
  };

  const stopSession = () => {
    setIsActive(false);
    stopMic();
    stopVisualFeed();
    stopPlayback();
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      
      // Use ScriptProcessor for 16kHz PCM capture (simplest for this environment)
      processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        if (!isActive || !sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });

        // Update UI Waveform
        if (isActive) {
          const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
          const avg = sum / inputData.length;
          setWaveform(prev => [...prev.slice(1), 10 + avg * 400]);
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current!.destination);
    } catch (err) {
      console.error("Mic access failed:", err);
      setError("Microphone access is required for real-time coaching.");
    }
  };

  const stopMic = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
  };

  const startVisualFeed = () => {
    visualTimerRef.current = setInterval(() => {
      if (isActive && sessionRef.current && isLensActive) {
        const base64 = captureFrame();
        if (base64) {
          sessionRef.current.sendRealtimeInput({
            video: { data: base64, mimeType: 'image/jpeg' }
          });
        }
      }
    }, 1500); // Send frame every 1.5s for "seeing"
  };

  const stopVisualFeed = () => {
    if (visualTimerRef.current) {
      clearInterval(visualTimerRef.current);
      visualTimerRef.current = null;
    }
  };

  const queueAudio = (base64: string) => {
    const binary = atob(base64);
    const length = binary.length / 2;
    const floatData = new Float32Array(length);
    const view = new DataView(new ArrayBuffer(binary.length));
    
    for (let i = 0; i < binary.length; i++) {
      view.setUint8(i, binary.charCodeAt(i));
    }
    
    for (let i = 0; i < length; i++) {
      const s = view.getInt16(i * 2, true);
      floatData[i] = s / 32768;
    }
    
    playbackQueueRef.current.push(floatData);
    if (!isPlayingRef.current) {
      playNextInQueue();
    }
  };

  const playNextInQueue = () => {
    if (playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    isPlayingRef.current = true;
    const data = playbackQueueRef.current.shift()!;
    const buffer = audioContextRef.current!.createBuffer(1, data.length, 16000);
    buffer.getChannelData(0).set(data);
    
    const source = audioContextRef.current!.createBufferSource();
    currentSourceRef.current = source;
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    
    const now = audioContextRef.current!.currentTime;
    const startTime = Math.max(now, nextStartTimeRef.current);
    
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    
    source.onended = () => {
      if (currentSourceRef.current === source) {
        currentSourceRef.current = null;
      }
      playNextInQueue();
    };
  };

  const stopPlayback = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
      currentSourceRef.current = null;
    }
    playbackQueueRef.current = [];
    nextStartTimeRef.current = 0;
    isPlayingRef.current = false;
    setIsSpeaking(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (isActive) startVisualFeed();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access is required for OmniSync Lens.");
      setIsLensActive(false);
    }
  };

  const stopCamera = () => {
    stopVisualFeed();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isLensActive) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isLensActive]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // High-res tiling protocol: center-crop to 768x768 to preserve texture
      const size = 768;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        // Calculate crop to maintain aspect ratio and center
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const minDim = Math.min(videoWidth, videoHeight);
        
        const sx = (videoWidth - minDim) / 2;
        const sy = (videoHeight - minDim) / 2;
        
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        setCapturedImage(base64);
        return base64;
      }
    }
    return null;
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setExploreView('launcher')}
            className="p-3 bg-gray-100 text-gray-500 hover:text-sage-primary rounded-2xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">Voice Wellness Coach</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-gray-500 text-sm">Rohini & Kavya are Listening</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLensActive(!isLensActive)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all font-bold text-sm",
              isLensActive 
                ? "bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20" 
                : "bg-white border-gray-200 text-gray-500 hover:border-rose-500 hover:text-rose-500"
            )}
          >
            {isLensActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isLensActive ? "Disable Lens" : "OmniSync Lens"}
          </button>
          <div className="flex items-center gap-2 bg-sage-light/20 px-4 py-2 rounded-2xl border border-sage-primary/10">
            <Activity className="w-4 h-4 text-sage-primary" />
            <span className="text-sm font-bold text-sage-primary">Vitality: {vitalityScore}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        {/* Multimodal Viewport (Camera) */}
        <AnimatePresence>
          {isLensActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full max-w-4xl mx-auto overflow-hidden rounded-[40px] border-4 border-white shadow-2xl relative bg-black aspect-video group"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 m-8 rounded-3xl" />
              <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">GEMINI 2.0 LENS ACTIVE</span>
              </div>
              
              <div className="absolute bottom-6 right-6 pointer-events-auto">
                <button 
                  onClick={captureFrame}
                  className="bg-white/90 backdrop-blur-md text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-white transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-rose-500" />
                  Capture Detail
                </button>
              </div>

              {capturedImage && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-y-6 left-6 w-32 border-2 border-rose-500 rounded-2xl overflow-hidden shadow-2xl bg-black"
                >
                  <img src={`data:image/jpeg;base64,${capturedImage}`} className="w-full h-full object-cover opacity-70" alt="Captured" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white animate-bounce" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Vitals Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Blood Sugar</p>
              <p className="text-sm font-bold text-gray-900">{healthData.vitality.bloodSugar} <span className="text-[10px] font-normal">mg/dL</span></p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Blood Pressure</p>
              <p className="text-sm font-bold text-gray-900">{healthData.vitality.bloodPressure}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Stress Level</p>
              <p className="text-sm font-bold text-gray-900">{healthData.vitality.stress}/100</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-light/30 flex items-center justify-center text-sage-primary">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Heart Rate</p>
              <p className="text-sm font-bold text-gray-900">{healthData.vitality.heartRate} <span className="text-[10px] font-normal">bpm</span></p>
            </div>
          </div>
        </div>

        {/* Central Interactivity Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-12 space-y-12">
          {/* Detected Item Dashboard Card */}
          <AnimatePresence>
            {detectedItem && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 space-y-6 relative overflow-hidden"
              >
                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sage-light/10 rounded-bl-[4rem] -z-0" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-sage-primary uppercase tracking-[0.2em] mb-1">OmniSync Verified</h3>
                    <h2 className="text-3xl font-serif font-bold text-gray-900">{detectedItem.name}</h2>
                    <div className="flex gap-2 mt-2">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                         detectedItem.ayurvedicVerdict === 'Sattvic' ? "bg-emerald-50 text-emerald-600" :
                         detectedItem.ayurvedicVerdict === 'Rajasic' ? "bg-orange-50 text-orange-600" :
                         "bg-rose-50 text-rose-600"
                       )}>
                         {detectedItem.ayurvedicVerdict} Analysis
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDetectedItem(null)}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <p className="text-gray-600 font-medium italic text-lg leading-relaxed border-l-4 border-sage-primary pl-4">
                  "{detectedItem.summary}"
                </p>

                {/* The "Slabs" Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center text-ellipsis">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Calories</p>
                    <p className="text-xl font-bold text-gray-900">{detectedItem.calories}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Protein</p>
                    <p className="text-xl font-bold text-gray-900">{detectedItem.protein}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Carbs</p>
                    <p className="text-xl font-bold text-gray-900">{detectedItem.carbs}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fat</p>
                    <p className="text-xl font-bold text-gray-900">{detectedItem.fat}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Real-time nutritional estimation by AyurMatrix Engine</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personality Avatar */}
          <div className="relative">
            <div className={cn(
              "w-48 h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-10 transition-all duration-500",
              isLensActive ? "border-rose-500 ring-8 ring-rose-500/10" : ""
            )}>
              <img 
                src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_000000008a3871fa83cefae6688ca347.png" 
                alt="Voice Coach" 
                className={cn("w-full h-full object-cover transition-all duration-700", (isSpeaking || isActive) ? "scale-110" : "scale-100")} 
              />
            </div>
            <AnimatePresence>
              {(isSpeaking || isActive) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-sage-primary/20 rounded-full -z-0 blur-2xl"
                />
              )}
            </AnimatePresence>
            
            {isLensActive && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border-2 border-dashed border-rose-500/30 rounded-full -z-1"
              />
            )}
          </div>

          {/* Transcript / AI Thought Bubble */}
          <div className="w-full text-center min-h-[120px] flex flex-col items-center justify-center space-y-4">
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-sage-primary font-bold uppercase tracking-widest text-xs">Live Session Active</p>
                  
                  {isSpeaking ? (
                    <div className="flex justify-center items-end gap-1 h-12">
                      {waveform.map((height, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: height * 0.8 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="w-1.5 bg-sage-primary rounded-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-2 h-12">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 bg-rose-500 rounded-full" 
                      />
                      <p className="text-gray-400 text-sm font-medium">Listening for your voice...</p>
                    </div>
                  )}

                  <p className="text-gray-800 text-xl font-serif max-w-xl mx-auto leading-relaxed">
                    {messages[messages.length - 1]?.parts[0].text || "The AyurSync Matrix is ready. How can I help?"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400 font-medium text-lg">Tap the mic to open a Multimodal Live Session</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={startSession} className="text-xs px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-sage-light/20 transition-all">"Can I eat this Jalebi?"</button>
                    <button onClick={startSession} className="text-xs px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-sage-light/20 transition-all">"How's my vitality today?"</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 text-sm font-medium"
              >
                <ShieldAlert className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Large Interactive Controls */}
          <div className="flex items-center gap-8">
            {/* Camera Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLensActive(!isLensActive)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                isLensActive 
                  ? "bg-rose-50 text-rose-500 border-2 border-rose-200 shadow-lg shadow-rose-500/10" 
                  : "bg-white text-gray-400 border border-gray-100 hover:border-rose-200 hover:text-rose-500"
              )}
              title={isLensActive ? "Close OmniSync Lens" : "Open OmniSync Lens"}
            >
              {isLensActive ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </motion.button>

            {/* Large Interactive Mic */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isActive ? stopSession : startSession}
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-20",
                  isActive 
                    ? "bg-rose-500 text-white shadow-rose-500/40" 
                    : "bg-white text-gray-400 border-2 border-gray-100 hover:border-sage-primary hover:text-sage-primary"
                )}
              >
                {isActive ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </motion.button>
              
              {/* Wave Pulse Animation */}
              {isActive && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-24 h-24 bg-rose-500 rounded-full"
                  />
                </div>
              )}
            </div>

            {/* History Placeholder */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full bg-white text-gray-400 border border-gray-100 flex items-center justify-center hover:text-sage-primary hover:border-sage-primary transition-all opacity-50 cursor-not-allowed"
            >
              <History className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Lens Viewport (Mini) */}
          <AnimatePresence>
            {isLensActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-32 right-8 w-64 h-64 bg-black rounded-3xl border-4 border-white shadow-2xl overflow-hidden z-50 group"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Tiling Overlay UI */}
                <div className="absolute inset-0 border border-rose-500/30 pointer-events-none">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-rose-500/20" />
                  <div className="absolute left-1/2 top-0 w-[1px] h-full bg-rose-500/20" />
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Lens Active</span>
                </div>
                
                <button 
                  onClick={() => setIsLensActive(false)}
                  className="absolute top-4 right-4 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Human Disclaimer */}
        <div className="max-w-2xl mx-auto w-full p-8 bg-gray-50 border border-gray-200 rounded-[40px] flex flex-col items-center gap-6 text-center shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-gray-500 text-sm italic leading-relaxed max-w-lg">
            "I'm here to support your daily wellness journey with AI-driven insights. 
            However, I am not a doctor. Please consult a physical medical professional for any health changes or clinical emergencies."
          </p>
          <div className="flex items-center gap-8 opacity-40 grayscale">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-sage-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Sattvic IQ</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Vital-Logic 2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Regulatory Banner */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-4 transform translate-y-0">
        <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-xl py-2 px-6 rounded-full flex items-center justify-center gap-3">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <p className="text-[10px] md:text-xs font-medium text-gray-700 tracking-tight">
            AyurSync provides wellness insights and is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};
