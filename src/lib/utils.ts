export const fmtMoney = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const fmtDate = (iso: string) => new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
export const cap = (s: string) => (s || '').replace(/_/g, ' ').replace(/^\w/u, c => c.toUpperCase());
