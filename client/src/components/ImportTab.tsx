/**
 * Design: RINKAN Black × Gold minimal brand tone
 * Excel import using CDN xlsx (window.XLSX) — keeps bundle small
 * Reset → clears all data and returns to empty state
 */
import { useRef, useState } from "react";
import { getXLSX } from "../lib/xlsx-shim";
import type { Item } from "../types";
import { saveItems, resetItems } from "../lib/storage";

interface Props {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
}

const COLUMN_MAP: Record<string, keyof Item> = {
  "管理番号": "id",
  "ブランド": "brand",
  "コラボ": "collab",
  "シーズン": "season",
  "品番": "model",
  "特徴": "feature",
  "アイテム": "item",
  "仕入値": "cost",
  "売価": "price",
  "サイズ": "size",
  "カラー": "color",
  "ランク": "rank",
  "付属品": "accessories",
  "管理番号2": "number",
  "買取日": "date",
  "仕入店": "shop",
  "カテゴリ": "category",
  "バイヤー": "buyer",
};

export default function ImportTab({ items, onItemsChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = getXLSX();
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) {
          setResult({ type: "error", msg: "データが見つかりませんでした" });
          return;
        }

        const headers = Object.keys(rows[0]);
        const idx: Partial<Record<keyof Item, string>> = {};
        headers.forEach((h) => {
          const key = COLUMN_MAP[h.trim()];
          if (key) idx[key] = h;
        });

        const existingIds = new Set(items.map((i) => i.id));
        let added = 0, skipped = 0;
        const newItems = [...items];

        rows.forEach((row: Record<string, unknown>) => {
          const id = String(row[idx.id ?? ""] ?? "").trim();
          if (!id) { skipped++; return; }
          if (existingIds.has(id)) { skipped++; return; }

          let date = "";
          if (row[idx.date ?? ""]) {
            try {
              date = new Date(row[idx.date ?? ""] as string).toISOString().slice(0, 10);
            } catch {
              date = String(row[idx.date ?? ""] ?? "").slice(0, 10);
            }
          }

          newItems.push({
            id,
            brand: String(row[idx.brand ?? ""] ?? ""),
            collab: String(row[idx.collab ?? ""] ?? ""),
            season: String(row[idx.season ?? ""] ?? ""),
            model: String(row[idx.model ?? ""] ?? ""),
            feature: String(row[idx.feature ?? ""] ?? ""),
            item: String(row[idx.item ?? ""] ?? ""),
            cost: Number(row[idx.cost ?? ""]) || 0,
            price: Number(row[idx.price ?? ""]) || 0,
            size: String(row[idx.size ?? ""] ?? ""),
            color: String(row[idx.color ?? ""] ?? ""),
            rank: String(row[idx.rank ?? ""] ?? ""),
            accessories: String(row[idx.accessories ?? ""] ?? ""),
            number: String(row[idx.number ?? ""] ?? ""),
            date,
            shop: String(row[idx.shop ?? ""] ?? ""),
            category: String(row[idx.category ?? ""] ?? ""),
            buyer: String(row[idx.buyer ?? ""] ?? ""),
          });
          existingIds.add(id);
          added++;
        });

        saveItems(newItems);
        onItemsChange(newItems);
        setResult({
          type: "success",
          msg: `✅ ${added}件追加しました（重複 ${skipped}件スキップ）`,
        });
      } catch (err: unknown) {
        setResult({
          type: "error",
          msg: `エラー: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleReset() {
    if (!confirm("すべてのデータを削除して最初からやり直しますか？\nこの操作は取り消せません。")) return;
    const empty = resetItems();
    onItemsChange(empty);
    setResult(null);
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-5 shadow-sm mb-3.5">
        <div className="text-[10px] font-bold tracking-widest text-[#888] uppercase mb-4">
          Excelデータを追加
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? "border-[#1a1a1a] bg-[#f5f3f0]"
              : "border-[#e0e0e0] bg-[#f5f5f5] hover:border-[#888]"
          }`}
        >
          <div className="text-3xl mb-2.5">📊</div>
          <div className="text-sm font-bold text-[#1a1a1a] mb-1">
            Excelファイルをドロップ
          </div>
          <div className="text-[11px] text-[#888]">
            または タップしてファイルを選択
            <br />
            （.xlsx / .xls 対応）
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        {result && (
          <div
            className={`mt-3.5 text-xs font-bold ${
              result.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {result.msg}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="text-[10px] font-bold tracking-widest text-[#888] uppercase mb-3">
          データ管理
        </div>
        <p className="text-xs text-[#888] mb-3">
          すべてのデータを削除してファイル読み込み画面に戻ります
        </p>
        <button
          onClick={handleReset}
          className="w-full border border-red-300 text-red-500 rounded-xl py-3 text-xs font-bold hover:bg-red-50 transition-colors"
        >
          データをリセット（最初からやり直す）
        </button>
        <p className="text-[10px] text-[#bbb] mt-2 text-center">
          現在 {items.length.toLocaleString()} 件のデータが保存されています
        </p>
      </div>
    </div>
  );
}
