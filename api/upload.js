// api/upload.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    
    const { image } = req.body;
    console.log("受信した画像データ:", image ? "あり" : "なし");
    
    // ダミーのレスポンスを返す
    const dummyResult = `
  ----------------------------
  キャッチフレーズ:<b>100年に1人</b>
  美人度: <span style="font-size:24px; font-weight:bold;">95.00</span>点
  推定年齢: 25歳
  フェイスライン 95.00点
  瞳の魅力 96.00点
  肌の透明感 97.00点
  
  似ている芸能人：
  - Aさん
  - Bさん
  
  コメント:<p>とても魅力的な顔立ちです。</p>
  
  ※ AIの判定による結果です。
  ----------------------------
  `;
    
    res.status(200).json({ result: dummyResult });
  }
  