import type { Item } from "../types";

export class GitHubSync {
  private userId: string;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastItems: Item[] = [];
  private isPolling = false;
  private updateCallbacks: Set<(items: Item[]) => void> = new Set();

  constructor(userId: string) {
    this.userId = userId;
  }

  async loadFromGitHub(): Promise<Item[]> {
    try {
      const response = await fetch("/api/trpc/githubSync.load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: {} }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.result?.data?.items) {
        this.lastItems = data.result.data.items;
        console.log("[GitHubSync] Loaded", this.lastItems.length, "items from GitHub");
        return this.lastItems;
      }
      return [];
    } catch (error) {
      console.error("[GitHubSync] Failed to load from GitHub:", error);
      return [];
    }
  }

  async saveToGitHub(items: Item[]): Promise<boolean> {
    try {
      const response = await fetch("/api/trpc/githubSync.save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { items },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.result?.data?.success) {
        this.lastItems = JSON.parse(JSON.stringify(items));
        console.log("[GitHubSync] Saved", items.length, "items to GitHub");
        return true;
      }
      return false;
    } catch (error) {
      console.error("[GitHubSync] Failed to save to GitHub:", error);
      return false;
    }
  }

  async deleteFromGitHub(): Promise<boolean> {
    try {
      const response = await fetch("/api/trpc/githubSync.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: {} }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.result?.data?.success) {
        this.lastItems = [];
        console.log("[GitHubSync] Deleted items from GitHub");
        return true;
      }
      return false;
    } catch (error) {
      console.error("[GitHubSync] Failed to delete from GitHub:", error);
      return false;
    }
  }

  startPolling(): void {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log("[GitHubSync] Polling started");

    // 定期的にGitHubからデータをチェック（10秒ごと）
    this.pollInterval = setInterval(async () => {
      try {
        const items = await this.loadFromGitHub();
        if (this.hasItemsChanged(items)) {
          console.log("[GitHubSync] Items changed, notifying listeners");
          this.updateCallbacks.forEach(cb => cb(items));
        }
      } catch (error) {
        console.error("[GitHubSync] Polling error:", error);
      }
    }, 10000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
    console.log("[GitHubSync] Polling stopped");
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

  onUpdate(callback: (items: Item[]) => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  isPollingActive(): boolean {
    return this.isPolling;
  }
}
