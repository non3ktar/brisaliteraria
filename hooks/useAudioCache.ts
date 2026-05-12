'use client';

import { useState } from 'react';
import { db } from '@/lib/db';

export function useAudioCache() {
  const [downloading, setDownloading] = useState<number | null>(null);

  const saveOffline = async (obraId: number, audioUrl: string) => {
    try {
      setDownloading(obraId);
      
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(audioUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Falha ao baixar áudio via proxy');
      
      const cache = await caches.open('brisa-audios');
      // Store the ORIGINAL URL as key, but the PROXY response as value
      await cache.put(audioUrl, response);
      
      await db.obras.update(obraId, { baixado: true });
      
      return true;
    } catch (error) {
      console.error('Erro detalhado ao baixar para offline:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Provável erro de CORS. O servidor de áudio (Nekoweb) precisa permitir requisições cross-origin.');
      }
      return false;
    } finally {
      setDownloading(null);
    }
  };

  const removeOffline = async (obraId: number, audioUrl: string) => {
    try {
      const cache = await caches.open('brisa-audios');
      await cache.delete(audioUrl);
      
      await db.obras.update(obraId, { baixado: false });
      
      return true;
    } catch (error) {
      console.error('Erro ao remover do offline:', error);
      return false;
    }
  };

  const getAudioSource = async (audioUrl: string) => {
    const cache = await caches.open('brisa-audios');
    const response = await cache.match(audioUrl);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return audioUrl;
  };

  return { saveOffline, removeOffline, getAudioSource, downloading };
}
