export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: "Image data is required." });
      return;
    }
    
    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `
  あなたは、画像解析を行う専門AIです。
  以下の診断項目を正確に評価し、指定のフォーマットで出力してください。
  
  # 🔹 診断ルール
  1️⃣ **美人度/イケメン度（必須判定）**
  - 女性の場合は美人度、男性の場合はイケメン度を表示
  - 小数点2桁まで算出、最高点は99.99点
  - ...（ルールの全文を記述）
  `
            },
            {
              role: "user",
              content: `この画像の人物を診断してください。画像データ: ${image}`
            }
          ],
          max_tokens: 300
        })
      });
      
      const data = await openaiResponse.json();
      const result = data.choices?.[0]?.message?.content;
      if (!result) {
        res.status(500).json({ error: "No result returned from OpenAI API" });
        return;
      }
      
      res.status(200).json({ result });
      
    } catch (error) {
      console.error("OpenAI API call error:", error);
      res.status(500).json({ error: "OpenAI API call failed", details: error.message });
    }
  }
  