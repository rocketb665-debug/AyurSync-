import React from 'react';
import { motion } from 'motion/react';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Coffee, 
  Utensils, 
  Brain,
  Ghost,
  Sprout
} from 'lucide-react';

const Dinacharya: React.FC = () => {
  const schedule = [
    {
      time: '4:00 AM - 6:00 AM',
      period: 'Brahma Muhurta',
      title: 'The Divine Hour',
      action: 'Waking up, meditation, and introspection. The best time for absorption of knowledge.',
      icon: Sunrise,
      color: 'text-violet-600 bg-violet-50'
    },
    {
      time: '6:00 AM - 10:00 AM',
      period: 'Kapha Time',
      title: 'Earth & Water',
      action: 'Vigorous exercise, herbal cleansing, and a light breakfast. Replace morning coffee with Ginger-Tulsi infusion.',
      icon: Sprout,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      time: '10:00 AM - 2:00 PM',
      period: 'Pitta Time',
      title: 'Fire & Transformation',
      action: 'The strongest Agni (Digestive Fire). Consume your largest meal of the day now.',
      icon: Sun,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      time: '2:00 PM - 6:00 PM',
      period: 'Vata Time',
      title: 'Air & Space',
      action: 'Mental activity, creativity, and light movement. Hydrate with warm water and fennel seeds.',
      icon: Brain,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      time: '6:00 PM - 10:00 PM',
      period: 'Kapha Evening',
      title: 'Coiling Down',
      action: 'Light dinner, social connection, and early rest. Dim lights to signal the body.',
      icon: Sunset,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      time: '10:00 PM - 2:00 AM',
      period: 'Deep Pitta',
      title: 'Metabolic Repair',
      action: 'Deep sleep for cellular detoxification and liver processing. Avoid blue light.',
      icon: Moon,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">The Ayurvedic Clock</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Sync your biological rhythms with the natural cycle of the day to optimize energy, digestion, and sleep.
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12">
          {schedule.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Dot on line */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full z-10 hidden md:block" />

              {/* Content Card */}
              <div className="flex-1 w-full bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">{item.time}</h4>
                    <h3 className="font-serif font-bold text-lg text-gray-900">{item.period}</h3>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.action}</p>
              </div>

              {/* Spacer for flow */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Replacement Guide */}
      <div className="mt-16 bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Coffee className="w-6 h-6 text-amber-600" />
          The Ritual Shift
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
            <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-4">REPLACE (The Agni Inhibitor)</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-400">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Morning Coffee</p>
                <p className="text-[10px] text-gray-500">Dehydrating and causes Vata imbalance.</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">RENEW (The Life Infusion)</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-400">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Holy Basil & Ginger</p>
                <p className="text-[10px] text-gray-500">Kindles Agni without the caffeine crash.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dinacharya;
