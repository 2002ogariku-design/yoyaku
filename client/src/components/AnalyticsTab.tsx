/**
 * Design: RINKAN Black × Gold minimal brand tone
 * Bar charts rendered with simple divs (no external chart lib needed)
 */
import { useMemo } from "react";
import type { Item } from "../types";

interface Props {
  items: Item[];
}

function BarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-[10px] font-bold tracking-widest text-[#888] uppercase mb-3">
        {title}
      </div>
      {data.map((d) => (
        <div key={d.label} className="mb-2">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#1a1a1a] truncate max-w-[70%]">
              {d.label}
            </span>
            <span className="text-[#888] ml-2 shrink-0">{d.count}</span>
          </div>
          <div className="bg-[#e0e0e0] rounded h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#1a1a1a] rounded transition-all duration-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsTab({ items }: Props) {
  const brandData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      if (i.brand) map[i.brand] = (map[i.brand] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      if (i.category) map[i.category] = (map[i.category] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  const rankData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      if (i.rank) map[i.rank] = (map[i.rank] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  const shopData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      if (i.shop) map[i.shop] = (map[i.shop] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  const buyerData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      if (i.buyer) map[i.buyer] = (map[i.buyer] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));
  }, [items]);

  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const totalPrice = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="p-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {[
          {
            label: "総仕入額",
            value: "¥" + totalCost.toLocaleString(),
            sub: "買取合計",
          },
          {
            label: "総売価",
            value: "¥" + totalPrice.toLocaleString(),
            sub: "税抜合計",
          },
          {
            label: "平均仕入",
            value:
              "¥" +
              Math.round(totalCost / Math.max(items.length, 1)).toLocaleString(),
            sub: "1点あたり",
          },
          {
            label: "平均売価",
            value:
              "¥" +
              Math.round(
                totalPrice / Math.max(items.length, 1)
              ).toLocaleString(),
            sub: "1点あたり",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3.5 shadow-sm">
            <div className="text-[9px] text-[#888] tracking-widest uppercase mb-1">
              {s.label}
            </div>
            <div className="text-lg font-black text-[#1a1a1a]">{s.value}</div>
            <div className="text-[10px] text-[#bbb] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BarChart title="ブランド別 件数 TOP10" data={brandData} />
        <BarChart title="カテゴリ別 件数 TOP10" data={catData} />
        <BarChart title="ランク別 分布" data={rankData} />
        <BarChart title="仕入店舗別" data={shopData} />
        <BarChart title="バイヤー別 件数 TOP10" data={buyerData} />
      </div>
    </div>
  );
}
