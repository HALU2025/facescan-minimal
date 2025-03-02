// ===================== Section5. スコア調整 & 診断結果のHTML表示 =====================

// ✅ 美人度/イケメン度のスコア調整
function calculateBeautyScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore - 10;
  } else {
      finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

// ✅ 評価軸スコアの調整
function calculateEvaluationScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore - 10;
  } else {
      finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

// ✅ 小数点以下3桁をランダム追加し、99.999形式に統一
function calculateScoreWithRandomFraction(rawScore, type) {
  let baseScore;
  if (type === "beauty") {
      baseScore = calculateBeautyScore(rawScore);
  } else if (type === "evaluation") {
      baseScore = calculateEvaluationScore(rawScore);
  } else {
      baseScore = rawScore;
  }

  // 小数点以下3桁のランダム値（0.000～0.999）を追加
  const randomFraction = Math.floor(Math.random() * 1000) / 1000;
  let finalScore = baseScore + randomFraction;

  // 上限を 99.999 に制限
  finalScore = Math.min(finalScore, 99.999);

  return finalScore.toFixed(3);
}

function transformResultToHTML(resultText) {
  const lines = resultText.split("\n").filter(line => line.trim() !== "" && !line.includes('----------------------------'));
  let html = "<div class='result'>";

  const fields = {
      "beauty": "beauty-score",
      "キャッチフレーズ:": "catchphrase",
      "推定年齢:": "age",
      "評価軸1:": "score1",
      "評価軸2:": "score2",
      "評価軸3:": "score3",
      "似ている芸能人:": "celeb",
      "コメント:": "comment"
  };

  // ✅ 美人度/イケメン度の表示（99.999形式 & <span>で小数点以下を分離）
  const beautyLine = lines.find(line => line.trim().startsWith("美人度:") || line.trim().startsWith("イケメン度:"));
  if (beautyLine) {
      const parts = beautyLine.split(":");
      const label = parts.shift().trim() + ":";
      let content = parts.join(":").trim();

      // 数値を 99.999 形式にする & <span>で小数点以下を分離
      content = calculateScoreWithRandomFraction(parseFloat(content), "beauty").replace(/(\d+)(\.\d+)/, (match, intPart, fracPart) => {
          return `${intPart}<span>${fracPart}</span>`;
      });

      html += `<div class="${fields["beauty"]}"><div class="clabel">${label}</div> ${content}</div>`;
  }

  // ✅ 他の項目の処理
  Object.keys(fields).forEach(key => {
      if (key === "beauty") return;
      const matchingLine = lines.find(line => line.trim().startsWith(key));
      if (matchingLine) {
          const parts = matchingLine.split(":");
          const label = parts.shift().trim();
          let content = parts.join(":").trim();
          
          // ✅ 評価軸だけラベル削除（「評価軸1:」 → 「クールビューティー: 92.987点」 形式に変更）し、小数点を分離
          if (key.includes("評価軸")) {
              content = calculateScoreWithRandomFraction(parseFloat(content.replace(/[^0-9.]/g, "")), "evaluation")
                  .replace(/(\d+)(\.\d+)/, (match, intPart, fracPart) => {
                      return `<div class="clabel">${label}:</div> ${intPart}<span>${fracPart}</span>`;
                  });
              html += `<div class="score">${content}</div>`;
          } else {
              // ✅ 推定年齢は整数のまま表示
              if (key === "推定年齢:") {
                  content = content.replace(/(\d+)\.000/, "$1");
              }
              html += `<div class="${fields[key]}"><div class="clabel">${label}:</div> ${content}</div>`;
          }
      }
  });

  html += "</div>";
  return html;
}

function displayResultHTML(resultText) {
  let resultContainer = document.getElementById('resultContainer');
  if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.id = 'resultContainer';
      resultContainer.style.marginTop = "20px";
      resultContainer.style.padding = "20px";
      resultContainer.style.backgroundColor = "#fff";
      resultContainer.style.border = "1px solid #ccc";
      resultContainer.style.borderRadius = "8px";

      if (currentImageData) {
          const thumbDiv = document.createElement('div');
          thumbDiv.className = "result-thumbnail";
          const thumbImg = document.createElement('img');
          thumbImg.src = currentImageData;
          thumbImg.alt = "診断対象のサムネイル";
          thumbDiv.appendChild(thumbImg);
          resultContainer.appendChild(thumbDiv);
      }
      document.querySelector('.container').appendChild(resultContainer);
  } else {
      resultContainer.innerHTML = "";
      if (currentImageData) {
          const thumbDiv = document.createElement('div');
          thumbDiv.className = "result-thumbnail";
          const thumbImg = document.createElement('img');
          thumbImg.src = currentImageData;
          thumbImg.alt = "診断対象のサムネイル";
          thumbDiv.appendChild(thumbImg);
          resultContainer.appendChild(thumbDiv);
      }
  }

  // ✅ ここでスコア調整を適用してから表示
  resultContainer.innerHTML += transformResultToHTML(resultText);
  preview.style.display = "none";
}

// ===================== End Section5 =====================
