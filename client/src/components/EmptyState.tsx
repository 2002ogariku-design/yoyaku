/**
 * Design: RINKAN Black × Gold minimal brand tone
 * Empty state shown when no data is loaded yet.
 * xlsx loaded via CDN (window.XLSX) to keep bundle small.
 */
import { useRef, useState } from "react";
import { getXLSX } from "../lib/xlsx-shim";
import type { Item } from "../types";
import { saveItems } from "../lib/storage";

const COLUMN_MAP: Record<string, keyof Item> = {
  // 旧フォーマット
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
  // 実際のExcelフォーマット (agreed_appraisal_items_search)
  "ブランド名": "brand",
  "コラボブランド": "collab",
  "モデル名": "model",
  "商品特徴": "feature",
  "アイテム名": "item",
  "100イキ": "cost",
  "税抜売価": "price",
  "税込売価": "price",
  "状態ランク": "rank",
  "仕入店舗": "shop",
  "元振り先": "shop",
};

interface Props {
  onItemsLoaded: (items: Item[]) => void;
}

export default function EmptyState({ onItemsLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function processFile(file: File) {
    if (!file || loading) return; // prevent double-drop
    setLoading(true);
    setError("");

    const reader = new FileReader();

    reader.onerror = () => {
      console.error("FileReader error");
      setError("ファイルの読み込みに失敗しました");
      setLoading(false);
    };

    reader.onload = (e) => {
      try {
        const XLSX = getXLSX();
        if (!XLSX) {
          setError("XLSXライブラリが読み込まれていません。ページを再読み込みしてください。");
          return;
        }

        const result = e.target?.result;
        if (!result) {
          setError("ファイルの内容を読み取れませんでした");
          return;
        }

        const data = new Uint8Array(result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setError("Excelシートが見つかりませんでした");
          return;
        }

        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) {
          setError("データが見つかりませんでした（シートが空です）");
          return;
        }

        const headers = Object.keys(rows[0]);
        const idx: Partial<Record<keyof Item, string>> = {};
        headers.forEach((h) => {
          const key = COLUMN_MAP[h.trim()];
          if (key) idx[key] = h;
        });

        const items: Item[] = [];
        rows.forEach((row: Record<string, unknown>, rowIndex: number) => {
          // IDは管理番号列があればそれを使い、なければ行番号で生成
          const rawId = idx.id ? String(row[idx.id] ?? "").trim() : "";
          const id = rawId || `#${String(rowIndex + 1).padStart(3, "0")}`;
          // ブランド名が空の行はスキップ
          const brand = String(row[idx.brand ?? ""] ?? "").trim();
          if (!brand) return;

          let date = "";
          const rawDate = row[idx.date ?? ""];
          if (rawDate) {
            try {
              const d = new Date(rawDate as string);
              if (!isNaN(d.getTime())) {
                date = d.toISOString().slice(0, 10);
              } else {
                date = String(rawDate).slice(0, 10);
              }
            } catch {
              date = String(rawDate).slice(0, 10);
            }
          }

          items.push({
            id,
            brand,
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
        });

        if (items.length === 0) {
          setError("データが見つかりませんでした。ブランド名列が空か、列名が対応していない可能性があります。");
          return;
        }

        try {
          saveItems(items);
        } catch {
          // localStorage quota exceeded — proceed anyway
        }

        // Must call setLoading(false) before onItemsLoaded to avoid state conflict
        setLoading(false);
        onItemsLoaded(items);
      } catch (err: unknown) {
        console.error("processFile error:", err);
        setError(`読み込みエラー: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        // Always ensure loading is cleared
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    // Use getAsFile() for better cross-browser compatibility
    let file: File | null = null;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        file = item.getAsFile();
      }
    } else if (e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    }

    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#f0efed] flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white px-5 py-4">
        <div className="text-base font-black tracking-[0.2em]">RINKAN SHIBUYA</div>
        <div className="text-[10px] text-[#888] tracking-[0.1em] mt-0.5">
          買取管理 &amp; ストーリー作成ツール
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Logo mark */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-2xl mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-xl font-black text-[#1a1a1a] tracking-widest mb-2">
              データを読み込む
            </h1>
            <p className="text-xs text-[#888] leading-relaxed">
              Excelファイル（.xlsx / .xls）をドロップして
              <br />
              買取データを読み込んでください
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
              dragging
                ? "border-[#1a1a1a] bg-[#f5f3f0] scale-[1.01]"
                : "border-[#d0d0d0] bg-white"
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-[#1a1a1a]">読み込み中...</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📂</div>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">
                  ここにファイルをドロップ
                </p>
                <p className="text-[11px] text-[#888] mb-4">
                  または下のボタンからファイルを選択
                </p>
                <div className="inline-flex gap-2">
                  {[".xlsx", ".xls"].map((ext) => (
                    <span
                      key={ext}
                      className="bg-[#f0efed] text-[#888] text-[10px] font-bold px-2.5 py-1 rounded-full"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* File select button */}
          {!loading && (
            <label className="mt-3 block">
              <span className="block w-full bg-[#1a1a1a] text-white rounded-xl py-3.5 text-sm font-bold text-center cursor-pointer hover:bg-[#333] transition-colors">
                ファイルを選択する
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-500 font-bold text-center">{error}</p>
          )}

          <p className="mt-6 text-[10px] text-[#bbb] text-center leading-relaxed">
            データはブラウザ内（localStorage）に保存されます。
            <br />
            外部サーバーには送信されません。
          </p>
        </div>
      </div>
    </div>
  );
}
