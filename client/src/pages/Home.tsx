/**
 * RINKAN 買取管理ツール
 * Design: Black (#1a1a1a) × Warm Off-White (#f0efed) × Gold Accent (#c8a96e)
 * Empty state → Excel drop → main app
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { Item } from "../types";
import { loadItems, saveItems } from "../lib/storage";
import { SharedSessionSync } from "../lib/realtimeSync";
import { trpc } from "@/lib/trpc";
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
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [items, setItems] = useState<Item[] | null>(null); // null = loading
  const [helpOpen, setHelpOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sync, setSync] = useState<SharedSessionSync | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // URLからセッションIDを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session");
    
    if (id) {
      setSessionId(id);
    }
  }, []);

  // セッションIDが変わったときの処理
  useEffect(() => {
    if (!sessionId) {
      // ローカルストレージからロード
      setItems(loadItems());
      return;
    }

    // 共有セッションからロード
    const loadSharedSession = async () => {
      try {
        const response = await fetch(`/api/trpc/shared.getSession?input=${JSON.stringify({ sessionId })}`);
        const data = await response.json();
        if (data.result?.data?.items) {
          setItems(data.result.data.items);
        }
      } catch (error) {
        console.error("Failed to load shared session:", error);
        setItems([]);
      }
    };

    loadSharedSession();

    // リアルタイム同期を開始
    const newSync = new SharedSessionSync(sessionId);
    newSync.connect().catch(error => {
      console.error("Failed to connect to sync:", error);
    });

    newSync.onUpdate((updatedItems) => {
      setItems(updatedItems);
    });

    setSync(newSync);

    return () => {
      newSync.disconnect();
    };
  }, [sessionId]);

  // アイテムが変更されたときの処理
  const handleItemsChange = (newItems: Item[]) => {
    setItems(newItems);

    if (sessionId && sync && sync.isConnected()) {
      // 共有セッションを更新
      sync.broadcastUpdate(newItems);
      
      // サーバーにも送信
      fetch("/api/trpc/shared.updateSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { sessionId, items: newItems },
        }),
      }).catch(error => console.error("Failed to update session:", error));
    } else {
      // ローカルストレージに保存
      saveItems(newItems);
    }
  };

  // 共有URLを生成
  const generateShareUrl = () => {
    if (!items) return;

    // サーバーに新しいセッションを作成
    fetch("/api/trpc/shared.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { items },
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.result?.data?.sessionId) {
          const newSessionId = data.result.data.sessionId;
          const url = `${window.location.origin}?session=${newSessionId}`;
          setShareUrl(url);
          setSessionId(newSessionId);
          setLocation(`?session=${newSessionId}`);
        }
      })
      .catch(error => console.error("Failed to create session:", error));
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
            {sessionId && <span className="ml-2 text-[#888]">(共有中)</span>}
          </span>
          {!sessionId && (
            <button
              onClick={generateShareUrl}
              className="text-[10px] text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded px-2 py-1 tracking-widest transition-colors"
              title="このデータを他の人と共有するURLを生成"
            >
              共有
            </button>
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

      {/* Share URL Modal */}
      {shareUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">共有URL</h3>
            <p className="text-sm text-gray-600 mb-4">
              このURLを他の人に送ると、リアルタイムでデータが共有されます：
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4 break-all text-xs font-mono">
              {shareUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("URLをコピーしました");
                }}
                className="flex-1 bg-[#1a1a1a] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#333] transition-colors"
              >
                URLをコピー
              </button>
              <button
                onClick={() => setShareUrl(null)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

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
