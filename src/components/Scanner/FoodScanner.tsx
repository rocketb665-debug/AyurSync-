import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';

interface FoodScannerProps {
  setNutritionData: (data: any) => void;
}

export default function FoodScanner({ setNutritionData }: FoodScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const analyzeFoodImage = async (imageSrc: string) => {
    try {
      const response = await axios.post('/api/analyze-food', {
        image: imageSrc,
      });

      setNutritionData(response.data);
    } catch (err: any) {
      console.error("Food analysis failed:", err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || "The spirits of the kitchen are silent. Please try another Capture.";
      alert(errorMsg);
    }
  };

  const captureFood = async () => {
    try {
      setLoading(true);
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        setCameraError(true);
        return;
      }
      
      setCapturedImage(imageSrc);
      await analyzeFoodImage(imageSrc);
    } catch (err: any) {
      console.error("Capture error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none">
        <Sparkles className="w-24 h-24 text-emerald-100" />
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-serif font-bold mb-6 text-[#1A2521]">Vedic Food Lens</h2>

        <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 shadow-inner group">
          {!capturedImage ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'environment' }}
              onUserMediaError={() => setCameraError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
          )}
          
          {cameraError && (
            <div className="absolute inset-0 bg-rose-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40 p-6 text-center">
                <p className="font-bold mb-2">Camera Access Denied</p>
                <p className="text-xs text-rose-100">Please enable camera permissions to use the Vedic Food Lens.</p>
            </div>
          )}
          
          <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/40 rounded-full pointer-events-none opacity-50" />
        </div>

        <div className="mt-8 flex gap-4">
          {!capturedImage ? (
            <button
              onClick={captureFood}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
              {loading ? 'Consulting Sages...' : 'Capture Meal'}
            </button>
          ) : (
            <button
              onClick={() => setCapturedImage(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <RefreshCw className="w-6 h-6" />
              Retake Photo
            </button>
          )}
        </div>
        
        <p className="mt-4 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
            Ensure food is well-lit for precise Dosha analysis
        </p>
      </div>
    </motion.div>
  );
}
