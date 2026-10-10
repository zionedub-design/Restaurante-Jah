import React, { useState } from 'react';
import { X, Send, Sparkles, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Order, OrderItem } from '../types/order';

interface KioskSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOrder: (order: Order) => void;
  nextOrderNumber: number;
}

const PRESET_COMBOS = [
  {
    nome: 'Combo Smash Especial',
    cliente: 'Camila Martins',
    totem: 'Totem 01',
    obsGeral: 'Cliente prefere sem gelo na bebida',
    total: 48.90,
    produtos: [
      { nome: 'Smash Duplo Cheddar & Bacon', quantidade: 1, observacoes: 'Ponto ao ponto, maionese à parte' },
      { nome: 'Batata Rústica com Alecrim (M)', quantidade: 1, observacoes: 'Crocante com sal leve' },
      { nome: 'Refrigerante Coca-Cola Zero 350ml', quantidade: 1, observacoes: 'Sem gelo' },
    ],
  },
  {
    nome: 'Combo Texas BBQ Ribs',
    cliente: 'Bruno Henrique',
    totem: 'Totem 02',
    obsGeral: 'Mesa externa',
    total: 62.00,
    produtos: [
      { nome: 'Texas Burger com Costela Desfiada', quantidade: 1, observacoes: 'Molho barbecue extra defumado' },
      { nome: 'Anéis de Cebola Empanados', quantidade: 1, observacoes: 'Molho sour cream' },
      { nome: 'Chopp Artesanal 500ml', quantidade: 1, observacoes: 'Copo gelado' },
    ],
  },
  {
    nome: 'Opção Vegetariana Fit',
    cliente: 'Juliana Paes',
    totem: 'Totem 01',
    obsGeral: 'Alérgica a leite / lactose',
    total: 51.50,
    produtos: [
      { nome: 'Burger de Cogumelos Shimeji & Paris', quantidade: 1, observacoes: 'Sem queijo tradicional, queijo vegetal' },
      { nome: 'Salada Caesar com Croutons', quantidade: 1, observacoes: 'Molho à parte' },
      { nome: 'Suco Natural de Maracujá 400ml', quantidade: 1, observacoes: 'Adoçante à parte' },
    ],
  },
  {
    nome: 'Pizza Artesanal & Sobremesa',
    cliente: 'Marcos Vinícius',
    totem: 'Totem 03',
    obsGeral: 'Embalagem reforçada para viagem',
    total: 89.90,
    produtos: [
      { nome: 'Pizza Broto Quatro Queijos Nobres', quantidade: 1, observacoes: 'Borda recheada de catupiry' },
      { nome: 'Torta Holandesa Fatia Especial', quantidade: 1, observacoes: 'Com calda extra' },
      { nome: 'Água Tônica Citrus 350ml', quantidade: 1, observacoes: 'Gelo e limão' },
    ],
  },
];

export const KioskSimulatorModal: React.FC<KioskSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSendOrder,
  nextOrderNumber,
}) => {
  const [clientName, setClientName] = useState<string>('Carlos Andrade');
  const [totemNumber, setTotemNumber] = useState<string>('Totem 01');
  const [generalObs, setGeneralObs] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'sim-1',
      nome: 'Burger Duplo Picanha Artesanal',
      quantidade: 1,
      observacoes: 'Ponto ao ponto, queijo prato derretido',
      concluido: false,
    },
    {
      id: 'sim-2',
      nome: 'Batata Frita Tradicional Grande',
      quantidade: 1,
      observacoes: 'Com sachê de maionese verde',
      concluido: false,
    },
    {
      id: 'sim-3',
      nome: 'Refrigerante Guaraná Jesus 350ml',
      quantidade: 1,
      observacoes: 'Bem gelado',
      concluido: false,
    },
  ]);

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemObs, setNewItemObs] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_COMBOS[0]) => {
    setClientName(preset.cliente);
    setTotemNumber(preset.totem);
    setGeneralObs(preset.obsGeral || '');
    setItems(
      preset.produtos.map((p, idx) => ({
        id: `sim-${Date.now()}-${idx}`,
        nome: p.nome,
        quantidade: p.quantidade,
        observacoes: p.observacoes,
        concluido: false,
      }))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItems([
      ...items,
      {
        id: `sim-${Date.now()}`,
        nome: newItemName.trim(),
        quantidade: Number(newItemQty) || 1,
        observacoes: newItemObs.trim() || undefined,
        concluido: false,
      },
    ]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemObs('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const handleSend = () => {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord-${Date.now()}-${nextOrderNumber}`,
      numero: nextOrderNumber,
      cliente_nome: clientName.trim() || 'Cliente Totem',
      mesa_ou_comanda: totemNumber,
      origem: 'autoatendimento',
      status: 'recebido',
      criado_em: now,
      atualizado_em: now,
      tempo_estimado_min: 15,
      observacao_geral: generalObs.trim() || undefined,
      total: 55.00,
      produtos: items,
    };

    onSendOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Simulador do Totem de Autoatendimento
                <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  Pedido #{nextOrderNumber}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Gere pedidos recebidos para testar a notificação sonora, colunas e Supabase
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
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Combos Rápidos para Teste:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_COMBOS.map((combo) => (
                <button
                  key={combo.nome}
                  type="button"
                  onClick={() => handleApplyPreset(combo)}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/60 text-left transition-all group"
                >
                  <p className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 truncate">
                    {combo.nome}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">{combo.cliente}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                Origem / Terminal
              </label>
              <select
                value={totemNumber}
                onChange={(e) => setTotemNumber(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Totem 01">Totem 01 (Autoatendimento Entrada)</option>
                <option value="Totem 02">Totem 02 (Autoatendimento Balcão)</option>
                <option value="Totem 03">Totem 03 (Autoatendimento Drive/Espera)</option>
                <option value="Mesa 04">Mesa 04 (QR Code Autoatendimento)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Observação Geral / Alergias
            </label>
            <input
              type="text"
              value={generalObs}
              onChange={(e) => setGeneralObs(e.target.value)}
              placeholder="Ex: Cliente alérgico a glúten, embalar para viagem"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Items in order */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300">
                Produtos do Pedido ({items.length})
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {items.reduce((acc, i) => acc + i.quantidade, 0)} unidades no total
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/90 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {item.quantidade}x
                      </span>
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {item.nome}
                      </span>
                    </div>
                    {item.observacoes && (
                      <p className="text-[11px] text-neutral-400 italic truncate">
                        {item.observacoes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add custom item */}
            <form onSubmit={handleAddItem} className="mt-3 grid grid-cols-12 gap-2">
              <input
                type="number"
                min="1"
                max="99"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="col-span-2 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-center text-neutral-100 focus:outline-none focus:border-amber-500"
                title="Quantidade"
              />
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Novo item..."
                className="col-span-6 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={newItemObs}
                onChange={(e) => setNewItemObs(e.target.value)}
                placeholder="Obs..."
                className="col-span-3 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="col-span-1 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center justify-center border border-neutral-700 transition-colors"
                title="Adicionar item"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={items.length === 0}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Pedido para a Cozinha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
