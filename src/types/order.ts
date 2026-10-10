export type OrderStatus = 'recebido' | 'em_preparacao' | 'pronto' | 'entregue';

export interface OrderItem {
  id: string;
  nome: string;
  quantidade: number;
  observacoes?: string;
  concluido?: boolean;
}

export interface Order {
  id: string;
  numero: number;
  cliente_nome: string;
  produtos: OrderItem[];
  status: OrderStatus;
  origem: 'autoatendimento' | 'balcao' | 'mesa';
  mesa_ou_comanda?: string;
  total?: number;
  observacao_geral?: string;
  criado_em: string; // ISO string
  atualizado_em: string; // ISO string
  tempo_estimado_min?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
}

export interface SyncStatus {
  connected: boolean;
  lastSyncAt: string | null;
  error: string | null;
  isSyncing: boolean;
}
