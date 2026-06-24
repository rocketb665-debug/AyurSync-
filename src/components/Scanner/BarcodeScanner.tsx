import React, { useEffect, useState, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import { motion } from 'motion/react';
import { ScanLine, RefreshCw, XCircle } from 'lucide-react';

interface BarcodeScannerProps {
  setNutritionData: (data: any) => void;
}

export default function BarcodeScanner({ setNutritionData }: BarcodeScannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;
    let controls: any = null;

    const startScanner = async () => {
      try {
        const videoElement = document.getElementById('barcode-video') as HTMLVideoElement;
        if (!videoElement) return;

        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoElement,
          async (result, err) => {
            if (result && isMounted && !isScanningRef.current) {
              const barcode = result.getText();
              if (!barcode) return;
              
              try {
                isScanningRef.current = true;
                setLoading(true);
                const response = await axios.get(`/api/barcode/${barcode}`);
                if (isMounted) {
                  setNutritionData(response.data);
                }
              } catch (err: any) {
                console.error("Barcode API lookup error:", err);
                if (isMounted) {
                  const errorMsg = err.response?.data?.details || err.response?.data?.error || "Product not found in Vedic database.";
                  setError(errorMsg);
                }
              } finally {
                isScanningRef.current = false;
                if (isMounted) {
                  setLoading(false);
                }
              }
            }
          }
        );
      } catch (err) {
        console.error("Barcode scanner initialization failed:", err);
        if (isMounted) setError("Camera access denied or unavailable.");
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (controls) {
        controls.stop();
      }
    };
  }, [setNutritionData]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 relative"
    >
      <h2 className="text-2xl font-serif font-bold mb-6 text-[#1A2521]">Barcode Audit</h2>

      <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden bg-black shadow-inner">
        <video
          id="barcode-video"
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Line Animation */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20 pointer-events-none"
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-2 border-dashed border-white/50 rounded-2xl" />
        </div>

        {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
                <RefreshCw className="w-10 h-10 animate-spin mb-4 text-amber-400" />
                <p className="font-bold tracking-widest uppercase text-xs">Consulting Archives...</p>
            </div>
        )}

        {error && (
            <div className="absolute inset-0 bg-rose-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40 p-10 text-center">
                <XCircle className="w-12 h-12 mb-4 text-rose-300" />
                <h3 className="text-xl font-bold mb-2">Notice</h3>
                <p className="text-rose-100 text-sm mb-6">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="bg-white text-rose-900 px-6 py-2 rounded-full font-bold text-xs uppercase"
                >
                    Try Again
                </button>
            </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100">
        <ScanLine className="w-5 h-5 flex-shrink-0" />
        <p className="text-xs font-medium leading-tight">
            Align the barcode within the frame. Our AI will automatically decode internal ingredients and Vedic properties.
        </p>
      </div>
    </motion.div>
  );
}
