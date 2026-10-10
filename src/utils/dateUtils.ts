export function formatTimeOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dayMonth} às ${time}`;
  } catch {
    return '--/--/----';
  }
}

export function getElapsedMinutes(isoString: string): number {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  } catch {
    return 0;
  }
}

export function formatElapsedTime(isoString: string): string {
  try {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  } catch {
    return '00:00';
  }
}

export type UrgencyLevel = 'normal' | 'alerta' | 'urgente';

export function getUrgencyLevel(isoString: string): UrgencyLevel {
  const mins = getElapsedMinutes(isoString);
  if (mins >= 15) return 'urgente';
  if (mins >= 10) return 'alerta';
  return 'normal';
}
