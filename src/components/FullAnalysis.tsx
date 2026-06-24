import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, Activity, Sun, ShieldAlert, Info, Brain } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface FullAnalysisProps {
  data: any;
  onBack: () => void;
}

export const FullAnalysis = ({ data, onBack }: FullAnalysisProps) => {
  if (!data) return null;

  return (
    <div className="min-h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-6 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Full Vitality Report</h2>
          <p className="text-gray-500 text-sm italic">Detailed Ayurvedic analysis for {data.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* AI Nutritionist Opinion Section */}
          {data.details.nutritionistOpinion && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-sage-primary">
                <Brain className="w-6 h-6" />
                <h3 className="text-xl font-bold uppercase tracking-wider">AI Nutritionist Opinion</h3>
              </div>
              <div className="bg-sage-primary/5 p-8 rounded-[40px] border border-sage-primary/20 shadow-sm">
                <p className="text-sage-primary font-bold text-lg leading-relaxed italic">
                  "{data.details.nutritionistOpinion}"
                </p>
              </div>
            </section>
          )}

          {/* Main Guidance Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-sage-primary">
              <Activity className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Nationalized Guidance</h3>
            </div>
            <div className="bg-sage-light/5 p-8 rounded-[40px] border border-sage-primary/10">
              <p className="text-gray-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                {data.details.fullReport || data.details.guidance}
              </p>
            </div>
          </section>

          {/* Food Specifics */}
          {data.type === 'FOOD' && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Calories</p>
                <p className="text-xl font-bold text-gray-900">{data.details.calories || 'N/A'}</p>
              </div>
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Protein</p>
                <p className="text-xl font-bold text-gray-900">{data.details.protein || 'N/A'}</p>
              </div>
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Fiber</p>
                <p className="text-xl font-bold text-gray-900">{data.details.fiber || 'N/A'}</p>
              </div>
              <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Carbs</p>
                <p className="text-xl font-bold text-gray-900">{data.details.carbs || 'N/A'}</p>
              </div>
            </section>
          )}

          {/* Medicine Specifics */}
          {data.type === 'MEDICINE' && (
            <section className="space-y-6">
              <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Activity className="w-6 h-6" />
                  <p className="font-black uppercase tracking-widest text-xs">Active Ingredients</p>
                </div>
                <p className="text-2xl font-serif font-bold text-gray-900">{data.details.activeIngredients}</p>
                <hr className="border-blue-100" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Mechanism of Action</p>
                  <p className="text-gray-700 leading-relaxed font-medium">{data.details.mechanismOfAction}</p>
                </div>
                {data.details.safetyWarning && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-700">{data.details.safetyWarning}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Bio-Markers Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-primary/10 flex items-center justify-center text-sage-primary">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-sage-primary uppercase tracking-widest">Prana Level</p>
                <p className="text-3xl font-bold text-gray-900">{data.pranaLevel}/10</p>
                <p className="text-[10px] text-gray-400 mt-1">Vital life force energy density.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Dosha Impact</p>
                <p className="text-lg font-bold text-gray-900">{data.doshaImpact}</p>
                <p className="text-[10px] text-gray-400 mt-1">Effect on Vata, Pitta, and Kapha.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Vitality Synergy</p>
                <p className="text-sm font-bold text-gray-900">{data.vitalitySynergy}</p>
                <p className="text-[10px] text-gray-400 mt-1">Optimal pairing for health.</p>
              </div>
            </div>
          </section>

          {/* Detailed Verdict Points */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-sage-primary">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Ayurvedic Verdict</h3>
            </div>
            <div className="space-y-4">
              {data.verdict?.map((point: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sage-primary font-bold text-sm shadow-sm shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mandatory Disclaimer & Safety Footer (Repositioned & Neutral) */}
          <div className="pt-12 border-t border-gray-100 space-y-6">
            <div className="p-8 bg-gray-50 border border-gray-100 rounded-[40px]">
              <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest leading-relaxed text-center">
                DISCLAIMER: THIS AI ANALYSIS IS FOR EDUCATIONAL PURPOSES ONLY. DO NOT USE TO IDENTIFY MEDICINES OR HAZARDOUS SUBSTANCES. ALWAYS CONSULT A QUALIFIED DOCTOR BEFORE CONSUMING ANY UNKNOWN ITEM.
              </p>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
              ⚠️ DANGER: AI CAN MAKE MISTAKES. NEVER USE THIS TO IDENTIFY MEDICINES, CHEMICALS, OR WILD PLANTS. IF YOU FEEL SICK, SEE A DOCTOR IMMEDIATELY.
            </p>
          </div>

          {/* Footer Info */}
          <div className="flex items-center gap-3 p-6 bg-sage-light/5 rounded-3xl text-xs text-gray-500 italic">
            <Info className="w-5 h-5 text-sage-primary shrink-0" />
            <p>This report is generated by AyurSync OmniSync Lens using multi-modal AI analysis. It is intended for educational purposes and should not replace professional medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
