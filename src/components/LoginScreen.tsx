import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, Sparkles, ChefHat } from 'lucide-react';
import { authenticateUser, UserSession } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState<string>('cozinha@jah.com');
  const [password, setPassword] = useState<string>('cozinha123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await authenticateUser(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas');
      }
    } catch {
      setErrorMessage('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-neutral-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-950/20">
            <ChefHat className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 font-sans">
            Cozinha Jah
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Painel de Gerenciamento KDS · Controle de Pedidos
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-neutral-800 pb-4 mb-6">
            <h2 className="text-base font-semibold text-neutral-200">
              Autenticação de Acesso
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Entre com suas credenciais para visualizar e gerenciar os pedidos
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Usuário / E-mail
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: cozinha@jah.com ou cozinha"
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Validando acesso...' : 'Acessar Painel da Cozinha'}</span>
            </button>
          </form>

          {/* Quick preset credentials */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acessos Rápidos da Equipe:</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('cozinha@jah.com', 'cozinha123')}
                className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/50 text-left transition-colors"
              >
                <div className="text-xs font-semibold text-neutral-200">Equipe Cozinha</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">cozinha / cozinha123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('gerente@jah.com', 'admin123')}
                className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/50 text-left transition-colors"
              >
                <div className="text-xs font-semibold text-neutral-200">Gerência / Admin</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">gerente / admin123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-neutral-500 mt-6">
          Acesso restrito aos operadores e funcionários autorizados da Cozinha Jah.
        </p>
      </div>
    </div>
  );
};
