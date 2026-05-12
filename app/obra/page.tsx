'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { db, Obra } from '@/lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Quote, Download } from 'lucide-react';
import { useAudioCache } from '@/hooks/useAudioCache';
import { useToast } from '@/hooks/useToast';
import { BottomNav } from '@/components/BottomNav';
import { AudioPlayer } from '@/components/AudioPlayer';

function ObraContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { show } = useToast();
  const { saveOffline, downloading } = useAudioCache();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObra = async () => {
      if (!id) return;
      const obraId = parseInt(id);
      const item = await db.obras.get(obraId);
      if (item) setObra(item);
      setLoading(false);
    };
    fetchObra();
  }, [id]);

  const handleDownload = async () => {
    if (!obra) return;
    show('Iniciando download...', 'info');
    const success = await saveOffline(obra.id!, obra.audioUrl);
    if (success) {
      show('Obra disponível offline!', 'success');
      setObra({ ...obra, baixado: true });
    } else {
      show('Erro no download. Verifique sua conexão ou se o link permite download.', 'error');
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--color-bg)]" />;
  if (!obra) return <div className="text-center p-10 font-display">Obra não encontrada.</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] animate-breathe">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <img
          src={obra.imagemUrl}
          alt={obra.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/20 to-transparent" />
        
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-6 p-3 glass text-[var(--color-text)] rounded-full shadow-lg"
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>

        <div className="absolute bottom-10 left-6 right-6">
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 block">
            {obra.categoria}
          </span>
          <h1 className="font-display text-4xl font-bold text-[var(--color-text)] leading-tight mb-2 drop-shadow-sm">
            {obra.titulo}
          </h1>
          <p className="font-display italic text-xl text-[var(--color-muted)]">
            por {obra.autor}
          </p>
        </div>
      </div>

      {/* Player Section */}
      <div className="px-6 -mt-4 relative z-10">
        <AudioPlayer obra={obra} />

        {/* Description Section */}
        <section className="mt-8">
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-[24px] border border-white/40 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">Sobre esta obra</h2>
            <p className="text-[15px] leading-relaxed text-[var(--color-text)] opacity-80">
              {obra.descricao}
            </p>
          </div>
        </section>

        {/* Text Excerpt */}
        {obra.textoTrecho && (
          <section className="mt-8 mb-8">
            <div className="bg-[var(--color-white)] p-8 rounded-[32px] relative overflow-hidden border-l-[4px] border-[var(--color-accent)] shadow-xl shadow-[var(--color-shadow)]">
              <Quote className="absolute -top-4 left-4 text-[var(--color-primary)] opacity-10" size={120} />
              <div className="relative z-10">
                <p className="font-display text-[19px] leading-[1.7] text-[var(--color-text)] italic whitespace-pre-wrap">
                  {obra.textoTrecho}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Download section removed as requested */}
      </div>

      <BottomNav />
    </div>
  );
}

export default function ObraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)]" />}>
      <ObraContent />
    </Suspense>
  );
}
