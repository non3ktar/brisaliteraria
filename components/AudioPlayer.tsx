'use client';

import { useState, useRef, useEffect } from 'react';
import { Obra } from '@/lib/db';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAudioCache } from '@/hooks/useAudioCache';

interface AudioPlayerProps {
  obra: Obra;
}

export function AudioPlayer({ obra }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { getAudioSource } = useAudioCache();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [source, setSource] = useState(obra.audioUrl);

  useEffect(() => {
    const resolveSource = async () => {
      const src = await getAudioSource(obra.audioUrl);
      setSource(src);
    };
    resolveSource();
    
    // Revoke object URL on unmount
    return () => {
      if (source && source.startsWith('blob:')) {
        URL.revokeObjectURL(source);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obra.audioUrl, getAudioSource]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-white/50">
      <audio
        ref={audioRef}
        src={source}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      {/* Progress Bar */}
      <div className="mb-8 relative group">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[var(--color-primary)]/20 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
        />
        <div className="flex justify-between mt-2 text-[11px] font-bold text-[var(--color-muted)] tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-10">
        <button 
          onClick={() => skip(-10)}
          className="p-3 text-[var(--color-primary)] hover:bg-white/50 rounded-full transition-all active:scale-90"
          aria-label="Retroceder 10 segundos"
        >
          <RotateCcw size={28} strokeWidth={1.5} />
        </button>

        <button
          onClick={togglePlay}
          className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-xl shadow-[var(--color-shadow)] hover:scale-105 active:scale-95 transition-all"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Pause size={32} fill="currentColor" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Play size={32} fill="currentColor" className="ml-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button 
          onClick={() => skip(10)}
          className="p-3 text-[var(--color-primary)] hover:bg-white/50 rounded-full transition-all active:scale-90"
          aria-label="Avançar 10 segundos"
        >
          <RotateCw size={28} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
