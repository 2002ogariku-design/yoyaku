/**
 * RINKAN 買取管理ツール
 * Design: Black (#1a1a1a) × Warm Off-White (#f0efed) × Gold Accent (#c8a96e)
 * Font: system-ui / -apple-system (no external fonts)
 * Layout: sticky header + sticky tab bar + scrollable content
 */
import { useState, useEffect } from "react";
import type { Item } from "../types";
import { loadItems } from "../lib/storage";
import InventoryTab from "../components/InventoryTab";
import AnalyticsTab from "../components/AnalyticsTab";
import StoryTab from "../components/StoryTab";
import ImportTab from "../components/ImportTab";

type Tab = "inventory" | "analytics" | "story" | "import";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "inventory", label: "在庫一覧", icon: "📊" },
  { id: "analytics", label: "分析", icon: "📈" },
  { id: "story", label: "ストーリー", icon: "📸" },
  { id: "import", label: "データ追加", icon: "📂" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems(loadItems());
  }, []);

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
        <div className="text-[10px] text-[#c8a96e] font-bold tracking-widest">
          {items.length > 0 && `${items.length}件`}
        </div>
      </header>

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
          <ImportTab items={items} onItemsChange={setItems} />
        )}
      </main>
    </div>
  );
}
