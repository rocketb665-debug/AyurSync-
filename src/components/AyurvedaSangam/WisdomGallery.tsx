import React from 'react';
import { motion } from 'motion/react';
import { 
  Leaf, 
  BookOpen, 
  Utensils, 
  Search, 
  ChevronRight, 
  Sparkles,
  Zap,
  HeartPulse
} from 'lucide-react';

interface WisdomGalleryProps {
  healthData: any;
}

const WisdomGallery: React.FC<WisdomGalleryProps> = ({ healthData }) => {
  const categories = [
    {
      id: 'dravyanuguna',
      title: 'Dravyanuguna',
      subtitle: 'Knowledge of Herbs',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-600',
      items: ['Ashwagandha', 'Tulsi', 'Neem', 'Brahmi']
    },
    {
      id: 'anatomy',
      title: 'Sharira Rachana',
      subtitle: 'The Sacred Anatomy',
      icon: BookOpen,
      color: 'bg-rose-50 text-rose-600',
      items: ['Doshas', 'Dhatus', 'Srotas', 'Chakras']
    },
    {
      id: 'recipes',
      title: 'Aushadhi Kalpana',
      subtitle: 'Medicinal Recipes',
      icon: Utensils,
      color: 'bg-amber-50 text-amber-600',
      items: ['Kada', 'Ghee Infusions', 'Soups', 'Teas']
    }
  ];

  // Personalization logic based on vitals
  const sugar = healthData.vitality.bloodSugar;
  const isHighSugar = sugar > 100;

  const highlights = [
    {
      title: isHighSugar ? 'Bitter Gourd (Karela) Soup' : 'Oatmeal with Cinnamon',
      reason: isHighSugar ? `Your sugar is ${sugar}. This recipe helps balance glucose levels.` : 'Perfect for maintaining your current energy levels.',
      type: 'RECIPE',
      icon: Utensils
    },
    {
      title: 'Triphala Tea',
      reason: 'Support for your digestive fire (Agni) based on your evening patterns.',
      type: 'HERBAL',
      icon: Leaf
    }
  ];

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search for herbs, recipes, or wisdom..." 
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* Personalized Path */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-serif font-bold text-gray-900 tracking-tight">Your Personalized Path</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{item.type}</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">AI RECOMMENDED</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Library className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-lg font-serif font-bold text-gray-900 tracking-tight">Wisdom Categories</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group cursor-pointer">
              <div className={`p-6 rounded-[2.5rem] ${cat.color} transition-all group-hover:shadow-lg group-hover:scale-[1.02] mb-4`}>
                <cat.icon className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-serif font-bold mb-1">{cat.title}</h3>
                <p className="text-xs opacity-70 mb-6">{cat.subtitle}</p>
                
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item} className="flex items-center justify-between bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                      <span className="text-[10px] font-bold uppercase tracking-tight">{item}</span>
                      <ChevronRight className="w-3 h-3 opacity-40" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Motivation */}
      <div className="bg-emerald-900 text-white p-8 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-emerald-800/50 backdrop-blur-xl rounded-full">
            <HeartPulse className="w-12 h-12 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold mb-2">Preserve Your Ojas</h2>
            <p className="text-emerald-100/70 text-sm max-w-md leading-relaxed italic">
              "The strength of the body lies in the purity of the mind and the balance of the elements."
            </p>
          </div>
          <button className="md:ml-auto px-6 py-3 bg-white text-emerald-900 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors">
            Start Daily Ritual
          </button>
        </div>
      </div>
    </div>
  );
};

const Library: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/><path d="M4 18h16"/>
  </svg>
);

export default WisdomGallery;
