import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types/order';
import { formatElapsedTime, formatTimeOnly, getUrgencyLevel } from '../utils/dateUtils';
import { 
  Play, 
  CheckCircle2, 
  PackageCheck, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  Eye, 
  CheckSquare, 
  Square 
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  onViewDetails: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onToggleItem,
  onViewDetails,
}) => {
  const [elapsed, setElapsed] = useState<string>(formatElapsedTime(order.criado_em));
  const [urgency, setUrgency] = useState(getUrgencyLevel(order.criado_em));

  useEffect(() => {
    // Only update live timer if order is not completed/entregue
    if (order.status === 'entregue') {
      return;
    }

    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(order.criado_em));
      setUrgency(getUrgencyLevel(order.criado_em));
    }, 1000);

    return () => clearInterval(interval);
  }, [order.criado_em, order.status]);

  const allItemsDone = order.produtos.every((p) => p.concluido);
  const completedCount = order.produtos.filter((p) => p.concluido).length;

  // Determine border and accent colors according to urgency and status
  const getCardBorder = () => {
    if (order.status === 'entregue') return 'border-neutral-800 opacity-70';
    if (urgency === 'urgente') return 'border-red-500/80 ring-1 ring-red-500/30';
    if (urgency === 'alerta') return 'border-amber-500/70';
    if (order.status === 'em_preparacao') return 'border-sky-500/60';
    if (order.status === 'pronto') return 'border-emerald-500/60';
    return 'border-neutral-800';
  };

  const getUrgencyBadge = () => {
    if (order.status === 'entregue') {
      return (
        <span className="text-neutral-500 text-xs font-mono tabular-nums">
          Finalizado
        </span>
      );
    }
    if (urgency === 'urgente') {
      return (
        <span className="inline-flex items-center gap-1 text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded text-xs font-mono font-bold animate-pulse tabular-nums">
          <AlertTriangle className="w-3 h-3" />
          {elapsed} min
        </span>
      );
    }
    if (urgency === 'alerta') {
      return (
        <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-xs font-mono font-semibold tabular-nums">
          <Clock className="w-3 h-3" />
          {elapsed} min
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-neutral-300 bg-neutral-900 border border-neutral-700/60 px-2 py-0.5 rounded text-xs font-mono tabular-nums">
        <Clock className="w-3 h-3 text-neutral-400" />
        {elapsed}
      </span>
    );
  };

  // Status transitions
  const handleNextStatus = () => {
    if (order.status === 'recebido') {
      onUpdateStatus(order.id, 'em_preparacao');
    } else if (order.status === 'em_preparacao') {
      onUpdateStatus(order.id, 'pronto');
    } else if (order.status === 'pronto') {
      onUpdateStatus(order.id, 'entregue');
    }
  };

  const handlePrevStatus = () => {
    if (order.status === 'em_preparacao') {
      onUpdateStatus(order.id, 'recebido');
    } else if (order.status === 'pronto') {
      onUpdateStatus(order.id, 'em_preparacao');
    } else if (order.status === 'entregue') {
      onUpdateStatus(order.id, 'pronto');
    }
  };

  return (
    <div
      className={`bg-neutral-900 rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${getCardBorder()}`}
    >
      {/* Top Header of Ticket */}
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-3 mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-neutral-100 font-mono tracking-tight">
                #{order.numero}
              </span>
              <span className="text-xs text-neutral-400 font-medium truncate max-w-[140px]" title={order.cliente_nome}>
                {order.cliente_nome}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 font-mono">
              <span>{order.mesa_ou_comanda || 'Autoatendimento'}</span>
              <span>·</span>
              <span>Recebido às {formatTimeOnly(order.criado_em)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {getUrgencyBadge()}
            <button
              onClick={() => onViewDetails(order)}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors mt-0.5"
              title="Ver detalhes da comanda"
            >
              <Eye className="w-3 h-3" />
              <span>Detalhes</span>
            </button>
          </div>
        </div>

        {/* Observation / Allergen Warning */}
        {order.observacao_geral && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="font-medium truncate">{order.observacao_geral}</span>
          </div>
        )}

        {/* Product Items List */}
        <div className="space-y-2.5 my-2">
          {order.produtos.map((item) => (
            <div
              key={item.id}
              className={`p-2 rounded-lg transition-colors border ${
                item.concluido
                  ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                  : 'bg-neutral-950/70 border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleItem(order.id, item.id)}
                  className="flex items-start gap-2 text-left flex-1 group"
                  title="Clique para marcar item como preparado"
                >
                  <span className="mt-0.5 shrink-0 text-neutral-400 group-hover:text-amber-400 transition-colors">
                    {item.concluido ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {item.quantidade}x
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          item.concluido
                            ? 'line-through text-neutral-400'
                            : 'text-neutral-100'
                        }`}
                      >
                        {item.nome}
                      </span>
                    </div>

                    {item.observacoes && (
                      <p className="text-[11px] text-amber-300/90 mt-0.5 italic pl-0.5">
                        ↳ {item.observacoes}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1 pb-2">
          <span>Itens prontos:</span>
          <span className="tabular-nums font-semibold text-neutral-300">
            {completedCount}/{order.produtos.length}
          </span>
        </div>
      </div>

      {/* Action Footer: Status Progression */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        {/* Revert status button */}
        {order.status !== 'recebido' ? (
          <button
            onClick={handlePrevStatus}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60 transition-colors"
            title="Voltar status anterior"
            aria-label="Voltar status anterior"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-7" /> // spacing balance
        )}

        {/* Primary advancement button */}
        {order.status === 'recebido' && (
          <button
            onClick={handleNextStatus}
            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Preparo</span>
          </button>
        )}

        {order.status === 'em_preparacao' && (
          <button
            onClick={handleNextStatus}
            className={`flex-1 py-2 px-3 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
              allItemsDone
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                : 'bg-sky-500 hover:bg-sky-400 text-neutral-950'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Marcar Pronto</span>
          </button>
        )}

        {order.status === 'pronto' && (
          <button
            onClick={handleNextStatus}
            className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Entregar Pedido</span>
          </button>
        )}

        {order.status === 'entregue' && (
          <div className="flex-1 py-1.5 px-3 bg-neutral-800/80 text-neutral-400 text-xs rounded-lg flex items-center justify-center gap-1.5 font-medium border border-neutral-700/40">
            <PackageCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Entregue ao Cliente</span>
          </div>
        )}
      </div>
    </div>
  );
};
