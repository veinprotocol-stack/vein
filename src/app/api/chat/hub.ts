// Simple global hub for dev only (process dies = history gone).
type Listener = (payload: any) => void;

class Hub {
  private listeners = new Set<Listener>();
  add(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l); }
  emit(payload: any) { for (const l of this.listeners) try { l(payload); } catch {} }
}
export const hub = new Hub();
