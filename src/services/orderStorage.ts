import { Order, OrderStatus } from '../types/order';

const LOCAL_STORAGE_ORDERS_KEY = 'kds_pedidos_locais';

// Initial mock orders representing actual autoatendimento kiosk orders
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    numero: 101,
    cliente_nome: 'Lucas Mendes',
    origem: 'autoatendimento',
    mesa_ou_comanda: 'Totem 01',
    status: 'recebido',
    criado_em: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 min atrás
    atualizado_em: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    tempo_estimado_min: 15,
    observacao_geral: 'Cliente alérgico a nozes',
    total: 58.90,
    produtos: [
      {
        id: 'item-101-1',
        nome: 'Burger Cheddar Bacon Duplo',
        quantidade: 1,
        observacoes: 'Sem cebola caramelizada, ponto da carne ao ponto',
        concluido: false,
      },
      {
        id: 'item-101-2',
        nome: 'Batata Rústica com Páprica (G)',
        quantidade: 1,
        observacoes: 'Molho barbecue à parte',
        concluido: false,
      },
      {
        id: 'item-101-3',
        nome: 'Refrigerante Coca-Cola 350ml',
        quantidade: 1,
        observacoes: 'Bem gelada com gelo e limão',
        concluido: false,
      },
    ],
  },
  {
    id: 'ord-102',
    numero: 102,
    cliente_nome: 'Mariana Duarte',
    origem: 'autoatendimento',
    mesa_ou_comanda: 'Totem 02',
    status: 'em_preparacao',
    criado_em: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 min atrás
    atualizado_em: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    tempo_estimado_min: 12,
    total: 74.00,
    produtos: [
      {
        id: 'item-102-1',
        nome: 'Smash Burger Clássico',
        quantidade: 2,
        observacoes: '1x sem picles / 1x com queijo extra',
        concluido: true,
      },
      {
        id: 'item-102-2',
        nome: 'Onion Rings Crocantes (M)',
        quantidade: 1,
        observacoes: 'Maionese verde da casa',
        concluido: false,
      },
      {
        id: 'item-102-3',
        nome: 'Suco Natural Laranja 500ml',
        quantidade: 2,
        observacoes: 'Sem açúcar e sem gelo',
        concluido: false,
      },
    ],
  },
  {
    id: 'ord-103',
    numero: 103,
    cliente_nome: 'Gabriel Pires',
    origem: 'autoatendimento',
    mesa_ou_comanda: 'Totem 01',
    status: 'pronto',
    criado_em: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 min atrás
    atualizado_em: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    tempo_estimado_min: 15,
    observacao_geral: 'Embalar para viagem',
    total: 42.50,
    produtos: [
      {
        id: 'item-103-1',
        nome: 'Wrap Frango Crispy & Parmesão',
        quantidade: 1,
        observacoes: 'Molho caesar extra',
        concluido: true,
      },
      {
        id: 'item-103-2',
        nome: 'Água com Gás 500ml',
        quantidade: 1,
        concluido: true,
      },
      {
        id: 'item-103-3',
        nome: 'Mini Brownie com Nutella',
        quantidade: 1,
        concluido: true,
      },
    ],
  },
  {
    id: 'ord-104',
    numero: 104,
    cliente_nome: 'Fernanda e Tiago',
    origem: 'autoatendimento',
    mesa_ou_comanda: 'Totem 03',
    status: 'entregue',
    criado_em: new Date(Date.now() - 32 * 60 * 1000).toISOString(), // 32 min atrás
    atualizado_em: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    tempo_estimado_min: 20,
    total: 96.00,
    produtos: [
      {
        id: 'item-104-1',
        nome: 'Pizza Artesanal Marguerita Especial',
        quantidade: 1,
        observacoes: 'Massa fina crocante, manjericão fresco',
        concluido: true,
      },
      {
        id: 'item-104-2',
        nome: 'Chá Gelado Pêssego 500ml',
        quantidade: 2,
        concluido: true,
      },
    ],
  },
  {
    id: 'ord-105',
    numero: 105,
    cliente_nome: 'Rodrigo Vasconcelos',
    origem: 'autoatendimento',
    mesa_ou_comanda: 'Totem 02',
    status: 'recebido',
    criado_em: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min atrás
    atualizado_em: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    tempo_estimado_min: 14,
    observacao_geral: 'Prioridade: horário de almoço curto',
    total: 52.00,
    produtos: [
      {
        id: 'item-105-1',
        nome: 'Ribs Burger com Barbecue Defumado',
        quantidade: 1,
        observacoes: 'Carne bem passada, queijo provolone derretido',
        concluido: false,
      },
      {
        id: 'item-105-2',
        nome: 'Batata Palito Crocante Tradicional',
        quantidade: 1,
        concluido: false,
      },
      {
        id: 'item-105-3',
        nome: 'Guaraná Antarctica Zero 350ml',
        quantidade: 1,
        concluido: false,
      },
    ],
  },
];

