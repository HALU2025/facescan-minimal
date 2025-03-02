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
    startScanBtn.style.display = "block";
    video.style.display = "none";
    captureBtn.style.display = "none";
    fileInput.style.display = "none";
    analyzeBtn.style.display = "none";
    reCaptureBtn.style.display = "none";
    selectAgainBtn.style.display = "none";
    takePhotoBtn.style.display = "none";
    retryBtn.style.display = "none";
    shareBtn.style.display = "none";
    twitterBtn.style.display = "none";
    fbBtn.style.display = "none";
    instaBtn.style.display = "none";
    preview.style.display = "none";
    
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

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}
// ===================== End Section2 =====================




// ===================== Section3. カメラ起動・ファイル選択の処理 =====================
// 3-1. 診断開始（カメラ起動）処理
startScanBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
    video.style.display = "block";              // カメラ映像表示
    captureBtn.style.display = "inline-block";    // 撮影ボタン表示
    fileInput.style.display = "inline-block";     // 画像参照ボタン表示
    startScanBtn.style.display = "none";          // 診断開始ボタン非表示
    await video.play();
  } catch (err) {
    alert("カメラのアクセスが許可されていません。設定を確認してください。");
    console.error("カメラ起動エラー:", err);
  }
});

// 3-2. 撮影処理（カメラ映像から画像キャプチャ）
captureBtn.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  currentImageData = canvas.toDataURL('image/webp', 0.7);
  preview.src = currentImageData;
  preview.style.display = "block";
  
  mode = "capture"; // 撮影モード
  video.style.display = "none";
  captureBtn.style.display = "none";
  fileInput.style.display = "none";
  analyzeBtn.style.display = "block";
  reCaptureBtn.style.display = "inline-block";
});

// 3-3. ファイル選択処理（画像参照）
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentImageData = e.target.result;
      preview.src = currentImageData;
      preview.style.display = "block";
      
      mode = "file"; // 画像参照モード
      video.style.display = "none";
      captureBtn.style.display = "none";
      fileInput.style.display = "none";
      analyzeBtn.style.display = "block";
      selectAgainBtn.style.display = "inline-block";
      takePhotoBtn.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  }
});
// ===================== End Section3 =====================




// ===================== Section4. 診断実行（API 呼び出し） =====================
analyzeBtn.addEventListener('click', () => {
  if (!currentImageData) {
    alert("画像を撮影または参照してください！");
    return;
  }
  fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: currentImageData })
  })
  .then(response => response.json())
  .then(result => {
    console.log('サーバーからのレスポンス:', result);
    currentResult = result.result;  // 診断結果（HTML形式の文字列）を保存
    // 4-1. 診断結果をHTMLとして表示する
    displayResultHTML(currentResult);
    analyzeBtn.style.display = "none";  // 「この写真で診断」ボタン非表示
    // 結果取得後、再操作ボタン群を表示
    retryBtn.style.display = "block";
    reCaptureBtn.style.display = "none";
    selectAgainBtn.style.display = "none";
    takePhotoBtn.style.display = "none";
    
    mode = "result";
    updateShareUI();  // シェア用UIの更新（モバイル/PCで分岐）
  })
  .catch(error => {
    console.error('エラー発生:', error);
    alert("診断に失敗しました。");
  });
});
// ===================== End Section4 =====================



// ===================== Section5. 診断結果のHTML表示（テキスト→HTML変換） =====================
function transformResultToHTML(resultText) {
  const lines = resultText.split("\n").filter(line => {
    const trimmed = line.trim();
    return trimmed !== "" && !trimmed.includes('----------------------------');
  });

  let html = "<div class='result'>";

  // 定義する出力項目と対応するクラス
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

  // ① 美人度/イケメン度の処理
  const beautyLine = lines.find(line => {
    const t = line.trim();
    return t.startsWith("美人度:") || t.startsWith("イケメン度:");
  });
  if (beautyLine) {
    const parts = beautyLine.split(":");
    const label = parts.shift().trim() + ":";
    let content = parts.join(":").trim();
    // **小数点以下3桁を維持**
    const regex = /^([\D]*)(\d+)(\.\d{1,3})?(.*)$/;
    const match = content.match(regex);
    if (match) {
      const prefix = match[1] || "";
      const integerPart = match[2] || "";
      const fractionalPart = match[3] || ".000"; // **小数3桁を保証**
      const suffix = match[4] || "";
      content = `${prefix}${integerPart}<span>${fractionalPart}${suffix}</span>`;
    }
    html += `<div class="${fields["beauty"]}"><div class="clabel">${label}</div> ${content}</div>`;
  }

  // ② 他の項目の処理
  Object.keys(fields).forEach(key => {
    if (key === "beauty") return;
    const matchingLine = lines.find(line => line.trim().startsWith(key));
    if (matchingLine) {
      const parts = matchingLine.split(":");
      const label = parts.shift().trim() + ":";
      let content = parts.join(":").trim();
      
      // **スコアの小数点以下を3桁に統一**
      const regex = /^([\D]*)(\d+)(\.\d{1,3})?(.*)$/;
      const match = content.match(regex);
      if (match) {
        const prefix = match[1] || "";
        const integerPart = match[2] || "";
        const fractionalPart = match[3] || ".000"; // **小数3桁を保証**
        const suffix = match[4] || "";
        content = `${prefix}${integerPart}<span>${fractionalPart}${suffix}</span>`;
      }

      html += `<div class="${fields[key]}"><div class="clabel">${label}</div> ${content}</div>`;
    }
  });

  html += "</div>";
  return html;
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




// ===================== Section9. スコア調整 =====================

function calculateBeautyScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
    finalScore = rawScore - 10;
  } else {
    finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

function calculateEvaluationScore(rawScore) {
  let finalScore;
  if (rawScore < 85.0) {
    finalScore = rawScore - 10;
  } else {
    finalScore = (rawScore - 85.0) * (14.9 / 10.9) + 85.0;
  }
  return Math.max(0, finalScore);
}

// 小数点以下3桁をランダム追加し、99.999形式に統一
function calculateScoreWithRandomFraction(rawScore, type) {
  let baseScore;
  if (type === "beauty") {
    baseScore = calculateBeautyScore(rawScore);
  } else if (type === "evaluation") {
    baseScore = calculateEvaluationScore(rawScore);
  } else {
    baseScore = rawScore;
  }

  // 小数点以下3桁のランダム数を追加
  const randomFraction = Math.floor(Math.random() * 100) / 1000; // 0.000～0.099
  let finalScore = baseScore + randomFraction;

  // 上限を 99.999 に制限
  finalScore = Math.min(finalScore, 99.999);

  return finalScore.toFixed(3);
}

// ===== 使用例 =====
// 例：美人度/イケメン度の生スコアが 89.5 点の場合
const rawBeautyScore = 89.5;
const finalBeautyScore = calculateScoreWithRandomFraction(rawBeautyScore, "beauty");
console.log("最終 美人度/イケメン度:", finalBeautyScore);

// 例：評価軸の生スコアが 89.5 点の場合（同じ数式を適用）
const rawEvalScore = 89.5;
const finalEvalScore = calculateScoreWithRandomFraction(rawEvalScore, "evaluation");
console.log("最終 評価軸スコア:", finalEvalScore);

// ===================== End Section9 =====================


  
