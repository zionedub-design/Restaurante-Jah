/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Order, OrderStatus } from './types/order';
import { 
  loadLocalOrders, 
  saveLocalOrders, 
  generateSampleKioskOrder 
} from './services/orderStorage';
import { 
  getSupabaseClient, 
  testSupabaseConnection, 
  fetchOrdersFromSupabase, 
  upsertOrderToSupabase, 
  updateOrderStatusInSupabase, 
  subscribeToSupabaseOrders 
} from './services/supabaseClient';
import { soundManager } from './services/soundEffects';
import { getStoredSession, clearSession, UserSession } from './services/authService';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { KioskSimulatorModal } from './components/KioskSimulatorModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredSession());
  const [orders, setOrders] = useState<Order[]>(() => loadLocalOrders());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modals
  const [isKioskModalOpen, setIsKioskModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  // Supabase status
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  // Check Supabase connection on mount
  useEffect(() => {
    let mounted = true;
    async function checkConn() {
      const client = getSupabaseClient();
      if (!client) {
        setIsSupabaseConnected(false);
        return;
      }
      try {
        const res = await testSupabaseConnection();
        if (mounted) {
          setIsSupabaseConnected(res.success);
        }
      } catch {
        if (mounted) setIsSupabaseConnected(false);
      }
    }
    checkConn();
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to real-time changes if Supabase is active
  useEffect(() => {
    const unsub = subscribeToSupabaseOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        const newRow = payload.new;
        const newOrder: Order = {
          id: String(newRow.id),
          numero: Number(newRow.numero),
          cliente_nome: String(newRow.cliente_nome),
          produtos: Array.isArray(newRow.produtos) ? newRow.produtos : [],
          status: newRow.status as OrderStatus,
          origem: newRow.origem || 'autoatendimento',
          mesa_ou_comanda: newRow.mesa_ou_comanda || undefined,
          total: newRow.total ? Number(newRow.total) : undefined,
          observacao_geral: newRow.observacao_geral || undefined,
          criado_em: newRow.criado_em,
          atualizado_em: newRow.atualizado_em,
          tempo_estimado_min: newRow.tempo_estimado_min,
        };

        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          soundManager.playNewOrderChime();
          const updated = [newOrder, ...prev];
          saveLocalOrders(updated);
          return updated;
        });
      } else if (payload.eventType === 'UPDATE') {
        const updatedRow = payload.new;
        setOrders((prev) => {
          const updated = prev.map((o) =>
            o.id === updatedRow.id
              ? {
                  ...o,
                  status: updatedRow.status,
                  produtos: Array.isArray(updatedRow.produtos) ? updatedRow.produtos : o.produtos,
                  atualizado_em: updatedRow.atualizado_em,
                }
              : o
          );
          saveLocalOrders(updated);
          return updated;
        });
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Next order number calculation
  const nextOrderNumber = useMemo(() => {
    if (orders.length === 0) return 101;
    const maxNum = Math.max(...orders.map((o) => o.numero || 100));
    return maxNum + 1;
  }, [orders]);

  // Handle new incoming order from self-service
  const handleAddNewOrder = async (newOrder: Order) => {
    soundManager.playNewOrderChime();
    
    // Immediate optimistic local update
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveLocalOrders(updated);
    showToast(`Novo pedido #${newOrder.numero} recebido do Autoatendimento!`);

    // Sync to Supabase if configured
    if (getSupabaseClient()) {
      try {
        const res = await upsertOrderToSupabase(newOrder);
        if (res.success) {
          setIsSupabaseConnected(true);
        }
      } catch (err) {
        console.warn('Erro ao sincronizar novo pedido com Supabase:', err);
      }
    }
  };

  // Handle kitchen status change
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'pronto') {
      soundManager.playOrderReadySound();
    } else {
      soundManager.playStatusStepSound();
    }

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          atualizado_em: new Date().toISOString(),
        };
      }
      return o;
    });

    setOrders(updated);
    saveLocalOrders(updated);

    // Keep selected order in sync if details modal is open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        atualizado_em: new Date().toISOString(),
      });
    }

    // Sync to Supabase
    if (getSupabaseClient()) {
      try {
        await updateOrderStatusInSupabase(orderId, newStatus);
      } catch (err) {
        console.warn('Erro ao atualizar status no Supabase:', err);
      }
    }
  };

  // Handle checking off item inside order
  const handleToggleItem = async (orderId: string, itemId: string) => {
    soundManager.playStatusStepSound();

    let targetOrder: Order | null = null;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const nextItems = o.produtos.map((item) =>
          item.id === itemId ? { ...item, concluido: !item.concluido } : item
        );
        const nextOrder = { ...o, produtos: nextItems, atualizado_em: new Date().toISOString() };
        targetOrder = nextOrder;
        return nextOrder;
      }
      return o;
    });

    setOrders(updated);
    saveLocalOrders(updated);

    if (selectedOrder && selectedOrder.id === orderId && targetOrder) {
      setSelectedOrder(targetOrder);
    }

    // Sync updated items to Supabase
    if (targetOrder && getSupabaseClient()) {
      try {
        await upsertOrderToSupabase(targetOrder);
      } catch (err) {
        console.warn('Erro ao salvar item no Supabase:', err);
      }
    }
  };

  // View order details modal
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Logout handler
  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    showToast('Sessão encerrada com sucesso.');
  };

  // Cloud Database Full Sync Actions
  const handleSyncAllToSupabase = async () => {
    setIsSyncing(true);
    let successCount = 0;
    try {
      for (const order of orders) {
        const res = await upsertOrderToSupabase(order);
        if (res.success) successCount++;
      }
      setIsSupabaseConnected(true);
      showToast(`${successCount} pedidos sincronizados com sucesso na nuvem!`);
    } catch {
      showToast('Erro durante a sincronização com o banco de dados.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await fetchOrdersFromSupabase();
      if (error) {
        showToast(`Erro ao carregar do servidor: ${error}`);
      } else if (data) {
        setOrders(data);
        saveLocalOrders(data);
        setIsSupabaseConnected(true);
        showToast(`${data.length} pedidos carregados do servidor!`);
      }
    } catch {
      showToast('Falha na comunicação com o servidor de dados.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Order Counts
  const orderCounts = useMemo(() => {
    return {
      recebido: orders.filter((o) => o.status === 'recebido').length,
      em_preparacao: orders.filter((o) => o.status === 'em_preparacao').length,
      pronto: orders.filter((o) => o.status === 'pronto').length,
      entregue: orders.filter((o) => o.status === 'entregue').length,
      total: orders.length,
    };
  }, [orders]);

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold border border-amber-300 flex items-center gap-2 animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        orderCounts={orderCounts}
        onOpenKioskSimulator={() => setIsKioskModalOpen(true)}
        onOpenSupabaseSettings={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Kanban KDS Board */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <KanbanBoard
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          onToggleItem={handleToggleItem}
          onViewDetails={handleViewDetails}
          searchQuery={searchQuery}
        />
      </main>

      {/* Modals */}
      <KioskSimulatorModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        onSendOrder={handleAddNewOrder}
        nextOrderNumber={nextOrderNumber}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncAllToSupabase={handleSyncAllToSupabase}
        onPullFromSupabase={handlePullFromSupabase}
        isSyncing={isSyncing}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onToggleItem={handleToggleItem}
      />
    </div>
  );
}
