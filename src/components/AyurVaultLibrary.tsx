import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Clock, Target, CheckCircle2, CalendarPlus, Search, AlertCircle } from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { masterLibrary, LibraryVideo } from '../constants/masterLibrary';

interface AyurVaultLibraryProps {
  onBack: () => void;
}

export const AyurVaultLibrary = ({ onBack }: AyurVaultLibraryProps) => {
  const [activeTab, setActiveTab] = useState<'Core' | 'Upper' | 'Lower' | 'Yoga'>('Core');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedVideos, setPinnedVideos] = useState<Set<string>>(new Set());

  const tabToCat = {
    'Core': 'Shakti [Core]',
    'Upper': 'Shakti [Upper]',
    'Lower': 'Shakti [Lower]',
    'Yoga': 'Prana [Yoga]'
  };

  const filteredVideos = masterLibrary.filter(v => {
    const matchesTab = v.cat === tabToCat[activeTab];
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = v.name.toLowerCase().includes(searchLower) || 
                         v.cat.toLowerCase().includes(searchLower) ||
                         v.specialist.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const handleTabChange = (tab: 'Core' | 'Upper' | 'Lower' | 'Yoga') => {
    setActiveTab(tab);
    setActiveVideoId(null);
  };

  const handleBack = () => {
    setActiveVideoId(null);
    onBack();
  };

  const handlePin = (id: string) => {
    setPinnedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#F8FAFC] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Master AyurVault</h2>
            <p className="text-sm text-gray-500">AI-Powered Video Library</p>
          </div>
        </div>
        <button 
          onClick={handleBack}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
        >
          Back to Dashboard
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name, category, or specialist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0 overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 min-w-max w-full">
          {(['Core', 'Upper', 'Lower', 'Yoga'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-8 py-3 rounded-2xl font-bold transition-all border-2",
                activeTab === tab 
                  ? "bg-[#22C55E] text-white border-[#22C55E] shadow-md" 
                  : "bg-white text-gray-600 border-gray-100 hover:border-[#22C55E]/30"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
          {filteredVideos.map(video => (
            <motion.div
              key={video.id || video.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm group flex flex-col transition-shadow duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {video.id ? (
                  activeVideoId === video.id ? (
                    <iframe 
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&modestbranding=1&rel=0`}
                      title={video.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div 
                      onClick={() => setActiveVideoId(video.id)}
                      className="relative w-full h-full cursor-pointer"
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('maxresdefault')) {
                            target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 border border-white/30">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <AlertCircle className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wider">Video Coming Soon</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight line-clamp-2">{video.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-sage-primary bg-sage-primary/5 px-3 py-1 rounded-full">
                    By {video.specialist}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{video.cat}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-sage-primary font-bold bg-sage-primary/5 px-3 py-1.5 rounded-xl">
                    <Target className="w-3.5 h-3.5" />
                    {video.dosha}
                  </div>
                  
                  {video.id && (
                    <button
                      onClick={() => {
                        handlePin(video.id);
                        // In a real app, this would open a scheduler
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all border",
                        pinnedVideos.has(video.id) 
                          ? "bg-sage-primary text-white border-sage-primary shadow-lg shadow-sage-primary/20" 
                          : "bg-white text-gray-600 border-gray-100 hover:border-sage-primary/30 hover:text-sage-primary"
                      )}
                    >
                      <CalendarPlus className="w-4 h-4" />
                      {pinnedVideos.has(video.id) ? "Scheduled" : "Schedule"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