export function loadLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial
  }

  // Initialize with samples
  saveLocalOrders(INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export function saveLocalOrders(orders: Order[]): void {
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
}

// Generate realistic autoatendimento kiosk orders
const SAMPLE_CLIENTS = [
  'Camila Rocha',
  'Felipe Antunes',
  'Larissa Souza',
  'Bruno Alcantara',
  'Juliana Martins',
  'Eduardo Nogueira',
  'Patricia Leal',
  'Renato Aragão',
  'Tatiane Costa',
  'Vinícius Ramos',
];

const SAMPLE_BURGER_PRODUCTS = [
  { nome: 'Smash Bacon Monster', obs: ['Sem cebola', 'Ponto da carne: bem passada', 'Molho da casa extra', 'Sem picles'] },
  { nome: 'Texas BBQ Burger', obs: ['Adicional de anéis de cebola', 'Ponto da carne: ao ponto', 'Bacon crocante duplo'] },
  { nome: 'Veggie Trufado de Cogumelos', obs: ['Sem maionese', 'Pão australiano tostado', 'Rúcula fresca extra'] },
  { nome: 'Double Cheese Gorgonzola', obs: ['Sem pimenta', 'Carne ao ponto para mal'] },
  { nome: 'Chicken Crispy Especial', obs: ['Molho tártaro', 'Sem alface americana'] },
];

const SAMPLE_SIDES = [
  { nome: 'Batata Rústica com Alecrim (G)', obs: ['Pouco sal', 'Molho maionese verde'] },
  { nome: 'Nuggets Artesanais de Frango (8 un)', obs: ['Molho barbecue e mostarda com mel'] },
  { nome: 'Dadinhos de Tapioca com Geléia de Pimenta', obs: ['Geléia à parte'] },
  { nome: 'Batata Crinkle com Cheddar & Bacon', obs: ['Cheddar bem quente'] },
];

const SAMPLE_DRINKS = [
  { nome: 'Refrigerante Coca-Cola 350ml', obs: ['Com gelo e fatia de limão', 'Sem gelo'] },
  { nome: 'Suco de Abacaxi com Hortelã 400ml', obs: ['Sem açúcar', 'Gelo normal'] },
  { nome: 'Guaraná Antarctica 350ml', obs: ['Bem gelado'] },
  { nome: 'Água Mineral sem Gás 500ml', obs: ['Temperatura ambiente'] },
  { nome: 'Cerveja Artesanal IPA 500ml', obs: ['Copo com gelo'] },
];

export function generateSampleKioskOrder(nextNumber: number): Order {
  const client = SAMPLE_CLIENTS[Math.floor(Math.random() * SAMPLE_CLIENTS.length)];
  const totemNum = Math.floor(Math.random() * 3) + 1;
  
  const burger = SAMPLE_BURGER_PRODUCTS[Math.floor(Math.random() * SAMPLE_BURGER_PRODUCTS.length)];
  const side = SAMPLE_SIDES[Math.floor(Math.random() * SAMPLE_SIDES.length)];
  const drink = SAMPLE_DRINKS[Math.floor(Math.random() * SAMPLE_DRINKS.length)];

  const produtos = [
    {
      id: `item-${nextNumber}-1`,
      nome: burger.nome,
      quantidade: 1,
      observacoes: burger.obs[Math.floor(Math.random() * burger.obs.length)],
      concluido: false,
    },
    {
      id: `item-${nextNumber}-2`,
      nome: side.nome,
      quantidade: 1,
      observacoes: side.obs[Math.floor(Math.random() * side.obs.length)],
      concluido: false,
    },
    {
      id: `item-${nextNumber}-3`,
      nome: drink.nome,
      quantidade: 1,
      observacoes: drink.obs[Math.floor(Math.random() * drink.obs.length)],
      concluido: false,
    },
  ];

  const now = new Date().toISOString();
  return {
    id: `ord-${Date.now()}-${nextNumber}`,
    numero: nextNumber,
    cliente_nome: client,
    origem: 'autoatendimento',
    mesa_ou_comanda: `Totem 0${totemNum}`,
    status: 'recebido',
    criado_em: now,
    atualizado_em: now,
    tempo_estimado_min: 15,
    total: Math.floor(Math.random() * 40) + 45 + 0.9,
    produtos,
  };
}
