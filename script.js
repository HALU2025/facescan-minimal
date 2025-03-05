// ===================== Section1. 初期設定と DOM 要素の取得 =====================

const video = document.getElementById("video");
const preview = document.getElementById("preview");
const previewRef = document.getElementById("previewRef");
const fileInput = document.getElementById("fileInput");

let currentImageData = ""; // 撮影または選択した画像データ

/**
 * 画像のリサイズ＆圧縮処理
 * @param {string} imageData - Base64画像データ
 * @param {number} maxSize - 最大サイズ（px）
 * @param {number} quality - 圧縮品質（0.1～1.0）
 * @returns {Promise<string>} - 圧縮されたBase64データ
 */
function compressImage(imageData, maxSize = 512, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // アスペクト比を維持してリサイズ
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // 画像を圧縮（WebP形式で品質指定）
            const compressedData = canvas.toDataURL("image/webp", quality);
            resolve(compressedData);
        };
    });
}

// ===================== End Section1 =====================


// ===================== Section2. 画面遷移の管理 =====================

// ✅ 画面を切り替える関数
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";

  // ✅ プレビュー画面なら previewRef を確実に表示
  if (screenId === "reference-preview" && currentImageData) {
    previewRef.style.display = "block";
  }
}

// ✅ どの画面からもホームに戻る
document.querySelectorAll(".backToHome").forEach(button => {
  button.addEventListener("click", () => showScreen("home"));
});

// ===================== End Section2 =====================


// ===================== Section3. カメラ起動 =====================

// ✅ トップ画面 → 撮影画面
document.getElementById("startCamera").addEventListener("click", () => {
  showScreen("camera");
  startCamera();
});

/**
 * カメラを起動し、映像を取得
 */
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      video.srcObject = stream;
      video.style.display = "block";
    })
    .catch(err => {
      alert("カメラのアクセスが許可されていません。設定を確認してください。");
      console.error("カメラ起動エラー:", err);
    });
}

// ✅ 撮影画面 → プレビュー画面
document.getElementById("capture").addEventListener("click", () => {
  captureImage();
  showScreen("camera-preview");
});

/**
 * 撮影画像を取得し、圧縮処理を適用
 */
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  compressImage(canvas.toDataURL("image/png")).then(compressedData => {
    currentImageData = compressedData;
    preview.src = currentImageData;
    preview.style.display = "block";
  });
}

// ✅ 撮影プレビューから撮り直し
document.getElementById("retake").addEventListener("click", () => {
  showScreen("camera");
});

// ===================== End Section3 =====================


// ===================== Section4. 画像選択処理 =====================

// ✅ 画像選択 → プレビュー画面
fileInput.addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      // ✅ 画像を圧縮
      currentImageData = await compressImage(e.target.result);

      // ✅ 画像をプレビューに反映
      previewRef.src = currentImageData;
      previewRef.style.display = "block";

      // ✅ `analyze` ボタンを有効化
      document.getElementById("analyze").style.display = "block";

      // ✅ プレビュー画面へ遷移
      showScreen("reference-preview");

      // ✅ `fileInput` をリセット
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }
});

// ===================== End Section4 =====================


// ===================== Section5. 診断処理 =====================

// ✅ 診断実行ボタンのイベント
document.querySelectorAll(".analyze-btn").forEach(button => {
  button.addEventListener("click", async () => {
    if (!currentImageData) {
      alert("画像を撮影または選択してください！");
      return;
    }

    console.log("診断実行 - currentImageData:", currentImageData); // デバッグ用

    try {
      console.log("APIへ画像を送信中...");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: currentImageData }),
      });

      if (!response.ok) {
        throw new Error(`HTTPエラー! ステータス: ${response.status}`);
      }

      const result = await response.json();
      console.log("APIレスポンス:", result);

      // 診断結果を保存
      currentResult = result.result;

      // ✅ 診断結果画面へ遷移
      showScreen("result");

      // ✅ 結果を画面に反映
      displayResultHTML(currentResult);

    } catch (error) {
      console.error("診断エラー:", error);
      alert("診断に失敗しました。ネットワーク状況を確認してください。");
    }
  });
});

// ===================== End Section5 =====================





// ===================== Section6. 診断結果のHTML表示 =====================

// ✅ 美人度/イケメン度のスコア調整
function calculateBeautyScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore;
  } else {
      finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

// ✅ 評価軸スコアの調整
function calculateEvaluationScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore; 
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
      "顔年齢:": "age",
      "評価軸1:": "score1",
      "評価軸2:": "score2",
      "評価軸3:": "score3",
      "似ている有名人:": "celeb",
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

          // ✅ 評価軸のラベルを適切に置き換え、数値が入らないよう修正
          if (key.includes("評価軸")) {
              let [axisLabel, score] = content.split(/(\d+\.?\d*)/); // 評価軸名と数値を分割
              score = calculateScoreWithRandomFraction(parseFloat(score), "evaluation");

              let formattedScore = score.replace(/(\d+)(\.\d+)/, (match, intPart, fracPart) => {
                  return `${intPart}<span>${fracPart}</span>`;
              });

              html += `<div class="score"><div class="clabel">${axisLabel.trim()}:</div> ${formattedScore}</div>`;
          } else {
              // ✅ 推定年齢は整数のまま表示
              if (key === "顔年齢:") {
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

  // ✅ 診断結果エリアがない場合は作成し、`mainDisplay` の中に追加
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

      const mainDisplay = document.getElementById('mainDisplay');
      if (mainDisplay) {
          mainDisplay.appendChild(resultContainer);
      }
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
}


// ===================== End Section7 =====================




// ===================== Section9. 画面遷移とイベント設定 =====================

// ✅ 画面を切り替える関数
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
}

// ✅ 初期設定：home 画面を表示、他を非表示
document.addEventListener("DOMContentLoaded", () => {
  showScreen("home");
});

// ✅ トップ画面 → 撮影画面
document.getElementById("startCamera").addEventListener("click", () => {
  showScreen("camera");
  startCamera();
});

// ✅ トップ画面 → 画像選択
document.getElementById("selectImage").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// ✅ 画像選択時にプレビュー画面へ遷移
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("preview").src = e.target.result;
      showScreen("reference-preview");
    };
    reader.readAsDataURL(file);
  }
});

// ✅ 撮影ボタンを押したときにカメラプレビューへ遷移
document.getElementById("capture").addEventListener("click", () => {
  captureImage();
  showScreen("camera-preview");
});

// ✅ プレビュー画面 → 診断結果画面
document.getElementById("analyze").addEventListener("click", () => {
  showScreen("result");
  analyzeImage();
});

// ✅ ホームへ戻るボタン（全画面共通）
document.querySelectorAll(".homeBtn").forEach(button => {
  button.addEventListener("click", () => showScreen("home"));
});

// ===================== End Section9 =====================
