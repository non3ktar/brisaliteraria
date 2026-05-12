'use client';

import { useState, useEffect } from 'react';
import { db, Obra, Categoria, syncObras, saveToSupabase, deleteFromSupabase } from '@/lib/db';
import { BottomNav } from '@/components/BottomNav';
import { Toast } from '@/components/Toast';
import { useToastStore } from '@/hooks/useToast';
import { Plus, Edit, Trash2, X, Save, Lock, LogOut, RefreshCw, Cloud } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const obraSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  autor: z.string().min(1, 'Autor é obrigatório'),
  categoria: z.enum(['Poesia', 'Romance', 'Conto', 'Crônica', 'Teatro']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  imagemUrl: z.string().url('URL de imagem inválida ou vazia'),
  audioUrl: z.string().url('URL de áudio inválida ou vazia'),
  textoTrecho: z.string().optional(),
  duracao: z.string().regex(/^([0-9]{1,2}):([0-5][0-9])$/, 'Formato inválido (ex: 3:57)'),
});

type ObraFormData = z.infer<typeof obraSchema>;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const showToast = useToastStore((state) => state.show);

  const fetchObras = async () => {
    const items = await db.obras.orderBy('dataCriacao').reverse().toArray();
    setObras(items);
  };

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      handleSync(); // Sync on load
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'brisa123';
    if (password === adminPass) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      handleSync();
    } else {
      showToast('Senha incorreta', 'error');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncObras();
    setIsSyncing(false);
    if (result.success) {
      showToast(`${result.count} obras sincronizadas com Supabase`, 'success');
      fetchObras();
    } else {
      showToast('Erro ao sincronizar: ' + result.message, 'error');
      fetchObras(); // Show local data anyway
    }
  };

  const handleDelete = async (obra: Obra) => {
    if (confirm('Tem certeza que deseja excluir esta obra da nuvem?')) {
      try {
        if (obra.remoteId) {
          await deleteFromSupabase(obra.remoteId);
          await db.obras.where('remoteId').equals(obra.remoteId).delete();
          showToast('Obra excluída com sucesso!', 'success');
          fetchObras();
        }
      } catch (error) {
        showToast('Erro ao excluir do Supabase', 'error');
      }
    }
  };

  const openForm = (obra: Obra | null = null) => {
    setEditingObra(obra);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setEditingObra(null);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    showToast('Sessão encerrada', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm glass p-8 rounded-[32px] shadow-xl">
          <div className="w-16 h-16 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-primary)]">
            <Lock size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-center mb-2">Acesso Restrito</h1>
          <p className="text-center text-[var(--color-muted)] text-sm mb-8">Painel Admin - Supabase Cloud</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all bg-white/50"
            />
            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-2xl font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Cloud className="text-[var(--color-primary)]" size={32} />
            Painel Cloud
          </h1>
          <p className="text-[var(--color-muted)]">Gerenciamento automático via Supabase</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-3 bg-white text-[var(--color-primary)] rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-105 active:scale-95"
            title="Sincronizar Agora"
          >
            <RefreshCw size={22} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="p-3 text-[var(--color-muted)] hover:bg-[var(--color-surface)] rounded-2xl transition-all"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
          <button
            onClick={() => openForm()}
            className="bg-[var(--color-accent)] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.05] active:scale-95 transition-all"
          >
            <Plus size={20} />
            Nova obra
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {obras.length > 0 ? obras.map((obra) => (
          <div key={obra.remoteId || obra.id} className="bg-white/70 backdrop-blur-sm border border-white p-4 rounded-[24px] flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <img src={obra.imagemUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
              <div>
                <h3 className="font-bold text-[var(--color-text)] truncate max-w-[200px]">{obra.titulo}</h3>
                <p className="text-xs text-[var(--color-muted)] font-medium">{obra.autor} • {obra.categoria}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openForm(obra)}
                className="p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl transition-all"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(obra)}
                className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-white/30 rounded-[40px] border-2 border-dashed border-white/60 text-[var(--color-muted)] italic">
            Conectando ao Supabase...
          </div>
        )}
      </div>

      {isModalOpen && (
        <AdminForm 
          obra={editingObra} 
          onClose={closeForm} 
          onSave={() => {
            handleSync();
            closeForm();
          }} 
        />
      )}

      <BottomNav />
      <Toast />
    </div>
  );
}

function AdminForm({ obra, onClose, onSave }: { obra: Obra | null, onClose: () => void, onSave: () => void }) {
  const showToast = useToastStore((state) => state.show);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: obra || {
      titulo: '',
      autor: '',
      categoria: 'Poesia',
      descricao: '',
      imagemUrl: '',
      audioUrl: '',
      textoTrecho: '',
      duracao: '0:00',
    }
  });

  const onSubmit = async (data: ObraFormData) => {
    try {
      setIsSaving(true);
      await saveToSupabase({
        ...data,
        remoteId: obra?.remoteId,
        dataCriacao: obra?.dataCriacao || Date.now()
      });
      showToast(obra ? 'Obra atualizada na nuvem!' : 'Obra salva na nuvem!', 'success');
      onSave();
    } catch (error) {
      showToast('Erro ao salvar no Supabase', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold">
            {obra ? 'Editar Obra na Nuvem' : 'Nova Obra na Nuvem'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text)]">Título</label>
              <input {...register('titulo')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none" />
              {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text)]">Autor</label>
              <input {...register('autor')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none" />
              {errors.autor && <p className="text-red-500 text-xs">{errors.autor.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text)]">Categoria</label>
              <select {...register('categoria')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none bg-white">
                <option value="Poesia">Poesia</option>
                <option value="Romance">Romance</option>
                <option value="Conto">Conto</option>
                <option value="Crônica">Crônica</option>
                <option value="Teatro">Teatro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text)]">Duração (MM:SS)</label>
              <input placeholder="ex: 3:57" {...register('duracao')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none" />
              {errors.duracao && <p className="text-red-500 text-xs">{errors.duracao.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-text)]">Descrição</label>
            <textarea {...register('descricao')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none h-24 resize-none" />
            {errors.descricao && <p className="text-red-500 text-xs">{errors.descricao.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-text)]">URL da Capa</label>
            <input {...register('imagemUrl')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none" />
            {errors.imagemUrl && <p className="text-red-500 text-xs">{errors.imagemUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-text)]">URL do Áudio (.mp3)</label>
            <input {...register('audioUrl')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none" />
            {errors.audioUrl && <p className="text-red-500 text-xs">{errors.audioUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-text)]">Trecho Literário (Opcional)</label>
            <textarea {...register('textoTrecho')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none h-32" />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[var(--color-accent)] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            {obra ? 'Atualizar na Nuvem' : 'Publicar na Nuvem'}
          </button>
        </form>
      </div>
    </div>
  );
}
