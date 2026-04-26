/**
 * Design: RINKAN Black × Gold minimal brand tone
 * Instagram Story generator using Canvas API
 * Canvas: 1080×1920 (9:16)
 */
import { useRef, useState } from "react";

export default function StoryTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [code, setCode] = useState("");
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

    const brandUpper = brand.trim().toUpperCase();
    // 入力値は税込売価なのでそのまま表示（×1.1しない）
    const ps = "¥" + base.toLocaleString("ja-JP");
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const W = 1080,
      H = 1920;

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

    const TS = 120,
      TE = 740,
      PH = 116,
      BH = 72,
      SH = 31,
      CH = code.trim() ? 25 : 0,
      LH = 29,
      PRH = 91;
    const g1 = 48,
      g2 = 28,
      g3 = 20,
      g4 = 50,
      g5 = 30,
      g6 = 24;
    const bH =
      PH + g1 + BH + g2 + SH + (code.trim() ? g3 + CH : 0) + g4 + 1 + g5 + LH + g6 + PRH;
    let cy = TS + Math.floor((TE - TS - bH) / 2);

    // 買取速報 pill
    ctx.font = "900 64px -apple-system,'Helvetica Neue',Arial,sans-serif";
    const bw = ctx.measureText("買取速報").width;
    const px2 = 60,
      pw2 = bw + px2 * 2,
      ph = PH,
      pX = (W - pw2) / 2,
      pr2 = ph / 2;
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

    // Brand
    ctx.textBaseline = "top";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "800 76px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText(brandUpper, W / 2, cy);
    cy += BH + g2;

    // Size
    ctx.fillStyle = "#888";
    ctx.font = "400 28px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("SIZE  " + size.trim(), W / 2, cy);
    cy += SH;

    // Code
    if (code.trim()) {
      cy += g3;
      ctx.fillStyle = "#bbb";
      ctx.font = "400 23px -apple-system,'Helvetica Neue',Arial,sans-serif";
      ctx.fillText(code.trim(), W / 2, cy);
      cy += CH;
    }

    // Divider
    cy += g4;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 90, cy);
    ctx.lineTo(W / 2 + 90, cy);
    ctx.stroke();
    cy += 1 + g5;

    // 販売価格 label
    ctx.fillStyle = "#888";
    ctx.font = "400 26px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("販売価格", W / 2, cy);
    cy += LH + g6;

    // Price (税込売価をそのまま中央に表示)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "700 96px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText(ps, W / 2, cy);
    cy += PRH + 8;
    ctx.fillStyle = "#888";
    ctx.font = "400 28px -apple-system,'Helvetica Neue',Arial,sans-serif";
    ctx.fillText("（税込）", W / 2, cy);

    const dataUrl = cv.toDataURL("image/png");
    setSaveHref(dataUrl);
    setSaveFilename("rinkan_" + brandUpper.replace(/\s+/g, "_") + ".png");
    setGenerated(true);
    setTimeout(() => {
      cv.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="text-[10px] font-bold tracking-widest text-[#888] uppercase mb-4">
          買取速報 ストーリー作成
        </div>

        <div className="mb-3.5">
          <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">
            ブランド名
          </label>
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
            <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">
              サイズ
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="例：XS"
              className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-3 text-base bg-[#f5f5f5] focus:outline-none focus:border-[#1a1a1a] focus:bg-white placeholder:text-[#bbb]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-[#888] uppercase mb-1.5">
              販売価格（税込）
            </label>
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
            商品コード{" "}
            <span className="font-normal normal-case tracking-normal text-[#bbb]">
              （任意）
            </span>
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
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-auto block"
              />
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

        {/* Hidden canvas for initial render */}
        {!generated && (
          <canvas
            ref={canvasRef}
            width={1080}
            height={1920}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}
