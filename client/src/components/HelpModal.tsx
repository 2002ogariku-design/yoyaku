/**
 * HelpModal — 使い方ガイドモーダル
 * Design: RINKAN Black × Gold minimal brand tone
 */
import { useState } from "react";
import { X, BookOpen, Upload, List, BarChart2, Camera, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const [openSection, setOpenSection] = useState<string | null>("start");

  if (!open) return null;

  const sections: Section[] = [
    {
      id: "start",
      icon: <Upload size={16} />,
      title: "1. データの読み込み",
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>ブラウザで本ツールを開くと、最初に<strong>データ読み込み画面</strong>が表示されます。</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="bg-black text-white text-xs rounded px-1.5 py-0.5 mt-0.5 shrink-0">方法1</span>
              <p>Excel ファイル（.xlsx / .xls）を<strong>点線の枠内にドラッグ＆ドロップ</strong>する</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-black text-white text-xs rounded px-1.5 py-0.5 mt-0.5 shrink-0">方法2</span>
              <p>「<strong>ファイルを選択する</strong>」ボタンをクリックしてファイルを選択する</p>
            </div>
          </div>
          <p>読み込みが完了すると自動的に<strong>在庫一覧</strong>に切り替わります。</p>
          <div className="border-l-2 border-amber-400 pl-3 bg-amber-50 py-2 pr-2 rounded-r text-xs text-amber-800">
            <strong>対応形式：</strong> agreed_appraisal_items_search 形式の Excel。「ブランド名」「アイテム名」「税込売価」「仕入店舗」「バイヤー」などの列が自動で読み込まれます。
          </div>
        </div>
      ),
    },
    {
      id: "inventory",
      icon: <List size={16} />,
      title: "2. 在庫一覧",
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>読み込んだ全買取データを一覧で確認・検索できます。</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-200">機能</th>
                <th className="text-left p-2 border border-gray-200">説明</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["キーワード検索", "ブランド名・アイテム名・モデル名・商品コードで絞り込み"],
                ["ブランドフィルター", "特定ブランドのみ表示"],
                ["カテゴリフィルター", "アイテムカテゴリで絞り込み"],
                ["ランクフィルター", "状態ランク（S/A/B/C）で絞り込み"],
                ["バイヤーフィルター", "担当バイヤーごとに絞り込み"],
                ["Google検索", "各行の「Google」ボタンで相場検索"],
                ["📸 作成", "各行のボタンでストーリー画像を作成"],
              ].map(([f, d]) => (
                <tr key={f} className="border-b border-gray-100">
                  <td className="p-2 border border-gray-200 font-medium whitespace-nowrap">{f}</td>
                  <td className="p-2 border border-gray-200">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "story",
      icon: <Camera size={16} />,
      title: "3. ストーリー作成",
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>在庫一覧の各行にある「<strong>📸 作成</strong>」ボタンから Instagram ストーリー用画像を作成できます。</p>
          <ol className="space-y-2 list-none">
            {[
              "「📸 作成」ボタンをクリック",
              "ブランド名・サイズ・価格・商品コードが自動入力される",
              "内容を確認・編集して「ストーリー画像を作成 →」をクリック",
              "プレビューを確認して「画像をダウンロード」で PNG 保存",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="border-l-2 border-blue-400 pl-3 bg-blue-50 py-2 pr-2 rounded-r text-xs text-blue-800">
            <strong>ブランド名の英語変換：</strong> 約90ブランドの公式英語スペルが登録されています（GUCCI / MAISON MARGIELA / BALENCIAGA など）。辞書にないブランドはモーダル内で手動編集できます。
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      icon: <BarChart2 size={16} />,
      title: "4. 分析",
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>「<strong>分析</strong>」タブでは読み込んだデータを多角的に集計・可視化できます。</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-200">分析項目</th>
                <th className="text-left p-2 border border-gray-200">内容</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["サマリーカード", "総件数・総売価・平均売価・ブランド数をひと目で確認"],
                ["ブランド別", "件数・売価合計・平均売価・構成比"],
                ["カテゴリ別", "アイテムカテゴリごとの件数と売価"],
                ["ランク別", "状態ランクの件数・売価分布"],
                ["仕入店舗別", "店舗ごとの件数・売価合計"],
                ["バイヤー別", "担当者ごとの件数・売価合計・平均売価"],
                ["売価帯分布", "価格レンジごとの件数分布"],
              ].map(([f, d]) => (
                <tr key={f} className="border-b border-gray-100">
                  <td className="p-2 border border-gray-200 font-medium whitespace-nowrap">{f}</td>
                  <td className="p-2 border border-gray-200">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "reset",
      icon: <RefreshCw size={16} />,
      title: "5. データの追加・リセット",
      content: (
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="bg-black text-white text-xs rounded px-1.5 py-0.5 mt-0.5 shrink-0">追加</span>
              <p>「データ追加」タブから別の Excel をドロップすると、既存データに<strong>重複なく追加</strong>されます。毎日の買取データを積み上げる運用が可能です。</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-red-600 text-white text-xs rounded px-1.5 py-0.5 mt-0.5 shrink-0">リセット</span>
              <p>「データ追加」タブ下部の「<strong>データをリセット</strong>」ボタンで全データを削除できます。</p>
            </div>
          </div>
          <div className="border-l-2 border-gray-400 pl-3 bg-gray-50 py-2 pr-2 rounded-r text-xs text-gray-600">
            データはブラウザ内（localStorage）にのみ保存されます。外部サーバーには送信されません。別のブラウザ・端末からはデータを参照できません。
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-black text-white shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} />
            <span className="font-bold tracking-widest text-sm">使い方ガイド</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {sections.map((sec) => (
            <div key={sec.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                  <span className="text-gray-500">{sec.icon}</span>
                  {sec.title}
                </div>
                {openSection === sec.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {openSection === sec.id && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  {sec.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400 text-center">RINKAN SHIBUYA 買取管理ツール — 社内専用</p>
        </div>
      </div>
    </div>
  );
}
