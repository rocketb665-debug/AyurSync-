import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Flame, Wind, Activity } from 'lucide-react';

export default function NutritionCard({ data }: { data: any }) {
  const stats = [
    { label: 'Calories', value: data.calories, unit: 'kcal', icon: Flame, color: 'bg-orange-50 text-orange-600' },
    { label: 'Protein', value: data.protein, unit: 'g', icon: Activity, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Carbs', value: data.carbs, unit: 'g', icon: Wind, color: 'bg-sky-50 text-sky-600' },
    { label: 'Fat', value: data.fat, unit: 'g', icon: Droplets, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-end justify-between mb-8">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Identified Item</p>
           <h2 className="text-3xl font-serif font-bold text-[#1A2521]">
             {data.name}
           </h2>
        </div>
        <div className="px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
            {data.ayurVerdict || 'Dosha Verified'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.color} p-5 rounded-3xl border border-white/20`}
          >
            <stat.icon className="w-5 h-5 mb-3 opacity-60" />
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black flex items-baseline gap-1">
              {stat.value}
              <span className="text-xs font-medium opacity-60">{stat.unit}</span>
            </h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
