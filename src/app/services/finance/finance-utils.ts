/**
 * Helpers compartilhados pelos gateways HTTP do módulo financeiro.
 */

/** Converte data da API ('yyyy-MM-dd' ou ISO) em Date local, sem deslocar o dia por fuso. */
export function parseApiDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Formata Date local como 'yyyy-MM-dd' (contrato de datas do BFF financeiro). */
export function toApiDate(value: Date | string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value.length >= 10 ? value.substring(0, 10) : value;
  }
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Mensagem de erro do BFF ({code,message}) com fallback amigável. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { error?: { message?: string } } | null | undefined;
  return e?.error?.message || fallback;
}
