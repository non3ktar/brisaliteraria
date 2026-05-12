'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, Obra } from '@/lib/db';
import { ObraCard } from '@/components/ObraCard';
import { BottomNav } from '@/components/BottomNav';
import { Toast } from '@/components/Toast';
import { motion } from 'motion/react';
import { Library, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Biblioteca() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObrasOffline = useCallback(async () => {
    try {
      const offlineObras = await db.obras.filter(obra => obra.baixado === true).toArray();
      setObras(offlineObras);
    } catch (error) {
      console.error('Error fetching offline obras:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchObrasOffline();
  }, [fetchObrasOffline]);

  return (
    <div className="max-w-md mx-auto px-6 pt-12 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] rounded-full transition-colors">
          <ArrowLeft size={24} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">Minha Biblioteca</h1>
          <p className="text-[13px] text-[var(--color-muted)] font-medium">Obras salvas no seu dispositivo</p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-[var(--color-surface)] h-40 rounded-[20px] animate-pulse" />
        </div>
      ) : obras.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {obras.map((obra, index) => (
            <ObraCard 
              key={obra.id} 
              obra={obra} 
              index={index} 
              onRemove={fetchObrasOffline}
            />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-10"
        >
          <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center bg-[var(--color-surface)] rounded-full text-[var(--color-primary)] opacity-50">
            <Library size={80} strokeWidth={1} />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--color-text)] mb-2">Sua biblioteca está vazia</h3>
          <p className="text-[var(--color-muted)] text-sm leading-relaxed">
            Baixe obras para ouvir mesmo quando estiver sem internet.
          </p>
          <Link 
            href="/" 
            className="inline-block mt-8 bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
          >
            Explorar obras
          </Link>
        </motion.div>
      )}

      <BottomNav />
      <Toast />
    </div>
  );
}
