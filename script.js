// ===================== Section1. 初期設定と DOM 要素の取得 =====================
const startScanBtn = document.getElementById('startScan'); // 「診断を開始」ボタン
const video = document.getElementById('video');            // カメラ映像用の video 要素
const captureBtn = document.getElementById('capture');       // 撮影ボタン
const analyzeBtn = document.getElementById('analyze');       // 「この写真で診断」ボタン
const canvas = document.getElementById('canvas');            // 撮影結果用の canvas
const preview = document.getElementById('preview');          // プレビュー画像

// グローバル変数
let currentImageData = "";   // 撮影または選択した画像データ
let currentResult = "";      // AI診断結果のテキスト（HTML形式の文字列）
let mode = "";               // 状態: "capture"（撮影）または "file"（画像参照）など

// 動的に生成する追加UI要素（初期状態は非表示）
const fileInput = document.createElement('input');
fileInput.type = "file";
fileInput.id = "fileInput";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

const reCaptureBtn = document.createElement('button');
reCaptureBtn.textContent = "再撮影する";
reCaptureBtn.style.display = "none";
document.body.appendChild(reCaptureBtn);

const selectAgainBtn = document.createElement('button');
selectAgainBtn.textContent = "画像を選びなおす";
selectAgainBtn.style.display = "none";
document.body.appendChild(selectAgainBtn);

const takePhotoBtn = document.createElement('button');
takePhotoBtn.textContent = "写真を撮影する";
takePhotoBtn.style.display = "none";
document.body.appendChild(takePhotoBtn);

const retryBtn = document.createElement('button');
retryBtn.textContent = "もう一回診断する";
retryBtn.style.display = "none";
document.body.appendChild(retryBtn);

const shareBtn = document.createElement('button');
shareBtn.textContent = "診断結果を画像で保存";
shareBtn.style.display = "none";
document.body.appendChild(shareBtn);

const twitterBtn = document.createElement('button');
twitterBtn.textContent = "Xでシェア";
twitterBtn.style.display = "none";
document.body.appendChild(twitterBtn);

const fbBtn = document.createElement('button');
fbBtn.textContent = "Facebookでシェア";
fbBtn.style.display = "none";
document.body.appendChild(fbBtn);

const instaBtn = document.createElement('button');
instaBtn.textContent = "Instagramでシェア";
instaBtn.style.display = "none";
document.body.appendChild(instaBtn);
// ===================== End Section1 =====================




// ===================== Section2. ユーティリティ関数と状態リセット =====================

function resetToInitial() {
  // 既存の UI 部品の表示状態をリセット
  const elementsToHide = [
    "startScan", "video", "capture", "fileInput", "analyze", "reCaptureBtn",
    "selectAgainBtn", "takePhotoBtn", "retryBtn", "shareBtn",
    "twitterBtn", "fbBtn", "instaBtn", "preview"
  ];

  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  });

  // global variables reset
  currentImageData = "";
  currentResult = "";
  mode = "";

  // もし診断結果エリアが存在すれば削除する
  const resultContainer = document.getElementById('resultContainer');
  if (resultContainer) {
    resultContainer.remove();
  }
}

// ✅ 診断画面だけをリセット（カメラ起動時に使用）
function resetMainDisplay() {
  console.log("✅ 画面をリセット");

  const video = document.getElementById("video");
  const preview = document.getElementById("preview");
  const resultContainer = document.getElementById("resultContainer");

  if (video) video.style.display = "none";
  if (preview) preview.style.display = "none";
  if (resultContainer) resultContainer.style.display = "none";
}

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// ===================== End Section2 =====================





// ===================== Section3. カメラ起動・ファイル選択の処理 =====================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded - JavaScriptが正しく読み込まれました");

  const homeScreen = document.getElementById("home");
  const cameraScreen = document.getElementById("camera");
  const startScanBtn = document.getElementById("startScan");
  const captureBtn = document.getElementById("capture");

  // ✅ 初期状態で `#camera` を非表示
  cameraScreen.style.display = "none";

  // ✅ 診断開始ボタンを押したときの処理（トップ画面 → 撮影画面）
  startScanBtn.addEventListener("click", () => {
    console.log("✅ 診断開始ボタンが押されました");
    homeScreen.style.display = "none";
    cameraScreen.style.display = "block";
  });

  // ✅ 撮影ボタンを押したときの処理（撮影画面 → トップ画面）
  captureBtn.addEventListener("click", () => {
    console.log("✅ 撮影ボタンが押されました");
    cameraScreen.style.display = "none";
    homeScreen.style.display = "block";
  });
});
// ===================== End Section3 =====================







