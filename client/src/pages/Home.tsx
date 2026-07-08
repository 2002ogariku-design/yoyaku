/**
 * RINKAN 買取管理ツール
 * Design: Black (#1a1a1a) × Warm Off-White (#f0efed) × Gold Accent (#c8a96e)
 * Empty state → Excel drop → main app
 */
import { useState, useEffect } from "react";
import type { Item } from "../types";
import { loadItems, saveItems } from "../lib/storage";
import { GitHubSync } from "../lib/githubSync";
import { useAuth } from "@/_core/hooks/useAuth";
import EmptyState from "../components/EmptyState";
import InventoryTab from "../components/InventoryTab";
import AnalyticsTab from "../components/AnalyticsTab";
import StoryTab from "../components/StoryTab";
import ImportTab from "../components/ImportTab";
import HelpModal from "../components/HelpModal";

type Tab = "inventory" | "analytics" | "story" | "import";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "inventory", label: "在庫一覧", icon: "📊" },
  { id: "analytics", label: "分析", icon: "📈" },
  { id: "story", label: "ストーリー", icon: "📸" },
  { id: "import", label: "データ追加", icon: "📂" },
];

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [items, setItems] = useState<Item[] | null>(null); // null = loading
  const [helpOpen, setHelpOpen] = useState(false);
  const [githubSync, setGithubSync] = useState<GitHubSync | null>(null);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "error">("syncing");

  // ユーザーがログインしたときにGitHub同期を初期化
  useEffect(() => {
    if (!user) {
      // ローカルストレージからロード
      setItems(loadItems());
      return;
    }

    const initializeGitHubSync = async () => {
      try {
        console.log("[Home] Initializing GitHub sync for user:", user.id);
        const sync = new GitHubSync(String(user.id));

        // GitHubからデータをロード
        const loadedItems = await sync.loadFromGitHub();
        setItems(loadedItems.length > 0 ? loadedItems : loadItems());
        setSyncStatus("synced");

        // リアルタイム同期を開始
        sync.onUpdate((updatedItems) => {
          console.log("[Home] GitHub sync update received:", updatedItems.length, "items");
          setItems(updatedItems);
        });

        sync.startPolling();
        setGithubSync(sync);
      } catch (error) {
        console.error("[Home] Failed to initialize GitHub sync:", error);
        setSyncStatus("error");
        setItems(loadItems());
      }
    };

    initializeGitHubSync();

    return () => {
      if (githubSync) {
        githubSync.stopPolling();
      }
    };
  }, [user]);

  // アイテムが変更されたときの処理
  const handleItemsChange = (newItems: Item[]) => {
    setItems(newItems);

    if (user && githubSync) {
      // GitHubに保存
      setSyncStatus("syncing");
      githubSync.saveToGitHub(newItems).then((success) => {
        setSyncStatus(success ? "synced" : "error");
      });
    } else {
      // ローカルストレージに保存
      saveItems(newItems);
    }
  };

  // Still loading from localStorage
  if (items === null) return null;

  // No data yet → show welcome/drop screen
  if (items.length === 0) {
    return <EmptyState onItemsLoaded={(newItems) => handleItemsChange(newItems)} />;
  }

  return (
    <div className="min-h-screen bg-[#f0efed]">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <div className="text-base font-black tracking-[0.2em]">
            RINKAN SHIBUYA
          </div>
          <div className="text-[10px] text-[#888] tracking-[0.1em] mt-0.5">
            買取管理 &amp; ストーリー作成ツール
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#c8a96e] font-bold tracking-widest">
            {items.length.toLocaleString()}点
          </span>
          {user && (
            <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded ${
              syncStatus === "synced" ? "text-green-600 bg-green-100" :
              syncStatus === "syncing" ? "text-yellow-600 bg-yellow-100" :
              "text-red-600 bg-red-100"
            }`}>
              {syncStatus === "synced" ? "✓ 同期済み" :
               syncStatus === "syncing" ? "⟳ 同期中" :
               "✕ エラー"}
            </span>
          )}
          <button
            onClick={() => setHelpOpen(true)}
            className="text-[10px] text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded px-2 py-1 tracking-widest transition-colors"
          >
            使い方
          </button>
        </div>
      </header>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Tab bar */}
      <nav className="flex bg-white border-b border-[#e0e0e0] sticky top-[57px] z-40">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-center text-[11px] font-bold tracking-[0.1em] border-b-2 transition-all ${
              activeTab === tab.id
                ? "text-[#1a1a1a] border-[#1a1a1a]"
                : "text-[#888] border-transparent hover:text-[#555]"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main>
        {activeTab === "inventory" && <InventoryTab items={items} />}
        {activeTab === "analytics" && <AnalyticsTab items={items} />}
        {activeTab === "story" && <StoryTab />}
        {activeTab === "import" && (
          <ImportTab items={items} onItemsChange={(newItems) => handleItemsChange(newItems)} />
        )}
      </main>
    </div>
  );
}
