'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface InstallBannerProps {
  onInstall: () => void;
  onClose: () => void;
}

export function InstallBanner({ onInstall, onClose }: InstallBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="fixed bottom-24 left-4 right-4 z-[100]"
      >
        <div className="bg-[var(--color-text)] p-5 rounded-[28px] shadow-2xl flex items-center justify-between gap-4 border border-white/10 overflow-hidden relative">
          {/* Subtle animated background blowing effect */}
          <motion.div 
            animate={{ x: [0, 10, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-[var(--color-primary)] rounded-[18px] flex items-center justify-center text-3xl shadow-lg border border-white/20">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌬️
              </motion.span>
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">Brisa Literária</h3>
              <p className="text-[12px] text-white/60 font-medium">Instalar para ouvir offline</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onInstall}
              className="bg-[var(--color-accent)] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.05] active:scale-95 transition-all"
            >
              Instalar
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-white/40 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
