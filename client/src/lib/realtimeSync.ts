import type { Item } from "../types";

type UpdateCallback = (items: Item[]) => void;

export class SharedSessionSync {
  private sessionId: string;
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private pollInterval: NodeJS.Timeout | null = null;
  private lastItems: Item[] = [];
  private isPolling = false;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log("[SharedSessionSync] Starting polling for session:", this.sessionId);
      this.startPolling();
      resolve();
    });
  }

  private startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log("[SharedSessionSync] Polling started");

    // 初回ポーリング
    this.poll();

    // 2秒ごとにポーリング
    this.pollInterval = setInterval(() => {
      this.poll();
    }, 2000);
  }

  private async poll() {
    try {
      const response = await fetch(`/api/trpc/shared.getSession?input=${encodeURIComponent(JSON.stringify({ sessionId: this.sessionId }))}`);
      const data = await response.json();
      
      if (data.result?.data?.items) {
        const newItems = data.result.data.items;
        // アイテムが変更されたか確認
        const itemsChanged = this.hasItemsChanged(newItems);
        if (itemsChanged) {
          console.log("[SharedSessionSync] Items changed, notifying listeners");
          this.lastItems = JSON.parse(JSON.stringify(newItems));
          this.updateCallbacks.forEach(cb => cb(newItems));
        }
      }
    } catch (error) {
      console.error("[SharedSessionSync] Polling error:", error);
    }
  }

  private hasItemsChanged(newItems: Item[]): boolean {
    if (newItems.length !== this.lastItems.length) {
      return true;
    }

    for (let i = 0; i < newItems.length; i++) {
      if (JSON.stringify(newItems[i]) !== JSON.stringify(this.lastItems[i])) {
        return true;
      }
    }

    return false;
  }

  broadcastUpdate(items: Item[]): void {
    console.log("[SharedSessionSync] Broadcasting update:", items.length, "items");
    this.lastItems = JSON.parse(JSON.stringify(items));
    
    // サーバーに更新を送信
    fetch("/api/trpc/shared.updateSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: {
          sessionId: this.sessionId,
          items,
        },
      }),
    }).catch(error => console.error("[SharedSessionSync] Failed to broadcast:", error));
  }

  onUpdate(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  disconnect(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
    console.log("[SharedSessionSync] Polling stopped");
  }

  isConnected(): boolean {
    return this.isPolling;
  }
}
