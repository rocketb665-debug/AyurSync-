import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Mail, MessageCircle, ExternalLink, Heart, Sun, Brain } from 'lucide-react';
import { cn } from '../contexts/lib/utils';

interface ArtOfLivingViewProps {
  onBack: () => void;
  onNavigateToHappiness: () => void;
  onNavigateToIntuition: () => void;
  profileImage?: string;
  onProfileClick: () => void;
}

export const ArtOfLivingView = ({ onBack, onNavigateToHappiness, onNavigateToIntuition, profileImage, onProfileClick }: ArtOfLivingViewProps) => {
  const whatsappNumber = "+919165459791";
  const whatsappMessage = encodeURIComponent("I want to learn more about the Art of Living programs through AyurSync.");
  const emailAddress = "Ayursync.ai.help@gmail.com";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Art of Living Wisdom</h1>
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
        {/* Hero Video Section */}
        <div className="px-6 pt-6">
          <div className="aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/fJQoc8jK9vQ" 
              title="Art of Living Wisdom" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Wisdom Feed Section */}
        <div className="px-8 pt-12 space-y-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sun className="w-5 h-5 text-orange-500" />
            Wisdom Feed
          </h3>
          
          <div className="space-y-12">
            {/* Entry 1 */}
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg bg-black border border-gray-100">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/-Iw-3JNbqS8" 
                  title="Philosophy of Stress-Free Living" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  A deep dive into the philosophy of living a stress-free, violence-free life.
                </p>
              </div>
            </div>

            {/* Entry 2 */}
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg bg-black border border-gray-100">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/WUCRpcUjbDc" 
                  title="Managing Mind and Emotions" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  Practical wisdom for managing the mind and emotions in the modern world.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 pt-12 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Sun className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900">A Global Movement for Peace</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed font-serif italic">
              "Unless we have a stress-free mind and a violence-free society, we cannot achieve world peace."
            </p>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Founded in 1981 by Gurudev Sri Sri Ravi Shankar, The Art of Living is an educational and humanitarian movement engaged in stress-management and service initiatives. The organization operates globally in 180+ countries and has touched the lives of over 500 million people.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Art of Living offers several stress-elimination and self-development programs based on breathing techniques, meditation, and yoga. These programs have helped millions around the world to overcome stress, depression, and violent tendencies.
              </p>
            </div>
          </section>

          {/* Program Breakdown */}
          <section className="space-y-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-sage-primary" />
              Program Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Adults Section */}
              <motion.div 
                whileHover={{ y: -5 }}
                onClick={onNavigateToHappiness}
                className="bg-sage-light/20 border border-sage-primary/10 rounded-[40px] p-8 space-y-4 cursor-pointer hover:bg-sage-light/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sage-primary">For Adults 🧘‍♂️</span>
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">The Happiness Program</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Experience the power of **Sudarshan Kriya® (SKY)**, a rhythmic breathing technique that harmonizes the body, mind, and emotions.
                </p>
                <ul className="space-y-2">
                  {['Sudarshan Kriya® (SKY)', 'Mind Management', 'Stress Release', 'Energy Boost'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Kids Section */}
              <motion.div 
                whileHover={{ y: -5 }}
                onClick={onNavigateToIntuition}
                className="bg-blue-50/50 border border-blue-100 rounded-[40px] p-8 space-y-4 cursor-pointer hover:bg-blue-100/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">For Kids ☀️</span>
                  <Sun className="w-5 h-5 text-orange-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">The Intuition Process</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Help children tap into their innate potential by awakening their **"Sixth Sense"** and enhancing their focus and emotional balance.
                </p>
                <ul className="space-y-2">
                  {['Awakening Sixth Sense', 'Emotional Balance', 'Enhanced Focus', 'Confidence Building'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>
        </div>
      </div>

      {/* Communication Footer */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
          <a 
            href={`mailto:${emailAddress}`}
            className="flex-1 bg-gray-900 text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-black transition-all shadow-lg"
          >
            <Mail className="w-5 h-5" />
            Email Support
          </a>
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-[#22c35e] transition-all shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </motion.div>
  );
};
