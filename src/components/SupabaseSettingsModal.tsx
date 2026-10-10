import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  UploadCloud, 
  DownloadCloud 
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  getSupabaseSqlSchema 
} from '../services/supabaseClient';
import { SupabaseConfig } from '../types/order';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncAllToSupabase: () => Promise<void>;
  onPullFromSupabase: () => Promise<void>;
  isSyncing: boolean;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onSyncAllToSupabase,
  onPullFromSupabase,
  isSyncing,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredSupabaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTest = async () => {
    saveStoredSupabaseConfig(config);
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Falha desconhecida',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    const sql = getSupabaseSqlSchema(config.tableName || 'pedidos');
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Configurações do Banco de Dados em Nuvem
              </h2>
              <p className="text-xs text-neutral-400">
                Sincronize pedidos e atualizações de status em tempo real com o servidor central
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Inputs */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                URL do Servidor / Projeto em Nuvem
              </label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value.trim() })}
                placeholder="https://seu-servidor-nuvem.co"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Chave de Acesso da API (API Key)
              </label>
              <input
                type="password"
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value.trim() })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Localizada no painel de configurações de API do seu servidor
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Nome da Tabela de Pedidos
              </label>
              <input
                type="text"
                value={config.tableName}
                onChange={(e) => setConfig({ ...config, tableName: e.target.value.trim() })}
                placeholder="pedidos"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Row: Save & Test */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{saveSuccess ? 'Salvo!' : 'Salvar Credenciais'}</span>
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !config.url || !config.anonKey}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
            </button>

            <button
              type="button"
              onClick={onSyncAllToSupabase}
              disabled={isSyncing || !config.url}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 border border-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Enviar Pedidos para a Nuvem</span>
            </button>

            <button
              type="button"
              onClick={onPullFromSupabase}
              disabled={isSyncing || !config.url}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 border border-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Carregar Pedidos da Nuvem</span>
            </button>
          </div>

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-600/50 text-amber-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.success ? 'Conexão Estabelecida' : 'Aviso de Conexão'}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* SQL Script Accordion / Box */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <span>Script SQL de Estrutura e Políticas de Segurança</span>
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mb-2">
              Execute o código abaixo no seu banco de dados para criar a tabela, ativar o <strong>Realtime</strong> e habilitar todas as <strong>Políticas de Segurança e Armazenamento</strong>:
            </p>
            <pre className="p-3 bg-neutral-900 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-56 border border-neutral-800">
              {getSupabaseSqlSchema(config.tableName || 'pedidos')}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>Painel do Servidor de Dados</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
