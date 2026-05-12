-- Execute este comando no SQL Editor do seu projeto Supabase:

CREATE TABLE obras (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  autor text NOT NULL,
  categoria text NOT NULL,
  descricao text NOT NULL,
  imagemUrl text NOT NULL,
  audioUrl text NOT NULL,
  textoTrecho text,
  duracao text NOT NULL,
  dataCriacao timestamptz DEFAULT now(),
  baixado boolean DEFAULT false
);

-- Habilitar RLS (opcional, para segurança básica simplificada):
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON obras FOR ALL USING (true);
