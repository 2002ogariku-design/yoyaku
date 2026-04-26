/**
 * ブランド名 日本語 → 公式英語スペル 変換辞書
 * ストーリー画像のブランド名表示に使用
 */
export const BRAND_MAP: Record<string, string> = {
  // ア行
  "アクネストゥディオズ": "ACNE STUDIOS",
  "アクロニウム": "ACRONYM",
  "アシックス": "ASICS",
  "アディダス": "adidas",
  "アナザーチャンス": "ANOTHER CHANCE",
  "アプレッセ": "AURALEE", // 要確認
  "アミリ": "AMIRI",
  "アリクス": "1017 ALYX 9SM",
  "アワーレガシー": "OUR LEGACY",
  "アーペーセー": "A.P.C.",
  // イ行
  "イッセイミヤケ": "ISSEY MIYAKE",
  "イージー": "YEEZY",
  // エ行
  "エムエムシックス": "MM6 MAISON MARGIELA",
  "エルメス": "HERMÈS",
  "エンタイアスタジオ": "ENTIRE STUDIOS",
  // オ行
  "オフホワイト": "OFF-WHITE",
  "オーバーコート": "OVERCOAT",
  "オーラリー": "AURALEE",
  // カ行
  "カルティエ": "CARTIER",
  "キジマタカユキ": "KIJIMA TAKAYUKI",
  "キス": "KITH",
  // ク行
  "クロエ": "Chloé",
  "クロムハーツ": "CHROME HEARTS",
  // グ行
  "グッチ": "GUCCI",
  // コ行
  "コムデギャルソンオムプリュス": "COMME des GARÇONS HOMME PLUS",
  "コムデギャルソンシャツ": "COMME des GARÇONS SHIRT",
  "コーチ": "COACH",
  // ゴ行
  "ゴヤール": "GOYARD",
  "ゴローズ": "GORO'S",
  // サ行
  "サイト": "SYTE",
  "サンローランパリ": "SAINT LAURENT PARIS",
  // シ行
  "シャネル": "CHANEL",
  "シュガーケーン": "SUGAR CANE",
  "シュプリーム": "SUPREME",
  // ジ行
  "ジェイダブリューアンダーソン": "JW ANDERSON",
  "ジミーチュウ": "JIMMY CHOO",
  "ジャストドン": "JUST DON",
  "ジャックマリーマージュ": "JACQUEMUS",
  "ジルサンダー": "JIL SANDER",
  // ス行
  "ステューシー": "STÜSSY",
  "ストーンアイランド": "STONE ISLAND",
  // セ行
  "セリーヌ": "CELINE",
  "セントマイケル": "SAINT MICHAEL",
  // タ行
  "タトラス": "TATRAS",
  // ダ行
  "ダブレット": "DOUBLET",
  "ダークシャドウ": "DARK SHADOW",
  // テ行
  "ティファニー": "TIFFANY & CO.",
  // ディ行
  "ディオール": "DIOR",
  // デ行
  "デニムティアーズ": "DENIM TEARS",
  // ト行
  "トムウッド": "TOM WOOD",
  "トムブラウン": "THOM BROWNE",
  // ド行
  "ドリスヴァンノッテン": "DRIES VAN NOTEN",
  // ナ行
  "ナイキ": "NIKE",
  // ノ行
  "ノースフェイス": "THE NORTH FACE",
  "ノーマスプロッド": "NOMA t.d.",
  // ハ行
  "ハリーウィンストン": "HARRY WINSTON",
  // バ行
  "バリー": "BALLY",
  "バルマン": "BALMAIN",
  "バレンシアガ": "BALENCIAGA",
  "バーバリー": "BURBERRY",
  // パ行
  "パリーハリウッド": "PHILLY HOLLYWOOD",
  "パレス": "PALACE",
  "パームエンジェルス": "PALM ANGELS",
  // ビ行
  "ビズビム": "VISVIM",
  // フ行
  "フィアオブゴッド": "FEAR OF GOD",
  // ブ行
  "ブレス": "BLESS",
  // プ行
  "プラダ": "PRADA",
  // ヘ行
  "ヘルノ": "HERNO",
  // ボ行
  "ボッテガヴェネタ": "BOTTEGA VENETA",
  // ポ行
  "ポロラルフローレン": "POLO RALPH LAUREN",
  // マ行
  "マルジェラ": "MAISON MARGIELA",
  "マルタンマルジェラ22": "MARTIN MARGIELA 22",
  "マルニ": "MARNI",
  "マーティンローズ": "MARTINE ROSE",
  // ミ行
  "ミュウミュウ": "MIU MIU",
  // ム行
  "ムーレー": "MULBERRY",
  // メ行
  "メゾンマルジェラ": "MAISON MARGIELA",
  // モ行
  "モンクレール": "MONCLER",
  // ユ行
  "ユハ": "JUHA",
  // ヨ行
  "ヨウジヤマモト": "YOHJI YAMAMOTO",
  "ヨウジヤマモトプールオム": "YOHJI YAMAMOTO POUR HOMME",
  // ラ行
  "ランバン": "LANVIN",
  // リ行
  "リックオウエンス": "RICK OWENS",
  "リミフゥ": "LIMI feu",
  // ル行
  "ルイヴィトン": "LOUIS VUITTON",
  // ロ行
  "ロエベ": "LOEWE",
  "ロレックス": "ROLEX",
  "ロロピアーナ": "LORO PIANA",
  // ワ行
  "ワイスリー": "Y-3",
  "ワイズ": "Ys",
  // ヴ行
  "ヴァレンティノ": "VALENTINO",
  "ヴィヴィアンウエストウッド": "VIVIENNE WESTWOOD",
  "ヴェルサーチェ": "VERSACE",
  // その他
  "Matthew M. Williams": "MATTHEW M. WILLIAMS",
};

/**
 * ブランド名を公式英語スペルに変換する
 * 辞書にない場合はそのまま大文字化して返す
 */
export function toBrandEnglish(brand: string): string {
  const trimmed = brand.trim();
  if (BRAND_MAP[trimmed]) {
    return BRAND_MAP[trimmed];
  }
  // 既に英語の場合はそのまま大文字化
  if (/^[a-zA-Z0-9\s\.\-\_&'\/]+$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  // 辞書にない日本語ブランドはそのまま返す
  return trimmed;
}
