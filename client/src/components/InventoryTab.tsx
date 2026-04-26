/**
 * Design: RINKAN Black × Gold minimal brand tone
 * - bg: #f0efed, header: #1a1a1a, accent: #c8a96e
 * - Font: system-ui / -apple-system
 * - Rank badges: A=#1a1a1a, B=#555, C=#888, D=#bbb
 */
import { useState, useMemo } from "react";
import type { Item } from "../types";

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

export default function InventoryTab({ items }: Props) {
  const [query, setQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [page, setPage] = useState(1);

  const brands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand).filter(Boolean))).sort(),
    [items]
  );
  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort(),
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
        !i.id.toLowerCase().includes(q)
      )
        return false;
      if (filterBrand && i.brand !== filterBrand) return false;
      if (filterCategory && i.category !== filterCategory) return false;
      if (filterRank && i.rank !== filterRank) return false;
      return true;
    });
  }, [items, query, filterBrand, filterCategory, filterRank]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalCost = items.reduce((s, i) => s + i.cost, 0);

  function handleFilter() {
    setPage(1);
  }

  return (
    <div className="p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { num: items.length.toLocaleString(), lbl: "Total" },
          {
            num: new Set(items.map((i) => i.brand)).size.toLocaleString(),
            lbl: "Brands",
          },
          {
            num: "¥" + (totalCost / 10000).toFixed(0) + "万",
            lbl: "仕入額",
          },
        ].map((s) => (
          <div
            key={s.lbl}
            className="bg-white rounded-xl p-3.5 text-center shadow-sm"
          >
            <div className="text-2xl font-black text-[#1a1a1a]">{s.num}</div>
            <div className="text-[9px] text-[#888] tracking-widest uppercase mt-1">
              {s.lbl}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <input
          type="text"
          placeholder="ブランド・商品名・型番で検索..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleFilter();
          }}
          className="w-full border border-[#e0e0e0] rounded-lg px-3.5 py-2.5 text-sm bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          {[
            {
              value: filterBrand,
              set: (v: string) => {
                setFilterBrand(v);
                setPage(1);
              },
              options: brands,
              placeholder: "すべてのブランド",
            },
            {
              value: filterCategory,
              set: (v: string) => {
                setFilterCategory(v);
                setPage(1);
              },
              options: categories,
              placeholder: "すべてのカテゴリ",
            },
            {
              value: filterRank,
              set: (v: string) => {
                setFilterRank(v);
                setPage(1);
              },
              options: ["S", "A", "B", "C", "D"],
              placeholder: "すべてのランク",
            },
          ].map((f) => (
            <select
              key={f.placeholder}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="flex-1 min-w-[120px] border border-[#e0e0e0] rounded-lg px-3 py-2 text-xs bg-[#f5f5f5] text-[#1a1a1a] focus:outline-none"
            >
              <option value="">{f.placeholder}</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e0e0e0]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                {[
                  "ブランド",
                  "商品名 / 特徴",
                  "カテゴリ",
                  "サイズ",
                  "ランク",
                  "売価(税抜)",
                  "買取日",
                  "検索",
                ].map((h) => (
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
                  <td
                    colSpan={8}
                    className="text-center py-10 text-[#888] text-xs"
                  >
                    該当するアイテムがありません
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#fafaf8] transition-colors"
                  >
                    <td className="px-3 py-2.5 font-semibold text-[#1a1a1a] whitespace-nowrap">
                      {item.brand}
                    </td>
                    <td className="px-3 py-2.5 text-[#1a1a1a]">
                      <div className="font-medium">{item.model}</div>
                      {item.feature && (
                        <div className="text-[#888] text-[10px]">
                          {item.feature}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                      {item.size || "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black text-white ${rankColor[item.rank] || "bg-[#888]"}`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap text-[#1a1a1a]">
                      ¥{item.price.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-[#888] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-3 py-2.5">
                      <a
                        href={`https://www.mercari.com/jp/search/?keyword=${encodeURIComponent(item.brand + " " + item.model)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded px-2 py-1 text-[10px] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors whitespace-nowrap"
                      >
                        メルカリ
                      </a>
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
    </div>
  );
}
