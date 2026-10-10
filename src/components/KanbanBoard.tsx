import React, { useState } from 'react';
import { Order, OrderStatus } from '../types/order';
import { OrderCard } from './OrderCard';
import { 
  Inbox, 
  Flame, 
  CheckCircle, 
  CheckCheck, 
  ArrowUpDown, 
  EyeOff, 
  Eye 
} from 'lucide-react';

interface KanbanBoardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  onViewDetails: (order: Order) => void;
  searchQuery: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  orders,
  onUpdateStatus,
  onToggleItem,
  onViewDetails,
  searchQuery,
}) => {
  const [hideDelivered, setHideDelivered] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'oldestFirst' | 'newestFirst'>('oldestFirst');

  // Filter by search query if typed
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchNumber = order.numero.toString().includes(q);
    const matchName = order.cliente_nome.toLowerCase().includes(q);
    const matchItem = order.produtos.some((p) => p.nome.toLowerCase().includes(q));
    return matchNumber || matchName || matchItem;
  });

  // Sort orders (FIFO is standard for kitchen displays)
  const sortFn = (a: Order, b: Order) => {
    const timeA = new Date(a.criado_em).getTime();
    const timeB = new Date(b.criado_em).getTime();
    return sortOrder === 'oldestFirst' ? timeA - timeB : timeB - timeA;
  };

  const columns: {
    status: OrderStatus;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClasses: {
      headerBg: string;
      titleColor: string;
      badgeBg: string;
      badgeText: string;
      borderColor: string;
    };
  }[] = [
    {
      status: 'recebido',
      title: 'Recebidos',
      subtitle: 'Aguardando início do preparo',
      icon: <Inbox className="w-4 h-4 text-amber-400" />,
      colorClasses: {
        headerBg: 'bg-amber-950/20',
        titleColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-500/30',
        badgeText: 'text-amber-300',
        borderColor: 'border-amber-500/30',
      },
    },
    {
      status: 'em_preparacao',
      title: 'Em Preparação',
      subtitle: 'Em produção na cozinha',
      icon: <Flame className="w-4 h-4 text-sky-400" />,
      colorClasses: {
        headerBg: 'bg-sky-950/20',
        titleColor: 'text-sky-400',
        badgeBg: 'bg-sky-500/20 border-sky-500/30',
        badgeText: 'text-sky-300',
        borderColor: 'border-sky-500/30',
      },
    },
    {
      status: 'pronto',
      title: 'Prontos',
      subtitle: 'Aguardando retirada do cliente',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      colorClasses: {
        headerBg: 'bg-emerald-950/20',
        titleColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/30',
        badgeText: 'text-emerald-300',
        borderColor: 'border-emerald-500/30',
      },
    },
    {
      status: 'entregue',
      title: 'Entregues',
      subtitle: 'Retirados pelo cliente',
      icon: <CheckCheck className="w-4 h-4 text-neutral-400" />,
      colorClasses: {
        headerBg: 'bg-neutral-900/40',
        titleColor: 'text-neutral-400',
        badgeBg: 'bg-neutral-800 border-neutral-700',
        badgeText: 'text-neutral-300',
        borderColor: 'border-neutral-800',
      },
    },
  ];

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-65px)] overflow-hidden">
      {/* Sub-bar / Filters */}
      <div className="px-4 lg:px-6 py-2 border-b border-neutral-800/80 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-neutral-300">
            Fluxo da Cozinha (KDS)
          </span>
          <span className="text-neutral-600">·</span>
          <span>Ordem de preparo: <strong>{sortOrder === 'oldestFirst' ? 'Mais antigos primeiro (FIFO)' : 'Mais recentes'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'oldestFirst' ? 'newestFirst' : 'oldestFirst')}
            className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'oldestFirst' ? 'FIFO (Mais antigos)' : 'Recentes'}</span>
          </button>

          {/* Toggle hide delivered */}
          <button
            onClick={() => setHideDelivered(!hideDelivered)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
              hideDelivered
                ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            {hideDelivered ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideDelivered ? 'Exibir Entregues' : 'Ocultar Entregues'}</span>
          </button>
        </div>
      </div>

      {/* 4-Column Board Canvas */}
      <div className="flex-1 p-3 lg:p-4 overflow-x-auto overflow-y-hidden">
        <div
          className={`grid gap-4 h-full min-w-[1020px] ${
            hideDelivered ? 'grid-cols-3' : 'grid-cols-4'
          }`}
        >
          {columns
            .filter((col) => !(hideDelivered && col.status === 'entregue'))
            .map((col) => {
              const colOrders = filteredOrders
                .filter((o) => o.status === col.status)
                .sort(sortFn);

              return (
                <div
                  key={col.status}
                  className="flex flex-col h-full bg-neutral-950/60 rounded-xl border border-neutral-800/80 overflow-hidden"
                >
                  {/* Column Header */}
                  <div
                    className={`p-3 border-b ${col.colorClasses.borderColor} ${col.colorClasses.headerBg} flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2">
                      {col.icon}
                      <div>
                        <h2 className={`font-bold text-sm tracking-tight ${col.colorClasses.titleColor}`}>
                          {col.title}
                        </h2>
                        <p className="text-[10px] text-neutral-500 leading-none">
                          {col.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${col.colorClasses.badgeBg} ${col.colorClasses.badgeText} tabular-nums`}
                    >
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Orders Scrollable Container */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {colOrders.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center mb-2 text-neutral-600">
                          {col.icon}
                        </div>
                        <p className="text-xs font-medium text-neutral-400">
                          Nenhum pedido {col.title.toLowerCase()}
                        </p>
                        <p className="text-[11px] text-neutral-600 mt-0.5">
                          {col.status === 'recebido'
                            ? 'Aguardando novo pedido do autoatendimento'
                            : 'Mova pedidos para esta etapa'}
                        </p>
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onUpdateStatus={onUpdateStatus}
                          onToggleItem={onToggleItem}
                          onViewDetails={onViewDetails}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