// ===================== Section4. 診断実行（API 呼び出し） =====================
analyzeBtn.addEventListener('click', async () => {
  console.log("✅ 診断開始（画像送信）");

  if (!currentImageData) {
      alert("画像を撮影または参照してください！");
      return;
  }

  try {
      const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: currentImageData })
      });

      if (!response.ok) {
          throw new Error(`HTTPエラー! ステータス: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ APIからのレスポンス:", result);

      if (!result.result) {
          throw new Error("診断結果が取得できませんでした。");
      }

      currentResult = result.result;
      displayResultHTML(currentResult);

      // ✅ 診断結果エリアを確実に表示（レイアウト変更に対応）
      const resultContainer = document.getElementById('resultContainer');
      if (resultContainer) {
          resultContainer.style.display = "block";
      }

      // ✅ UIの切り替え（診断結果表示後）
      analyzeBtn.style.display = "none";
      retryBtn.style.display = "block";
      reCaptureBtn.style.display = "none";
      selectAgainBtn.style.display = "none";
      takePhotoBtn.style.display = "none";
      mode = "result";
      updateShareUI();
  } catch (error) {
      console.error('❌ 診断エラー:', error);
      alert(`診断に失敗しました。\n詳細: ${error.message}`);
  }
});
// ===================== End Section4 =====================






// ===================== Section5. スコア調整 & 診断結果のHTML表示 =====================

// ✅ 美人度/イケメン度のスコア調整（85点以下の -10 調整を削除）
function calculateBeautyScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore; // ✅ 85点以下の減点処理を削除
  } else {
      finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

// ✅ 評価軸スコアの調整（85点以下の -10 調整を削除）
function calculateEvaluationScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
      finalScore = rawScore; // ✅ 85点以下の減点処理を削除
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
  preview.style.display = "none";
}

// ===================== End Section5 =====================





  
  

// ===================== Section6. 各種再操作ボタンの処理 =====================
reCaptureBtn.addEventListener('click', () => {
  currentImageData = "";
  currentResult = "";
  preview.src = "";
  preview.style.display = "none";
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  video.style.display = "block";
  captureBtn.style.display = "inline-block";
  analyzeBtn.style.display = "none";
  reCaptureBtn.style.display = "none";
});

selectAgainBtn.addEventListener('click', () => {
  fileInput.style.display = "inline-block";
  selectAgainBtn.style.display = "none";
  takePhotoBtn.style.display = "none";
  analyzeBtn.style.display = "none";
  preview.src = "";
  preview.style.display = "none";
  currentImageData = "";
  mode = "file";
});

takePhotoBtn.addEventListener('click', () => {
  video.style.display = "block";
  captureBtn.style.display = "inline-block";
  fileInput.style.display = "none";
  selectAgainBtn.style.display = "none";
  takePhotoBtn.style.display = "none";
  analyzeBtn.style.display = "none";
  preview.src = "";
  preview.style.display = "none";
  currentImageData = "";
  mode = "capture";
});

retryBtn.addEventListener('click', () => {
  resetToInitial();
});
// ===================== End Section6 =====================




// ===================== Section7. シェア/保存用UIの更新（モバイル/PC分岐） =====================
function updateShareUI() {
  const container = document.querySelector('.container');
  
  if (mode === 'result') {
    if (isMobile()) {
      let mobileMsg = document.getElementById('mobileSaveMsg');
      if (!mobileMsg) {
        mobileMsg = document.createElement('p');
        mobileMsg.id = 'mobileSaveMsg';
        mobileMsg.textContent = "画像を長押しで保存";
        mobileMsg.style.fontSize = "16px";
        mobileMsg.style.color = "#333";
        mobileMsg.style.textAlign = "center";
        mobileMsg.style.marginTop = "20px";
        container.appendChild(mobileMsg);
      }
    } else {
      const mobileMsg = document.getElementById('mobileSaveMsg');
      if (mobileMsg) mobileMsg.remove();
      
      shareBtn.style.display = "block";
      twitterBtn.style.display = "inline-block";
      fbBtn.style.display = "inline-block";
      instaBtn.style.display = "inline-block";
    }
  }
}
// ===================== End Section7 =====================




// ===================== Section8. シェア/保存ボタンのイベント =====================
if (!isMobile()) {
  shareBtn.addEventListener('click', () => {
    const resultContainer = document.getElementById('resultContainer');
    if (!resultContainer) {
      alert("診断結果表示エリアが見つかりません。");
      return;
    }
    
    html2canvas(resultContainer).then((canvas) => {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = "face_scan_result.png";
      a.click();
    }).catch((err) => {
      console.error("html2canvasエラー:", err);
      alert("画像の生成に失敗しました。");
    });
  });
  
  twitterBtn.addEventListener('click', () => {
    const text = encodeURIComponent("【診断結果】 Check out my FaceScan result!");
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, '_blank');
  });
  
  fbBtn.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(shareUrl, '_blank');
  });
  
  instaBtn.addEventListener('click', () => {
    alert("Instagramへの直接シェアはできません。画像を保存してInstagramアプリから投稿してください。");
  });
}
// ===================== End Section8 =====================


// ===================== Section9. 画面遷移とイベント設定 =====================

// ✅ 画面遷移処理
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
}

// ✅ トップ画面 → 撮影画面
document.getElementById("startScan").addEventListener("click", () => {
  showScreen("camera");
  startCamera();
});

// ✅ 撮影画面 → 診断結果画面
document.getElementById("capture").addEventListener("click", () => {
  captureImage();
  showScreen("result"); // ✅ トップ画面ではなく診断結果画面へ遷移
});

// ✅ もう一度診断（診断結果 → トップ画面）
document.getElementById("retryBtn").addEventListener("click", () => {
  showScreen("home");
});


// ===================== End Section9 =====================



