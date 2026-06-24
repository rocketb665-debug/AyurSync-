import React from 'react';

export const AyurSyncBranding = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-20 h-20 mb-4 relative">
        <div className="w-full h-full rounded-full overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
          <img 
            src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/1771744121269.png" 
            alt="AyurSync Logo" 
            className="w-full h-full object-cover scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      <h1 className="text-4xl font-serif font-bold text-sage-primary tracking-tight">
        AyurSync
      </h1>
      <p className="text-sm text-gray-400 font-medium mt-1 tracking-wide">
        Architecting Your Vitality
      </p>
    </div>
  );
};
