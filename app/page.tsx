'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, Obra, syncObras } from '@/lib/db';
import { ObraCard } from '@/components/ObraCard';
import { BottomNav } from '@/components/BottomNav';
import { Toast } from '@/components/Toast';
import { useToastStore } from '@/hooks/useToast';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Library, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showToast = useToastStore((state) => state.show);

  const pullDistance = useMotionValue(0);
  const pullThreshold = 80;
  
  // Progress indicators
  const opacity = useTransform(pullDistance, [0, pullThreshold], [0, 1]);
  const scale = useTransform(pullDistance, [0, pullThreshold], [0.8, 1]);
  const rotate = useTransform(pullDistance, [0, pullThreshold], [0, 180]);

  const fetchObras = useCallback(async () => {
    try {
      const allObras = await db.obras.orderBy('dataCriacao').reverse().toArray();
      setObras(allObras);
    } catch (error) {
      console.error('Error fetching obras:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      await fetchObras();
      
      // Auto-sync with Supabase if online
      if (navigator.onLine) {
        setIsRefreshing(true);
        const result = await syncObras();
        if (result.success) {
          await fetchObras();
          showToast('Sincronizado com a nuvem', 'success');
        }
        setIsRefreshing(false);
      }
    };
    initApp();
  }, [fetchObras]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    if (!navigator.onLine) {
      showToast('Você está offline. Conecte-se para sincronizar.', 'info');
      return;
    }

    setIsRefreshing(true);
    // Simulating network sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    await fetchObras();
    setIsRefreshing(false);
    showToast('Sincronizado com sucesso', 'success');
  };

  const handleDragEnd = () => {
    if (pullDistance.get() >= pullThreshold) {
      handleRefresh();
    }
    pullDistance.set(0);
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-24 relative overflow-x-hidden">
      {/* Pull Indicator */}
      <motion.div 
        style={{ 
          y: isRefreshing ? 20 : pullDistance,
          opacity,
          scale 
        }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-white p-3 rounded-full shadow-lg border border-[var(--color-primary)]/10 text-[var(--color-accent)]">
          <motion.div style={{ rotate: isRefreshing ? 0 : rotate }} animate={isRefreshing ? { rotate: 360 } : {}}>
            <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: pullThreshold + 20 }}
        dragElastic={0.4}
        onDrag={(e, info) => pullDistance.set(Math.max(0, info.offset.y))}
        onDragEnd={handleDragEnd}
        animate={isRefreshing ? { y: 60 } : { y: 0 }}
        className="relative z-10"
      >
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-[var(--color-text)] flex items-center gap-3">
              <span className="text-3xl">🌬️</span> Brisa Literária
            </h1>
            <p className="font-display italic text-base text-[var(--color-muted)] mt-1">
              Ouvir para sentir, sentir para aprender
            </p>
          </div>
          <Link href="/biblioteca" className="p-3 bg-[var(--color-white)] text-[var(--color-primary)] rounded-2xl shadow-lg shadow-[var(--color-shadow)] border border-[var(--color-primary)]/5 hover:scale-110 transition-all">
            <Library size={24} strokeWidth={1.5} />
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--color-white)] h-64 rounded-[20px] animate-pulse flex flex-col p-4 shadow-sm">
                <div className="w-full h-32 bg-gray-100 rounded-xl mb-4" />
                <div className="w-3/4 h-6 bg-gray-100 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {obras.length > 0 ? (
              obras.map((obra, index) => (
                <ObraCard 
                  key={obra.id} 
                  obra={obra} 
                  index={index} 
                  onRemove={() => db.obras.toArray().then(setObras)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-[var(--color-muted)] italic">Nenhuma obra encontrada.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <BottomNav />
      <Toast />
    </div>
  );
}
