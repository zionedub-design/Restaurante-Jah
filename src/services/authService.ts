import { getSupabaseClient } from './supabaseClient';

export interface UserSession {
  username: string;
  nome: string;
  cargo: string;
  token?: string;
  authenticatedAt: string;
}

const AUTH_STORAGE_KEY = 'cozinha_jah_session';

// Contas padrão de acesso da equipe do restaurante
const DEFAULT_ACCOUNTS = [
  {
    username: 'cozinha@jah.com',
    aliases: ['cozinha', 'operador', 'chefe'],
    password: 'cozinha123',
    nome: 'Equipe de Cozinha',
    cargo: 'Operador KDS',
  },
  {
    username: 'gerente@jah.com',
    aliases: ['gerente', 'admin'],
    password: 'admin123',
    nome: 'Gerência Jah',
    cargo: 'Gerente Operacional',
  },
];

export async function authenticateUser(
  identifier: string,
  secret: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = secret.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Por favor, informe o usuário e a senha.' };
  }

  // 1. Tentar autenticação direta no cliente de banco de dados se configurado
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: cleanPass,
      });

      if (!error && data?.user) {
        const session: UserSession = {
          username: data.user.email || cleanId,
          nome: data.user.user_metadata?.full_name || 'Operador Conectado',
          cargo: 'Operador de Cozinha',
          token: data.session?.access_token,
          authenticatedAt: new Date().toISOString(),
        };
        saveSession(session);
        return { success: true, user: session };
      }
    } catch {
      // Continua para validação das credenciais da equipe local
    }
  }

  // 2. Validação das contas da equipe do restaurante Cozinha Jah
  const account = DEFAULT_ACCOUNTS.find(
    (acc) =>
      (acc.username === cleanId || acc.aliases.includes(cleanId)) &&
      acc.password === cleanPass
  );

  if (account) {
    const session: UserSession = {
      username: account.username,
      nome: account.nome,
      cargo: account.cargo,
      authenticatedAt: new Date().toISOString(),
    };
    saveSession(session);
    return { success: true, user: session };
  }

  return {
    success: false,
    error: 'Usuário ou senha incorretos. Verifique suas credenciais de acesso.',
  };
}

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}
