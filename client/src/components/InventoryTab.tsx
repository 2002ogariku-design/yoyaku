/**
 * Design: RINKAN Black × Gold minimal brand tone
 * - bg: #f0efed, header: #1a1a1a, accent: #c8a96e
 * - Integrated story creator modal per item row
 * - Google search link, shop column added
 */
import { useState, useMemo, useRef } from "react";
import type { Item } from "../types";
import { toBrandEnglish } from "../lib/brandMap";

interface Props {
  items: Item[];
}

const ITEMS_PER_PAGE = 20;

const rankColor: Record<string, string> = {
  S: "bg-yellow-500",
  A: "bg-[#1a1a1a]",
  B: "bg-[#555]",
  C: "bg-[#888]",
  D: "bg-[#bbb] !text-[#555]",
};

// ─── Story Modal ─────────────────────────────────────────────────────────────
interface StoryModalProps {
  item: Item;
  onClose: () => void;
}

function StoryModal({ item, onClose }: StoryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brand, setBrand] = useState(item.brand || "");
  const [size, setSize] = useState(item.size || "");
  const [price, setPrice] = useState(item.price ? String(item.price) : "");
  const [code, setCode] = useState(item.model || "");
  const [generated, setGenerated] = useState(false);
  const [saveHref, setSaveHref] = useState("");
  const [saveFilename, setSaveFilename] = useState("rinkan_story.png");

  function generateStory() {
    if (!brand.trim() || !size.trim() || !price.trim()) {
      alert("ブランド名・サイズ・販売価格を入力してください");
      return;
    }
    const base = parseInt(price.replace(/[^0-9]/g, ""));
    if (isNaN(base)) {
      alert("価格は数字で入力してください");
      return;
    }

    const brandUpper = toBrandEnglish(brand.trim());
    // priceは既に税込売価なのでそのまま表示（×1.1しない）
    const ps = "¥" + base.toLocaleString("ja-JP");
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const W = 1080, H = 1920;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    const PE = 1750;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, PE, W, H - PE);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = "800 38px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("RINKAN", W / 2, PE + 58);
    ctx.fillStyle = "#888";
    ctx.font = "400 22px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("SHIBUYA", W / 2, PE + 100);

    const TS = 120, TE = 740, PH = 116, BH = 72, SH = 31,
      CH = code.trim() ? 25 : 0, LH = 29, PRH = 91;
    const g1 = 48, g2 = 28, g3 = 20, g4 = 50, g5 = 30, g6 = 24;
    const bH = PH + g1 + BH + g2 + SH + (code.trim() ? g3 + CH : 0) + g4 + 1 + g5 + LH + g6 + PRH;
    let cy = TS + Math.floor((TE - TS - bH) / 2);

    ctx.font = "900 64px -apple-system,'Helvetica Neue',Arial,sans-serif";
    const bw = ctx.measureText("買取速報").width;
    const px2 = 60, pw2 = bw + px2 * 2, ph = PH, pX = (W - pw2) / 2, pr2 = ph / 2;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.moveTo(pX + pr2, cy);
    ctx.lineTo(pX + pw2 - pr2, cy);
    ctx.arcTo(pX + pw2, cy, pX + pw2, cy + pr2, pr2);
    ctx.lineTo(pX + pw2, cy + ph - pr2);
    ctx.arcTo(pX + pw2, cy + ph, pX + pw2 - pr2, cy + ph, pr2);
    ctx.lineTo(pX + pr2, cy + ph);
    ctx.arcTo(pX, cy + ph, pX, cy + ph - pr2, pr2);
    ctx.lineTo(pX, cy + pr2);
    ctx.arcTo(pX, cy, pX + pr2, cy, pr2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("買取速報", W / 2, cy + ph / 2);
    cy += ph + g1;

    ctx.textBaseline = "top";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "800 76px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText(brandUpper, W / 2, cy);
    cy += BH + g2;

    ctx.fillStyle = "#888";
    ctx.font = "400 28px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("SIZE  " + size.trim(), W / 2, cy);
    cy += SH;

    if (code.trim()) {
      cy += g3;
      ctx.fillStyle = "#bbb";
      ctx.font = "400 23px -apple-system,'Helvetica Neue',Arial,sans-serif";
      ctx.fillText(code.trim(), W / 2, cy);
      cy += CH;
    }

    cy += g4;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 90, cy);
    ctx.lineTo(W / 2 + 90, cy);
    ctx.stroke();
    cy += 1 + g5;

    ctx.fillStyle = "#888";
    ctx.font = "400 26px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("販売価格", W / 2, cy);
    cy += LH + g6;

    // 価格の右下に小さく「税込」を横並び表示
    ctx.textBaseline = "top";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "700 96px -apple-system,'Helvetica Neue',Arial,sans-serif";
    const priceW = ctx.measureText(ps).width;
    ctx.font = "400 30px -apple-system,'Helvetica Neue',Arial,sans-serif";
    const taxW = ctx.measureText("税込").width;
    const totalW = priceW + 10 + taxW;
    const startX = (W - totalW) / 2;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "700 96px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(ps, startX, cy);
    ctx.fillStyle = "#888";
    ctx.font = "400 30px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("税込", startX + priceW + 10, cy + PRH - 34);

    const dataUrl = cv.toDataURL("image/png");
    setSaveHref(dataUrl);
    setSaveFilename("rinkan_" + brandUpper.replace(/\s+/g, "_") + ".png");
    setGenerated(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] text-white px-5 py-4 rounded-t-2xl sm:rounded-t-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-[#c8a96e] uppercase font-bold">Story Creator</div>
            <div className="text-sm font-bold truncate max-w-[240px]">{item.brand}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Pre-filled info badge */}
          <div className="bg-[#f5f5f5] rounded-xl p-3 mb-4 text-[11px] text-[#888] flex flex-wrap gap-2">
            {item.item && <span className="bg-white rounded px-2 py-0.5 border border-[#e0e0e0] text-[#1a1a1a]">{item.item}</span>}
            {item.rank && <span className="bg-[#1a1a1a] text-white rounded px-2 py-0.5">ランク {item.rank}</span>}
            {item.shop && <span className="bg-white rounded px-2 py-0.5 border border-[#e0e0e0]">{item.shop}</span>}
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">ブランド名</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例：BALENCIAGA"
              autoCapitalize="characters"
              className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-3 text-base bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white placeholder:text-[#bbb]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">サイズ</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="例：XS"
                className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-3 text-base bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white placeholder:text-[#bbb]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">販売価格（税込）</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="168000"
                inputMode="numeric"
                className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-3 text-base bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white placeholder:text-[#bbb]"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">
              商品コード <span className="font-normal normal-case tracking-normal text-[#bbb]">（任意）</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例：809360 TRW77"
              className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-3 text-base bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white placeholder:text-[#bbb]"
            />
          </div>

          <button
            onClick={generateStory}
            className="w-full bg-[#1a1a1a] text-white rounded-xl py-4 text-sm font-bold tracking-widest mb-4 hover:bg-[#333] transition-colors active:scale-[0.98]"
          >
            ストーリー画像を作成 →
          </button>

          {generated && (
            <div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <canvas ref={canvasRef} width={1080} height={1920} className="w-full h-auto block" />
              </div>
              <a
                href={saveHref}
                download={saveFilename}
                className="block w-full bg-white border-2 border-[#1a1a1a] rounded-xl py-3.5 text-sm font-bold text-[#1a1a1a] text-center mt-2.5 hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                画像を保存する ↓
              </a>
            </div>
          )}

          {!generated && (
            <canvas ref={canvasRef} width={1080} height={1920} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InventoryTab({ items }: Props) {
  const [query, setQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [filterShop, setFilterShop] = useState("");
  const [filterBuyer, setFilterBuyer] = useState("");
  const [page, setPage] = useState(1);
  const [storyItem, setStoryItem] = useState<Item | null>(null);

  const brands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand).filter(Boolean))).sort(),
    [items]
  );
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.item).filter(Boolean))).sort(),
    [items]
  );
  const shops = useMemo(
    () => Array.from(new Set(items.map((i) => i.shop).filter(Boolean))).sort(),
  [items]
  );
  const buyers = useMemo(
    () => Array.from(new Set(items.map((i) => i.buyer).filter(Boolean))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((i) => {
      if (
        q &&
        !i.brand.toLowerCase().includes(q) &&
        !i.model.toLowerCase().includes(q) &&
        !i.feature.toLowerCase().includes(q) &&
        !i.item.toLowerCase().includes(q) &&
        !i.id.toLowerCase().includes(q)
      )
        return false;
      if (filterBrand && i.brand !== filterBrand) return false;
      if (filterCategory && i.item !== filterCategory) return false;
      if (filterRank && i.rank !== filterRank) return false;
      if (filterShop && i.shop !== filterShop) return false;
      if (filterBuyer && i.buyer !== filterBuyer) return false;
      return true;
    });
  }, [items, query, filterBrand, filterCategory, filterRank, filterShop, filterBuyer]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalCost = items.reduce((s, i) => s + i.cost, 0);

  return (
    <div className="p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { num: items.length.toLocaleString(), lbl: "Total" },
          { num: new Set(items.map((i) => i.brand)).size.toLocaleString(), lbl: "Brands" },
          { num: "¥" + (totalCost / 10000).toFixed(0) + "万", lbl: "仕入額" },
        ].map((s) => (
          <div key={s.lbl} className="bg-white rounded-xl p-3.5 text-center shadow-sm">
            <div className="text-2xl font-black text-[#1a1a1a]">{s.num}</div>
            <div className="text-[9px] text-[#888] tracking-widest uppercase mt-1">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <input
          type="text"
          placeholder="ブランド・商品名・型番で検索..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="w-full border border-[#e0e0e0] rounded-lg px-3.5 py-2.5 text-sm bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white mb-3"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { value: filterBrand, set: (v: string) => { setFilterBrand(v); setPage(1); }, options: brands, placeholder: "すべてのブランド" },
            { value: filterCategory, set: (v: string) => { setFilterCategory(v); setPage(1); }, options: categories, placeholder: "すべてのアイテム" },
            { value: filterRank, set: (v: string) => { setFilterRank(v); setPage(1); }, options: ["S", "A", "B", "C", "D"], placeholder: "すべてのランク" },
            { value: filterShop, set: (v: string) => { setFilterShop(v); setPage(1); }, options: shops, placeholder: "すべての仕入店" },
            { value: filterBuyer, set: (v: string) => { setFilterBuyer(v); setPage(1); }, options: buyers, placeholder: "すべてのバイヤー" },
          ].map((f) => (
            <select
              key={f.placeholder}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="border border-[#e0e0e0] rounded-lg px-3 py-2 text-xs bg-[#f5f5f5] text-[#1a1a1a] focus:outline-none"
            >
              <option value="">{f.placeholder}</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e0e0e0]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                {["ブランド", "商品名 / 特徴", "アイテム", "サイズ", "カラー", "ランク", "売価(税込)", "仕入店舗", "バイヤー", "付属品", "検索", "ストーリー"].map((h) => (
                  <th
                    key={h}
                    className="bg-[#1a1a1a] text-white px-3 py-2.5 text-left text-[10px] tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#888] text-xs">
                    該当するアイテムがありません
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#fafaf8] transition-colors"
                  >
                    {/* Brand */}
                    <td className="px-3 py-2.5 font-semibold text-[#1a1a1a] whitespace-nowrap max-w-[160px]">
                      <div className="truncate">{item.brand}</div>
                      {item.collab && (
                        <div className="text-[#c8a96e] text-[9px] font-bold truncate">× {item.collab}</div>
                      )}
                    </td>

                    {/* Model / Feature */}
                    <td className="px-3 py-2.5 text-[#1a1a1a] max-w-[180px]">
                      <div className="font-medium truncate">{item.model}</div>
                      {item.feature && (
                        <div className="text-[#888] text-[10px] truncate">{item.feature}</div>
                      )}
                    </td>

                    {/* Item type */}
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                      {item.item || item.category || "-"}
                    </td>

                    {/* Size */}
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                      {item.size || "-"}
                    </td>

                    {/* Color */}
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap text-[10px] max-w-[120px]">
                      <div className="truncate">{item.color || "-"}</div>
                    </td>

                    {/* Rank */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black text-white ${rankColor[item.rank] || "bg-[#888]"}`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap text-[#1a1a1a]">
                      ¥{item.price.toLocaleString()}
                    </td>

                    {/* Shop */}
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap text-[10px] max-w-[120px]">
                      <div className="truncate">{item.shop || "-"}</div>
                    </td>

                    {/* Buyer */}
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap text-[10px] max-w-[100px]">
                      <div className="truncate">{item.buyer || "-"}</div>
                    </td>

                    {/* Accessories */}
                    <td className="px-3 py-2.5 whitespace-nowrap text-[10px]">
                      {item.accessories && item.accessories !== "なし" && item.accessories !== "" ? (
                        <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded px-2 py-0.5 font-medium">
                          ✓ {item.accessories}
                        </span>
                      ) : (
                        <span className="text-[#bbb]">-</span>
                      )}
                    </td>

                    {/* Google Search */}
                    <td className="px-3 py-2.5">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.brand + " " + item.model + " " + item.item)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded px-2 py-1 text-[10px] text-[#1a1a1a] hover:bg-[#4285f4] hover:text-white hover:border-[#4285f4] transition-colors whitespace-nowrap"
                      >
                        🔍 Google
                      </a>
                    </td>

                    {/* Story Button */}
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setStoryItem(item)}
                        className="inline-flex items-center gap-1 bg-[#1a1a1a] text-white rounded px-2.5 py-1.5 text-[10px] font-bold hover:bg-[#c8a96e] transition-colors whitespace-nowrap"
                      >
                        📸 作成
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 p-3 border-t border-[#e0e0e0]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-white border border-[#e0e0e0] rounded-lg px-3.5 py-2 text-xs font-bold text-[#1a1a1a] disabled:opacity-40 hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
          >
            ← 前
          </button>
          <span className="text-xs text-[#888]">
            {currentPage} / {totalPages}（{filtered.length}件）
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-white border border-[#e0e0e0] rounded-lg px-3.5 py-2 text-xs font-bold text-[#1a1a1a] disabled:opacity-40 hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
          >
            次 →
          </button>
        </div>
      </div>

      {/* Story Modal */}
      {storyItem && (
        <StoryModal item={storyItem} onClose={() => setStoryItem(null)} />
      )}
    </div>
  );
}
