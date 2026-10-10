import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderStatus, SupabaseConfig } from '../types/order';

const CONFIG_KEY = 'kds_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        tableName: parsed.tableName || 'pedidos',
      };
    }
  } catch {
    // fallback
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'pedidos',
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  currentClient = null; // reset client instance
}

let currentClient: SupabaseClient | null = null;
let currentConfigSig = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const sig = `${config.url}_${config.anonKey}`;
  if (!currentClient || currentConfigSig !== sig) {
    try {
      currentClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
      currentConfigSig = sig;
    } catch (err) {
      console.error('Erro ao instanciar Supabase Client:', err);
      return null;
    }
  }

  return currentClient;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'URL e Chave Anônima do Supabase não configuradas.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Não foi possível inicializar o cliente do Supabase com as credenciais fornecidas.' };
  }

  try {
    // Attempt to query the table (limit 1)
    const { error } = await client.from(config.tableName).select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: `Conexão bem-sucedida, mas a tabela '${config.tableName}' ainda não existe no seu projeto. Use o script SQL abaixo para criá-la.`,
        };
      }
      return { success: false, message: `Erro ao consultar Supabase: ${error.message}` };
    }

    return { success: true, message: `Conectado com sucesso à tabela '${config.tableName}' no Supabase!` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Falha na conexão de rede com o Supabase.' };
  }
}

