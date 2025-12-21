
export class EventBus {
  private listeners: Record<string, Function[]> = {};

  subscribe(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  broadcast(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch(e) { console.error("Listener error:", e); }
      });
    }
  }
}
