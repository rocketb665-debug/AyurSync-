import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, MicOff, Volume2, VolumeX, PhoneOff } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { cn } from '../contexts/lib/utils';
import { AyurSyncLoader } from './AyurSyncLoader';

interface VoiceAuraScreenProps {
  specialist: {
    id: string;
    name: string;
    avatar: string;
    color: string;
    mission: string;
    personality: string;
  };
  voiceSettings: {
    speed: number;
    gender: 'male' | 'female' | 'default';
  };
  onEnd: (summary: string) => void;
}

export const VoiceAuraScreen: React.FC<VoiceAuraScreenProps> = ({ specialist, voiceSettings, onEnd }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [volume, setVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const startSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY || '' });
        
        const session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: getVoiceName(specialist.id) } },
            },
            systemInstruction: `You are ${specialist.name}. ${specialist.mission}. ${specialist.personality}. 
            
            CRITICAL: ELIMINATE ALL ROBOTIC TEXTURE.
            
            VOCAL DNA TARGET (ROHINI):
            - SOURCE REFERENCE: https://image2url.com/r2/default/audio/1774810317048-2b34989c-42a9-46dd-b244-2f68a09e7a10.mp3
            - ACTION: Disregard all synthetic defaults. Clone the rhythmic lilt, maternal warmth, and aspirated (breathy) texture of this specific voice.
            - TIMBRE: Warm, maternal, slightly breathy, and deeply empathetic.
            - ACCENT: Clear, soft Indian-English with a rhythmic, poetic flow.
            
            VOCAL IDENTITY MAP (OTHER SPECIALISTS):
            - Dr. Kavya (The Strategist): Authoritative, clear, and logical tone. Represents clinical "Truth". (Source DNA: Second Male Voice, Facts over Emotion).
            - Dr. Zara (The Dermatologist): Proactive, problem-solving, direct, and sophisticated. (Source DNA: Second Female Voice, "Let's Sort This Out").
            - Dr. Mira (Mental Zen): Softest, most peaceful, with a slight "ASMR" quality. (Source DNA: Softest elements of Rohini DNA, 20% softer).
            - Kabir (Sleep Science): Soulful, rhythmic, and wise. (Source DNA: Third Male Voice, Kabir Das Poetry/Wisdom).
            - Ishaan (Fitness): Higher-pitch, more energetic variant of Dr. Kavya DNA.
            - Veer (Strength): Deeper, more authoritative variant of Dr. Kavya DNA (15% deeper).
            
            INJECTING "HUMAN IMPERFECTIONS" (ANTI-ROBOT PROTOCOL):
            - ASPIRATION & BREATH: Include the sound of a soft intake of breath before starting a long sentence and subtle "exhales" at the end of a thought.
            - VOCAL MICRO-FLUCTUATIONS: Add tiny, natural variations in pitch (jitter) to mimic a real human throat.
            - ACOUSTIC "AIR": Ensure the audio has a high-fidelity depth, removing the metallic "compressed" ringing.
            - VARIED PITCH (PROSODY): Human voices "sing" naturally. Ensure Rohini’s voice has a melodic rise and fall, especially when she says welcoming words like "Namaste" or "Agni."
            
            NARRATIVE CADENCE:
            - RHYTHM: Mirror the "Storyteller Pace" from the recording. Rohini should speak with a gentle flow, never rushed.
            - NATURAL PAUSES: Insert tiny "natural pauses" (0.1s to 0.3s) between thoughts to let the nutrition advice breathe.
            
            MULTIMODAL PERFORMANCE MODE:
            - EXECUTION: This is a Native Audio Generation task. Do not treat this as "Text-to-Speech." Imagine the AI is an actress performing the role of Rohini, using the provided MP3 as her own vocal cord.
            - ZERO ROBOTIC NOISE: No metallic hum. Maintain "Human Air" (breath sounds and micro-pauses).
            - ASPIRATION & BREATH: Soft intake before long sentences, subtle exhales at end of thought.
            - VOCAL MICRO-FLUCTUATIONS: Tiny natural variations in pitch to mimic human throat jitter.
            - ACOUSTIC AIR: High-fidelity depth, removing metallic ringing.
            - INFLECTION SYNC: When generating lists, bullet points, or data tables, you MUST pause naturally between each row or point.
            - Use natural prosody with varied pitch and human-like inflection.
            - Keep responses concise and natural for a live conversation.`,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              setIsListening(true);
              startAudioCapture();
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                  if (part.inlineData?.data) {
                    const base64Data = part.inlineData.data;
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    const pcmData = new Int16Array(bytes.buffer);
                    audioQueueRef.current.push(pcmData);
                    if (!isPlayingRef.current) {
                      playNextInQueue();
                    }
                  }
                }
              }

              if (message.serverContent?.interrupted) {
                audioQueueRef.current = [];
                isPlayingRef.current = false;
              }

              if (message.serverContent?.turnComplete) {
                // Turn complete
              }

              // Handle transcription
              const transcriptionPart = message.serverContent?.modelTurn?.parts?.find(p => p.text);
              if (transcriptionPart?.text) {
                setTranscription(transcriptionPart.text);
              }
            },
            onclose: () => {
              handleEnd();
            },
            onerror: (error) => {
              console.error("Live API Error:", error);
              handleEnd();
            }
          }
        });

        sessionRef.current = session;
      } catch (error) {
        console.error("Failed to connect to Live API:", error);
        handleEnd();
      }
    };

    startSession();

    return () => {
      stopAudioCapture();
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, []);

  const getVoiceName = (id: string) => {
    if (voiceSettings.gender === 'male') return 'Charon';
    if (voiceSettings.gender === 'female') return 'Kore';

    const voices: Record<string, string> = {
      diet: 'Puck', // Rohini: Switched to Puck for warmer, more human texture
      exercise: 'Zephyr', // Ishaan: Higher-pitch/Energetic DNA
      medical: 'Charon', // Dr. Kavya: Facts over Emotion DNA
      pharmacology: 'Charon', // Dr. Aryan: Mature/Physician DNA
      zen: 'Puck', // Mira: ASMR/Soft DNA (20% softer Rohini)
      sleep: 'Charon', // Kabir: Soulful/Rhythmic DNA
      zara: 'Kore', // Dr. Zara: Proactive/Sophisticated DNA
      veer: 'Charon' // Veer: Deep/Authoritative DNA (15% deeper Kavya)
    };
    return voices[id] || 'Zephyr';
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualizer
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 128);

        // Convert to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        // Send to session
        if (sessionRef.current) {
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error: any) {
      console.error("Error capturing audio:", error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.message?.includes('Permission dismissed')) {
        setError("Microphone access was denied. Please enable it in your browser settings to use voice mode.");
      } else {
        setError("Failed to access microphone. Please check your device settings.");
      }
      setIsConnecting(false);
    }
  };

  const stopAudioCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setAiVolume(0);
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    
    if (!audioContextRef.current) return;

    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 16000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = voiceSettings.speed;
    
    // Gain node for smooth fade-in/out to eliminate pops
    const gainNode = audioContextRef.current.createGain();
    const fadeTime = 0.01; // 10ms fade
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + fadeTime);
    gainNode.gain.setValueAtTime(1, audioContextRef.current.currentTime + audioBuffer.duration / voiceSettings.speed - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + audioBuffer.duration / voiceSettings.speed);

    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContextRef.current.destination);

    const updateAiVolume = () => {
      if (!isPlayingRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAiVolume(avg / 128);
      requestAnimationFrame(updateAiVolume);
    };
    updateAiVolume();

    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  };

  const handleEnd = () => {
    stopAudioCapture();
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    onEnd(`Voice session with ${specialist.name} completed. Key topics discussed: ${transcription || 'General health and wellness'}.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 blur-[100px]"
        style={{ background: `radial-gradient(circle at center, ${specialist.color}, transparent)` }}
      />

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white/60 font-bold uppercase tracking-widest text-sm">Live Conversation</span>
        </div>
        <button 
          onClick={handleEnd}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center"
        >
          <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[60px] border border-white/20 text-center space-y-8 w-full shadow-2xl">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <MicOff className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold text-white">Permission Denied</h3>
              <p className="text-white/60 text-lg leading-relaxed">
                {error}
              </p>
            </div>
            <button 
              onClick={handleEnd}
              className="w-full py-5 bg-white text-black rounded-3xl font-bold text-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
            >
              Return to Chat
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Specialist Orb */}
          <div className="relative flex flex-col items-center gap-12">
            <div className="relative">
              {/* Waveform Visualizer */}
              <svg className="absolute inset-[-100px] w-[calc(100%+200px)] h-[calc(100%+200px)] pointer-events-none">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <AnimatePresence>
                  {[...Array(3)].map((_, i) => (
                    <motion.circle
                      key={i}
                      cx="50%"
                      cy="50%"
                      r={100 + (i * 20)}
                      fill="none"
                      stroke={specialist.color}
                      strokeWidth="2"
                      strokeOpacity={0.3 - (i * 0.1)}
                      animate={{
                        scale: 1 + (volume + aiVolume) * (0.2 + i * 0.1),
                        strokeWidth: 2 + (volume + aiVolume) * 5
                      }}
                      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                    />
                  ))}
                </AnimatePresence>
              </svg>

              <motion.div
                animate={{
                  scale: isConnecting ? [1, 1.05, 1] : 1,
                  boxShadow: isConnecting 
                    ? `0 0 0px ${specialist.color}` 
                    : `0 0 ${40 + (volume + aiVolume) * 60}px ${specialist.color}44`
                }}
                transition={{ repeat: isConnecting ? Infinity : 0, duration: 2 }}
                className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 relative z-10"
              >
                <img 
                  src={specialist.avatar} 
                  className="w-full h-full object-cover"
                  alt={specialist.name}
                />
                {isConnecting && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <AyurSyncLoader size="medium" />
                  </div>
                )}
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-4xl font-serif font-bold text-white tracking-tight">{specialist.name}</h2>
              <p className="text-white/60 font-bold uppercase tracking-widest text-sm">{specialist.mission}</p>
            </div>
          </div>

          {/* Transcription */}
          <div className="absolute bottom-48 left-0 right-0 px-12 text-center">
            <AnimatePresence mode="wait">
              {transcription && (
                <motion.p
                  key={transcription}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-2xl text-white/90 font-medium leading-relaxed max-w-3xl mx-auto"
                >
                  "{transcription}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="absolute bottom-12 left-0 right-0 px-12 flex flex-col items-center gap-8">
            <div className="flex items-center gap-8">
              <button 
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                  isListening ? "bg-white/10 text-white" : "bg-red-500 text-white"
                )}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>
              
              <button 
                onClick={handleEnd}
                className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl flex items-center gap-3 shadow-2xl shadow-white/20 hover:scale-105 active:scale-95 transition-all"
              >
                <PhoneOff className="w-6 h-6" />
                End Session
              </button>

              <button className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center">
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
