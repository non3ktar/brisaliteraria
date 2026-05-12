'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useToastStore } from '@/hooks/useToast';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function Toast() {
  const { message, type } = useToastStore();

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150]"
        >
          <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-md ${
            type === 'success' ? 'bg-[#4db8a0]/90 text-white' : 
            type === 'error' ? 'bg-red-500/90 text-white' : 
            'bg-[var(--color-primary)]/90 text-white'
          }`}>
            {type === 'success' && <CheckCircle2 size={18} />}
            {type === 'error' && <AlertCircle size={18} />}
            {type === 'info' && <Info size={18} />}
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
