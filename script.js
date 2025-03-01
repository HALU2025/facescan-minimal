document.getElementById('testBtn').addEventListener('click', async () => {
    // ダミーの画像データとして適当な文字列を送信
    const payload = { image: "dummy-image-data" };
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      document.getElementById('result').textContent = data.result;
    } catch (err) {
      console.error("エラー:", err);
    }
  });
  