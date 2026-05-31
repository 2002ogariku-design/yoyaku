/**
 * AnalyticsTab — 分析タブ（強化版）
 * Design: RINKAN Black × Gold minimal brand tone
 * 分析項目: サマリー / ブランド別 / カテゴリ別 / ランク別 / 仕入店舗別 / バイヤー別 / 売価帯分布
 */
import { useMemo } from "react";
import type { Item } from "../types";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface Props { items: Item[] }

const fmt = (n: number) => "¥" + Math.round(n).toLocaleString();
const fmtK = (n: number) => n >= 10000 ? "¥" + (n / 10000).toFixed(1) + "万" : "¥" + n.toLocaleString();

const COLORS = ["#1a1a1a", "#c8a96e", "#555", "#888", "#bbb", "#e0c89a", "#333", "#aaa", "#d4a853", "#666"];

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-[9px] text-gray-400 tracking-widest uppercase mb-1">{label}</div>
      <div className="text-xl font-black text-[#1a1a1a] leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">{title}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function DetailTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#1a1a1a] text-white">
            {headers.map((h, i) => (
              <th key={i} className={`p-2.5 text-[10px] font-bold tracking-wider ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, ci) => (
                <td key={ci} className={`p-2.5 text-xs border-b border-gray-100 ${ci === 0 ? "font-medium text-left" : "text-right tabular-nums"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
        <p className="font-bold text-gray-800 mb-1 break-words">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="tabular-nums">
            {p.name}: {typeof p.value === "number" ? (p.name?.includes("価") ? fmt(p.value) : p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsTab({ items }: Props) {
  const costs = useMemo(() => items.map((i) => i.cost).filter((c) => c > 0), [items]);
  const totalCost = useMemo(() => costs.reduce((a, b) => a + b, 0), [costs]);
  const avgCost = costs.length > 0 ? totalCost / costs.length : 0;
  const maxCost = costs.length > 0 ? Math.max(...costs) : 0;
  const minCost = costs.length > 0 ? Math.min(...costs) : 0;
  const medianCost = useMemo(() => {
    if (costs.length === 0) return 0;
    const sorted = [...costs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [costs]);

  const brandStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      if (!i.brand) return;
      const s = map.get(i.brand) || { count: 0, total: 0 };
      s.count++; s.total += i.cost || 0;
      map.set(i.brand, s);
    });
    return Array.from(map.entries())
      .map(([brand, s]) => ({ brand, count: s.count, total: s.total, avg: s.count > 0 ? s.total / s.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const key = i.item || "不明";
      const s = map.get(key) || { count: 0, total: 0 };
      s.count++; s.total += i.cost || 0;
      map.set(key, s);
    });
    return Array.from(map.entries())
      .map(([item, s]) => ({ item, count: s.count, total: s.total, avg: s.count > 0 ? s.total / s.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const rankStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const key = i.rank || "不明";
      const s = map.get(key) || { count: 0, total: 0 };
      s.count++; s.total += i.cost || 0;
      map.set(key, s);
    });
    return Array.from(map.entries())
      .map(([rank, s]) => ({ rank, count: s.count, total: s.total, avg: s.count > 0 ? s.total / s.count : 0 }))
      .sort((a, b) => a.rank.localeCompare(b.rank));
  }, [items]);

  const shopStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const key = i.shop || "不明";
      const s = map.get(key) || { count: 0, total: 0 };
      s.count++; s.total += i.cost || 0;
      map.set(key, s);
    });
    return Array.from(map.entries())
      .map(([shop, s]) => ({ shop, count: s.count, total: s.total, avg: s.count > 0 ? s.total / s.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const buyerStats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    items.forEach((i) => {
      const key = i.buyer || "不明";
      const s = map.get(key) || { count: 0, total: 0 };
      s.count++; s.total += i.cost || 0;
      map.set(key, s);
    });
    return Array.from(map.entries())
      .map(([buyer, s]) => ({ buyer, count: s.count, total: s.total, avg: s.count > 0 ? s.total / s.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const priceRangeStats = useMemo(() => {
    const ranges = [
      { label: "〜¥10,000", min: 0, max: 10000 },
      { label: "¥10,001〜¥30,000", min: 10001, max: 30000 },
      { label: "¥30,001〜¥50,000", min: 30001, max: 50000 },
      { label: "¥50,001〜¥100,000", min: 50001, max: 100000 },
      { label: "¥100,001〜¥200,000", min: 100001, max: 200000 },
      { label: "¥200,001〜", min: 200001, max: Infinity },
    ];
    return ranges.map((r) => {
      const inRange = items.filter((i) => i.price >= r.min && i.price <= r.max);
      const total = inRange.reduce((a, b) => a + (b.cost || 0), 0);
      return {
        label: r.label,
        count: inRange.length,
        total,
        pct: items.length > 0 ? (inRange.length / items.length * 100).toFixed(1) : "0",
      };
    });
  }, [items]);

  const top10Brands = brandStats.slice(0, 10);

  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto pb-16">

      {/* サマリー */}
      <div>
        <SectionHeader title="サマリー" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SummaryCard label="総点数" value={items.length.toLocaleString() + " 点"} />
          <SummaryCard label="総仕入額" value={fmtK(totalCost)} sub={fmt(totalCost)} />
          <SummaryCard label="平均仕入額" value={fmtK(avgCost)} sub={fmt(avgCost)} />
          <SummaryCard label="中央値仕入額" value={fmtK(medianCost)} sub={fmt(medianCost)} />
          <SummaryCard label="最高仕入額" value={fmtK(maxCost)} sub={fmt(maxCost)} />
          <SummaryCard label="最低仕入額" value={fmtK(minCost)} sub={fmt(minCost)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <SummaryCard label="ブランド数" value={new Set(items.map(i => i.brand).filter(Boolean)).size + " ブランド"} />
          <SummaryCard label="アイテム種別" value={new Set(items.map(i => i.item).filter(Boolean)).size + " 種"} />
          <SummaryCard label="仕入店舗数" value={new Set(items.map(i => i.shop).filter(Boolean)).size + " 店舗"} />
          <SummaryCard label="バイヤー数" value={new Set(items.map(i => i.buyer).filter(Boolean)).size + " 名"} />
        </div>
      </div>

      {/* ブランド別 */}
      <div>
        <SectionHeader title="ブランド別" />
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">点数 TOP 10</p>
          <ResponsiveContainer width="100%" height={260}>
            <ReBarChart data={top10Brands} margin={{ top: 0, right: 10, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="brand" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="点数" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <DetailTable
          headers={["ブランド", "点数", "構成比", "仕入金額合計", "平均仕入額"]}
          rows={brandStats.map((s) => [
            s.brand,
            s.count + " 点",
            (items.length > 0 ? (s.count / items.length * 100).toFixed(1) : "0") + "%",
            fmt(s.total),
            fmt(s.avg),
          ])}
        />
      </div>

      {/* カテゴリ別 */}
      <div>
        <SectionHeader title="カテゴリ別" />
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">点数分布</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryStats.slice(0, 8)}
                  dataKey="count"
                  nameKey="item"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ item, percent }: any) => `${item} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={9}
                >
                  {categoryStats.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => v + " 点"} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">仕入金額合計</p>
            <ResponsiveContainer width="100%" height={220}>
              <ReBarChart data={categoryStats.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => fmtK(v)} />
                <YAxis type="category" dataKey="item" tick={{ fontSize: 9 }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="仕入金額合計" fill="#c8a96e" radius={[0, 3, 3, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DetailTable
          headers={["カテゴリ", "点数", "構成比", "仕入金額合計", "平均仕入額"]}
          rows={categoryStats.map((s) => [
            s.item,
            s.count + " 点",
            (items.length > 0 ? (s.count / items.length * 100).toFixed(1) : "0") + "%",
            fmt(s.total),
            fmt(s.avg),
          ])}
        />
      </div>

      {/* ランク別 */}
      <div>
        <SectionHeader title="ランク別" />
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">点数分布</p>
            <ResponsiveContainer width="100%" height={200}>
              <ReBarChart data={rankStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="rank" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="点数" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">平均仕入額</p>
            <ResponsiveContainer width="100%" height={200}>
              <ReBarChart data={rankStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="rank" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtK(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg" name="平均仕入額" fill="#c8a96e" radius={[3, 3, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DetailTable
          headers={["ランク", "点数", "構成比", "仕入金額合計", "平均仕入額"]}
          rows={rankStats.map((s) => [
            s.rank,
            s.count + " 点",
            (items.length > 0 ? (s.count / items.length * 100).toFixed(1) : "0") + "%",
            fmt(s.total),
            fmt(s.avg),
          ])}
        />
      </div>

      {/* 仕入店舗別 */}
      <div>
        <SectionHeader title="仕入店舗別" />
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">件数</p>
          <ResponsiveContainer width="100%" height={Math.max(200, shopStats.length * 32)}>
            <ReBarChart data={shopStats} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="shop" tick={{ fontSize: 9 }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="点数" fill="#1a1a1a" radius={[0, 3, 3, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <DetailTable
          headers={["仕入店舗", "点数", "構成比", "仕入金額合計", "平均仕入額"]}
          rows={shopStats.map((s) => [
            s.shop,
            s.count + " 点",
            (items.length > 0 ? (s.count / items.length * 100).toFixed(1) : "0") + "%",
            fmt(s.total),
            fmt(s.avg),
          ])}
        />
      </div>

      {/* バイヤー別 */}
      <div>
        <SectionHeader title="バイヤー別" />
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">件数</p>
            <ResponsiveContainer width="100%" height={Math.max(160, buyerStats.length * 36)}>
              <ReBarChart data={buyerStats} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="buyer" tick={{ fontSize: 9 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="点数" fill="#1a1a1a" radius={[0, 3, 3, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">仕入金額合計</p>
            <ResponsiveContainer width="100%" height={Math.max(160, buyerStats.length * 36)}>
              <ReBarChart data={buyerStats} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => fmtK(v)} />
                <YAxis type="category" dataKey="buyer" tick={{ fontSize: 9 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="仕入金額合計" fill="#c8a96e" radius={[0, 3, 3, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DetailTable
          headers={["バイヤー", "点数", "構成比", "仕入金額合計", "平均仕入額"]}
          rows={buyerStats.map((s) => [
            s.buyer,
            s.count + " 点",
            (items.length > 0 ? (s.count / items.length * 100).toFixed(1) : "0") + "%",
            fmt(s.total),
            fmt(s.avg),
          ])}
        />
      </div>

      {/* 売価帯分布 */}
      <div>
        <SectionHeader title="売価帯分布" />
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-3">価格レンジごとの点数</p>
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={priceRangeStats} margin={{ bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="点数" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <DetailTable
          headers={["売価帯", "点数", "構成比", "仕入金額合計"]}
          rows={priceRangeStats.map((s) => [
            s.label,
            s.count + " 点",
            s.pct + "%",
            fmt(s.total),
          ])}
        />
      </div>

    </div>
  );
}
