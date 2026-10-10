import React from 'react';
import { 
  X, 
  Printer, 
  Clock, 
  Calendar, 
  User, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  PackageCheck, 
  RotateCcw 
} from 'lucide-react';
import { Order, OrderStatus } from '../types/order';
import { formatDateTime, formatElapsedTime, formatTimeOnly } from '../utils/dateUtils';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onToggleItem,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'recebido':
        return { label: 'Recebido (Aguardando)', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'em_preparacao':
        return { label: 'Em Preparação', bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30' };
      case 'pronto':
        return { label: 'Pronto p/ Retirada', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'entregue':
        return { label: 'Entregue ao Cliente', bg: 'bg-neutral-800 text-neutral-300 border-neutral-700' };
    }
  };

  const statusConfig = getStatusLabel(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-neutral-100">
                #{order.numero}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${statusConfig.bg}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Imprimir comanda de cozinha"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <User className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 block">Cliente</span>
                <span className="font-semibold">{order.cliente_nome}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-300">
              <ShoppingBag className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 block">Origem</span>
                <span className="font-semibold">{order.mesa_ou_comanda || 'Autoatendimento'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-300">
              <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 block">Data e Hora</span>
                <span className="font-mono">{formatDateTime(order.criado_em)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-300">
              <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 block">Tempo Decorrido</span>
                <span className="font-mono font-semibold text-amber-400 tabular-nums">
                  {formatElapsedTime(order.criado_em)}
                </span>
              </div>
            </div>
          </div>

          {/* Observations */}
          {order.observacao_geral && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block font-semibold">Observação do Cliente:</strong>
                <span>{order.observacao_geral}</span>
              </div>
            </div>
          )}

          {/* Products List */}
          <div>
            <h3 className="text-xs font-bold text-neutral-200 mb-2.5">
              Itens da Comanda ({order.produtos.length})
            </h3>
            <div className="space-y-2">
              {order.produtos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleItem(order.id, item.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    item.concluido
                      ? 'bg-neutral-950/40 border-neutral-800 text-neutral-500 line-through'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-100'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {item.quantidade}x
                      </span>
                      <span className="text-sm font-semibold">{item.nome}</span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {item.concluido ? '✓ Feito' : 'Pendente'}
                    </span>
                  </div>
                  {item.observacoes && (
                    <p className="text-xs text-amber-300/80 mt-1 italic pl-6">
                      Obs: {item.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Printable Ticket Receipt Preview */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-[11px] text-neutral-400">
            <div className="text-center border-b border-dashed border-neutral-800 pb-2 mb-2">
              <p className="font-bold text-neutral-200">*** COZINHA JAH - KDS ***</p>
              <p>PEDIDO #{order.numero} - {order.origem.toUpperCase()}</p>
              <p>{formatTimeOnly(order.criado_em)}</p>
            </div>
            <div className="space-y-1 mb-2">
              {order.produtos.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{p.quantidade}x {p.nome}</span>
                </div>
              ))}
            </div>
            {order.total ? (
              <div className="border-t border-dashed border-neutral-800 pt-2 flex justify-between font-bold text-neutral-200">
                <span>TOTAL ESTIMADO:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex flex-wrap items-center justify-between gap-2">
          {/* Quick status transitions */}
          <div className="flex items-center gap-1.5">
            {order.status !== 'recebido' && (
              <button
                type="button"
                onClick={() => {
                  const prevStatusMap: Record<OrderStatus, OrderStatus> = {
                    recebido: 'recebido',
                    em_preparacao: 'recebido',
                    pronto: 'em_preparacao',
                    entregue: 'pronto',
                  };
                  onUpdateStatus(order.id, prevStatusMap[order.status]);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors"
                title="Voltar status"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            {order.status === 'recebido' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'em_preparacao')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Preparação</span>
              </button>
            )}

            {order.status === 'em_preparacao' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'pronto')}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como Pronto</span>
              </button>
            )}

            {order.status === 'pronto' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, 'entregue')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Finalizar Entrega</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
