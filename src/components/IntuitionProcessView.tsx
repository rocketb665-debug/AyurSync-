import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Sparkles, Brain, Star } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface IntuitionProcessViewProps {
  onBack: () => void;
  profileImage?: string;
  onProfileClick: () => void;
}

const successStories = [
  { id: 'Hdjy3slf7Lo', name: 'Success Story 1' },
  { id: '_4frNVes6BM', name: 'Success Story 2' },
  { id: 'a4XyNMt-hXQ', name: 'Success Story 3' },
  { id: 'rR2JymEr71g', name: 'Success Story 4' },
  { id: 'GiePukOWtPM', name: 'Success Story 5' },
  { id: 'WvMAUDgazo4', name: 'Success Story 6' },
  { id: 'pbc9Q9uV6Xs', name: 'Success Story 7' },
];

export const IntuitionProcessView = ({ onBack, profileImage, onProfileClick }: IntuitionProcessViewProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-[100] bg-[#F5F3FF] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-indigo-600/90 backdrop-blur-xl border-b border-indigo-400 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">The Intuition Process</h1>
        </div>

        <motion.div
          layoutId="user-profile-star"
          className="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white shrink-0 cursor-pointer flex items-center justify-center font-serif font-bold"
          onClick={onProfileClick}
        >
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLDivElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={cn(
              "w-full h-full flex items-center justify-center bg-sage-primary text-white text-sm",
              profileImage && "hidden"
            )}
          >
            S
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto pb-32">
        {/* Main Video Section */}
        <div className="px-6 pt-6">
          <div className="aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-black border-4 border-white">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/h_bq8gqWxyE" 
              title="The Intuition Process" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-12 space-y-12">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <Brain className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold text-indigo-900">Awaken Latent Faculties</h2>
            </div>
            <p className="text-xl text-indigo-900 leading-relaxed font-serif text-center italic">
              "A 2-day program for children and teenagers (ages 5-18) that awakens the mind’s latent faculties, enhancing confidence, creativity, and decision-making through ancient techniques."
            </p>
          </section>

          {/* Success Stories Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Success Stories
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {successStories.map((video) => (
                <motion.div 
                  key={video.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[32px] overflow-hidden border border-indigo-100 shadow-sm group"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img 
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} 
                      alt={video.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                      }}
                    />
                    <a 
                      href={`https://youtu.be/${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30">
                        <Play className="w-5 h-5 fill-current ml-1" />
                      </div>
                    </a>
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <Star className="w-4 h-4 text-indigo-300" />
                    <span className="text-sm font-bold text-gray-700">Student Achievement</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
