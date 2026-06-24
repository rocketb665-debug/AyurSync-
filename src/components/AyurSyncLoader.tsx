import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../contexts/lib/utils';

interface AyurSyncLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const AyurSyncLoader = ({ size = 'medium', className }: AyurSyncLoaderProps) => {
  const dimensions = {
    small: 'w-8 h-8',
    medium: 'w-24 h-24',
    large: 'w-40 h-40'
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Golden Wave / Vitality Ripple */}
      <motion.div
        animate={{
          scale: [0.8, 2.2],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className={cn(
          "absolute rounded-full border-2 border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.2)]",
          dimensions[size]
        )}
      />
      
      {/* 3D Pulse Logo */}
      <motion.div
        animate={{
          scale: [1, 0, 1],
          opacity: [1, 0, 1],
          filter: ["blur(0px)", "blur(4px)", "blur(0px)"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn("relative z-10", dimensions[size])}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <img 
            src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/1771744121269.png" 
            alt="AyurSync Logo" 
            className="w-full h-full object-cover scale-110" // scale-110 to ensure we fill the circle and hide edges
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>
  );
};

export const AyurSyncLoaderModal = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-white/60 backdrop-blur-xl"
  >
    <div className="text-center space-y-6">
      <AyurSyncLoader size="large" />
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sage-primary font-bold tracking-widest uppercase text-xs"
      >
        Architecting Vitality...
      </motion.p>
    </div>
  </motion.div>
);
