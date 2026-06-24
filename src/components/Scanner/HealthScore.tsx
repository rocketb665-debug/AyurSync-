import React from 'react';
import { motion } from 'motion/react';

export default function HealthScore({ data }: { data: any }) {
  const score = data.healthScore || 75;
  
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Highly Sattvic';
    if (s >= 60) return 'Moderately Balanced';
    return 'Tamasic / High Rajasic';
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-serif">AyurSync Vitality Score</h2>
        <div className={`px-4 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
        </div>
      </div>

      <div className="relative pt-2">
        <div className="flex mb-4 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
              Health Potential
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-black inline-block text-emerald-600">
              {score}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-emerald-50 border border-emerald-100 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getScoreColor(score)}`}
          />
        </div>
      </div>
      
      <p className="text-gray-400 text-[10px] italic leading-relaxed">
        *This score is calculated based on glycemic index, protein density, and classical Ayurvedic compatibility (Viruddha Ahara Check).
      </p>
    </div>
  );
}
