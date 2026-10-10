import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Cloud, PlusCircle, Search, LogOut, User } from 'lucide-react';
import { soundManager } from '../services/soundEffects';
import { UserSession } from '../services/authService';

interface HeaderProps {
  orderCounts: {
    recebido: number;
    em_preparacao: number;
    pronto: number;
    entregue: number;
    total: number;
  };
  onOpenKioskSimulator: () => void;
  onOpenSupabaseSettings: () => void;
  isSupabaseConnected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orderCounts,
  onOpenKioskSimulator,
  onOpenSupabaseSettings,
  isSupabaseConnected,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.isEnabled());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundManager.playStatusStepSound();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-base tracking-tight shadow-sm">
              J
            </div>
            <div>
              <span className="text-base md:text-lg font-bold tracking-tight text-neutral-100 whitespace-nowrap block">
                Cozinha Jah
              </span>
              <span className="text-[11px] text-neutral-400 block -mt-1 font-mono">
                Painel de Cozinha KDS
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Live Metrics / Search / Clock */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-4 bg-neutral-950/70 border border-neutral-800 rounded-lg px-3 py-1.5 tabular-nums">
            <span className="text-amber-400 font-semibold">{orderCounts.recebido} Recebido</span>
            <span className="text-neutral-700">|</span>
            <span className="text-cyan-400 font-semibold">{orderCounts.em_preparacao} Em Preparo</span>
            <span className="text-neutral-700">|</span>
            <span className="text-emerald-400 font-semibold">{orderCounts.pronto} Pronto</span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400">{orderCounts.entregue} Entregue</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar comanda # ou cliente..."
              className="pl-8 pr-3 py-1 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-48 transition-colors font-sans"
            />
          </div>

          <div className="text-right text-xs">
            <div className="text-neutral-200 font-semibold tabular-nums text-sm">{currentTime}</div>
            <div className="text-[10px] text-neutral-500 capitalize">{currentDate}</div>
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Chime Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros'}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-300 hover:text-white transition-colors"
            aria-label="Controle de Som"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Alternar tela cheia do monitor de cozinha"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-neutral-300 hover:text-white transition-colors hidden sm:inline-flex"
            aria-label="Tela Cheia"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Cloud Database Sync Status Button (sem exibir o nome do provedor) */}
          <button
            onClick={onOpenSupabaseSettings}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isSupabaseConnected
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Configurações de Sincronização em Nuvem"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Nuvem Conectada' : 'Banco em Nuvem'}
            </span>
          </button>

          {/* Kiosk Simulator Primary Action */}
          <button
            onClick={onOpenKioskSimulator}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simular Autoatendimento</span>
            <span className="sm:hidden">Totem</span>
          </button>

          {/* Operator Badge & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-800 ml-1">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-[11px] font-semibold text-neutral-200 truncate max-w-[110px]">
                  {currentUser.nome}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono">
                  {currentUser.cargo}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-red-950/50 border border-neutral-700/60 hover:border-red-800/60 text-neutral-400 hover:text-red-300 transition-colors flex items-center gap-1 text-xs"
                title="Sair do painel (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar if on small screens */}
      <div className="mt-2.5 lg:hidden flex items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar pedido # ou cliente..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>
        <div className="text-neutral-400 font-mono text-xs tabular-nums font-semibold shrink-0">
          {currentTime}
        </div>
      </div>
    </header>
  );
};

