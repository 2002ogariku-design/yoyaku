import type { Item } from "../types";

type UpdateCallback = (items: Item[]) => void;

export class SharedSessionSync {
  private sessionId: string;
  private ws: WebSocket | null = null;
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("[SharedSessionSync] Connected");
          this.reconnectAttempts = 0;
          
          // セッションIDを登録
          this.ws!.send(JSON.stringify({
            type: "register",
            sessionId: this.sessionId,
          }));
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === "update") {
              console.log("[SharedSessionSync] Received update:", message.data);
              this.updateCallbacks.forEach(cb => cb(message.data));
            }
          } catch (error) {
            console.error("[SharedSessionSync] Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[SharedSessionSync] WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("[SharedSessionSync] Disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[SharedSessionSync] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error("[SharedSessionSync] Reconnection failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("[SharedSessionSync] Max reconnection attempts reached");
      // フォールバック：ポーリングを開始
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.pollInterval) return;
    
    console.log("[SharedSessionSync] Starting polling fallback");
    this.pollInterval = setInterval(() => {
      // ここでサーバーからデータをポーリング
      // 実装は後で
    }, 5000);
  }

  broadcastUpdate(items: Item[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "update",
        sessionId: this.sessionId,
        data: items,
      }));
    }
  }

  onUpdate(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