export async function fetchOrdersFromSupabase(): Promise<{ data: Order[] | null; error: string | null }> {
  const config = getStoredSupabaseConfig();
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase não configurado' };

  try {
    const { data, error } = await client
      .from(config.tableName)
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // Map rows to Order
    const mapped: Order[] = (data || []).map((row: any) => ({
      id: String(row.id),
      numero: Number(row.numero),
      cliente_nome: String(row.cliente_nome || 'Cliente'),
      produtos: Array.isArray(row.produtos) ? row.produtos : typeof row.produtos === 'string' ? JSON.parse(row.produtos) : [],
      status: (row.status as OrderStatus) || 'recebido',
      origem: row.origem || 'autoatendimento',
      mesa_ou_comanda: row.mesa_ou_comanda || undefined,
      total: row.total ? Number(row.total) : undefined,
      observacao_geral: row.observacao_geral || undefined,
      criado_em: row.criado_em || new Date().toISOString(),
      atualizado_em: row.atualizado_em || new Date().toISOString(),
      tempo_estimado_min: row.tempo_estimado_min ? Number(row.tempo_estimado_min) : undefined,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Erro ao buscar pedidos' };
  }
}

export async function upsertOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  const config = getStoredSupabaseConfig();
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const row = {
      id: order.id,
      numero: order.numero,
      cliente_nome: order.cliente_nome,
      produtos: order.produtos,
      status: order.status,
      origem: order.origem,
      mesa_ou_comanda: order.mesa_ou_comanda || null,
      total: order.total || null,
      observacao_geral: order.observacao_geral || null,
      criado_em: order.criado_em,
      atualizado_em: order.atualizado_em,
      tempo_estimado_min: order.tempo_estimado_min || null,
    };

    const { error } = await client.from(config.tableName).upsert(row, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao gravar pedido no Supabase' };
  }
}

export async function updateOrderStatusInSupabase(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  const config = getStoredSupabaseConfig();
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase não conectado' };

  try {
    const { error } = await client
      .from(config.tableName)
      .update({
        status,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar status no Supabase' };
  }
}

export function subscribeToSupabaseOrders(onPayload: (payload: any) => void): (() => void) | null {
  const config = getStoredSupabaseConfig();
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('kds_pedidos_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: config.tableName },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.error('Falha ao assinar mudanças em tempo real do Supabase:', err);
    return null;
  }
}

export function getSupabaseSqlSchema(tableName = 'pedidos'): string {
  return `-- ==========================================================
-- COZINHA JAH - SCRIPT SQL COMPLETO SUPABASE
-- TABELA, POLÍTICAS RLS E POLÍTICAS DE ARMAZENAMENTO (STORAGE)
-- ==========================================================
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com):

-- 1. CRIAÇÃO DA TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.${tableName} (
    id TEXT PRIMARY KEY,
    numero INTEGER NOT NULL,
    cliente_nome TEXT NOT NULL,
    produtos JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido', 'em_preparacao', 'pronto', 'entregue')),
    origem TEXT DEFAULT 'autoatendimento',
    mesa_ou_comanda TEXT,
    total NUMERIC(10, 2),
    observacao_geral TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    tempo_estimado_min INTEGER DEFAULT 15
);

-- Índices para alta performance de consulta no KDS
CREATE INDEX IF NOT EXISTS idx_${tableName}_status ON public.${tableName}(status);
CREATE INDEX IF NOT EXISTS idx_${tableName}_criado_em ON public.${tableName}(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_${tableName}_numero ON public.${tableName}(numero);

-- Habilitar REPLICA IDENTITY FULL (garante payloads completos no Realtime)
ALTER TABLE public.${tableName} REPLICA IDENTITY FULL;

-- Habilitar Realtime para a tabela de pedidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = '${tableName}'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.${tableName};
  END IF;
END $$;

-- 2. HABILITAR E CONFIGURAR ROW LEVEL SECURITY (RLS) NA TABELA
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar conflito
DROP POLICY IF EXISTS "Leitura de pedidos para Cozinha Jah" ON public.${tableName};
DROP POLICY IF EXISTS "Insercao de pedidos pelo autoatendimento" ON public.${tableName};
DROP POLICY IF EXISTS "Atualizacao de status pela cozinha" ON public.${tableName};
DROP POLICY IF EXISTS "Exclusao de pedidos" ON public.${tableName};
DROP POLICY IF EXISTS "Acesso total KDS autoatendimento" ON public.${tableName};

-- Política 1: Leitura (SELECT) permitida para todos (Totem e Cozinha)
CREATE POLICY "Leitura de pedidos para Cozinha Jah"
ON public.${tableName}
FOR SELECT
TO public, anon, authenticated
USING (true);

-- Política 2: Inserção (INSERT) de novos pedidos pelo autoatendimento
CREATE POLICY "Insercao de pedidos pelo autoatendimento"
ON public.${tableName}
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Política 3: Atualização (UPDATE) de status e checklist pela equipe da cozinha
CREATE POLICY "Atualizacao de status pela cozinha"
ON public.${tableName}
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- Política 4: Exclusão (DELETE) de pedidos se necessário
CREATE POLICY "Exclusao de pedidos"
ON public.${tableName}
FOR DELETE
TO public, anon, authenticated
USING (true);

-- 3. POLÍTICAS DE ARMAZENAMENTO (SUPABASE STORAGE)
-- Criação do Bucket de Comandas (se ainda não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'comandas', 
    'comandas', 
    true, 
    5242880, -- Limite de 5MB por arquivo
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 5242880;

-- Observação: storage.objects já possui RLS habilitado nativamente pelo Supabase.
-- Não execute 'ALTER TABLE storage.objects', apenas as políticas abaixo:

-- Limpar políticas anteriores do Storage se existirem
DROP POLICY IF EXISTS "Visualizacao publica de comandas" ON storage.objects;
DROP POLICY IF EXISTS "Upload de comandas e fotos pelo totem e cozinha" ON storage.objects;
DROP POLICY IF EXISTS "Atualizacao de arquivos de comandas" ON storage.objects;
DROP POLICY IF EXISTS "Exclusao de arquivos de comandas" ON storage.objects;

-- Política de Armazenamento 1: Visualização pública dos arquivos do bucket 'comandas'
CREATE POLICY "Visualizacao publica de comandas"
ON storage.objects
FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'comandas');

-- Política de Armazenamento 2: Upload permitido no bucket 'comandas'
CREATE POLICY "Upload de comandas e fotos pelo totem e cozinha"
ON storage.objects
FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'comandas');

-- Política de Armazenamento 3: Atualização de arquivos no bucket 'comandas'
CREATE POLICY "Atualizacao de arquivos de comandas"
ON storage.objects
FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'comandas')
WITH CHECK (bucket_id = 'comandas');

-- Política de Armazenamento 4: Exclusão de arquivos no bucket 'comandas'
CREATE POLICY "Exclusao de arquivos de comandas"
ON storage.objects
FOR DELETE
TO public, anon, authenticated
USING (bucket_id = 'comandas');
`;
}
