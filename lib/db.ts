import Dexie, { type Table } from 'dexie';
import { createClient } from '@supabase/supabase-js';

export type Categoria = 'Poesia' | 'Romance' | 'Conto' | 'Crônica' | 'Teatro';

export interface Obra {
  id?: number; // Local ID
  remoteId?: string; // Supabase ID (UUID)
  titulo: string;
  autor: string;
  categoria: Categoria;
  descricao: string;
  imagemUrl: string;
  audioUrl: string;
  textoTrecho?: string;
  duracao: string;
  dataCriacao: number;
  baixado: boolean;
}

export interface Configuracao {
  chave: string;
  valor: any;
}

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class BrisaDatabase extends Dexie {
  obras!: Table<Obra>;
  configuracoes!: Table<Configuracao>;

  constructor() {
    super('BrisaLiterariaDB');
    this.version(4).stores({
      obras: '++id, remoteId, titulo, autor, categoria, baixado, dataCriacao',
      configuracoes: 'chave'
    });
  }
}

export const db = new BrisaDatabase();

// --- Sync Logic with Supabase ---

export async function syncObras() {
  try {
    // 1. Fetch from Supabase
    const { data: remoteObras, error } = await supabase
      .from('obras')
      .select('*')
      .order('datacriacao', { ascending: false }); // Use lowercase

    if (error) throw error;
    if (!remoteObras) return { success: false, message: 'Nenhuma obra encontrada.' };

    // 2. Get local works that are downloaded (preserve status)
    const localObras = await db.obras.toArray();
    const downloadedRemoteIds = new Set(
      localObras.filter(o => o.baixado && o.remoteId).map(o => o.remoteId)
    );

    // 3. Clear and update local DB
    await db.obras.clear();

    const obrasToSave = remoteObras.map(obra => ({
      remoteId: obra.id, 
      id: undefined, 
      titulo: obra.titulo,
      autor: obra.autor,
      categoria: obra.categoria,
      descricao: obra.descricao,
      imagemUrl: obra.imagemurl || obra.imagemUrl, // Handle both just in case
      audioUrl: obra.audiourl || obra.audioUrl,
      textoTrecho: obra.textotrecho || obra.textoTrecho,
      duracao: obra.duracao,
      baixado: downloadedRemoteIds.has(obra.id),
      dataCriacao: obra.datacriacao ? new Date(obra.datacriacao).getTime() : Date.now()
    }));

    await db.obras.bulkAdd(obrasToSave);
    
    return { success: true, count: remoteObras.length };
  } catch (error) {
    console.error('Supabase sync error:', error);
    return { success: false, message: (error as Error).message };
  }
}

// Helper to save to Supabase
export async function saveToSupabase(obra: Partial<Obra>) {
  const { id, baixado, remoteId, dataCriacao, ...dataToSave } = obra as any;
  
  // Map JS property names to Supabase column names (all lowercase)
  const payload = {
    titulo: dataToSave.titulo,
    autor: dataToSave.autor,
    categoria: dataToSave.categoria,
    descricao: dataToSave.descricao,
    imagemurl: dataToSave.imagemUrl, // mapping camelCase to lowercase
    audiourl: dataToSave.audioUrl,
    textotrecho: dataToSave.textoTrecho,
    duracao: dataToSave.duracao,
    datacriacao: dataCriacao ? new Date(dataCriacao).toISOString() : new Date().toISOString()
  };

  if (remoteId) {
    const { error } = await supabase
      .from('obras')
      .update(payload)
      .eq('id', remoteId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('obras')
      .insert([payload]);
    if (error) throw error;
  }
}

// Helper to delete from Supabase
export async function deleteFromSupabase(remoteId: string) {
  const { error } = await supabase
    .from('obras')
    .delete()
    .eq('id', remoteId);
  if (error) throw error;
}
