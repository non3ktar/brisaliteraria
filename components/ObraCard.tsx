'use client';

import { Obra } from '@/lib/db';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Clock, CheckCircle2, Download, Trash2 } from 'lucide-react';
import { useAudioCache } from '@/hooks/useAudioCache';
import { useToast } from '@/hooks/useToast';

interface ObraCardProps {
  obra: Obra;
  index: number;
  onRemove?: () => void;
}

export function ObraCard({ obra, index, onRemove }: ObraCardProps) {
  const { saveOffline, removeOffline, downloading } = useAudioCache();
  const { show } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (obra.baixado) return;
    
    const success = await saveOffline(obra.id!, obra.audioUrl);
    if (success) show('Obra baixada para offline', 'success');
    else show('Falha ao baixar obra', 'error');
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await removeOffline(obra.id!, obra.audioUrl);
    if (success) {
      show('Obra removida do dispositivo', 'info');
      onRemove?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group relative"
    >
      <Link href={`/obra?id=${obra.id}`}>
        <div className="bg-[var(--color-white)] p-3 rounded-[20px] transition-soft shadow-lg shadow-[var(--color-shadow)] hover:shadow-2xl hover:scale-[1.02] border border-[var(--color-primary)]/5">
          <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-2xl">
            <img
              src={obra.imagemUrl}
              alt={obra.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {obra.baixado && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-[var(--color-accent)]">
                <CheckCircle2 size={12} />
                OFFLINE
              </div>
            )}
          </div>
          
          <div className="px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)] block mb-1">
              {obra.categoria}
            </span>
            <h3 className="font-display text-xl font-bold text-[var(--color-text)] mb-0.5 line-clamp-1">
              {obra.titulo}
            </h3>
            <p className="text-[13px] text-[var(--color-muted)] italic mb-1">
              {obra.autor}
            </p>
            <p className="text-[12px] text-[var(--color-text)] opacity-60 line-clamp-2 mb-3 leading-snug">
              {obra.descricao}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-[var(--color-muted)] text-xs font-medium">
                <Clock size={14} strokeWidth={1.5} />
                <span>⏱ {obra.duracao} min</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Download button removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
