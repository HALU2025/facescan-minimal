// ===================== Section1. 初期設定と DOM 要素の取得 =====================
const video = document.getElementById("video");
const preview = document.getElementById("preview");
const previewRef = document.getElementById("previewRef");
const fileInput = document.getElementById("fileInput");

let currentImageData = ""; // 撮影または選択した画像データ

// ===================== End Section1 =====================


// ===================== Section2. 画面遷移の管理 =====================

// ✅ 画面を切り替える関数
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
}

// ✅ どの画面からもホームに戻る
document.querySelectorAll("#backToHome").forEach(button => {
  button.addEventListener("click", () => showScreen("home"));
});

// ===================== End Section2 =====================


// ===================== Section3. カメラ起動 =====================

// ✅ トップ画面 → 撮影画面
document.getElementById("startCamera").addEventListener("click", () => {
  showScreen("camera");
  startCamera();
});

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

function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  currentImageData = canvas.toDataURL("image/png");
  preview.src = currentImageData;
  preview.style.display = "block";
}

// ✅ 撮影プレビューから撮り直し
document.getElementById("retake").addEventListener("click", () => {
  showScreen("camera");
});

// ===================== End Section3 =====================


// ===================== Section4. 画像選択 =====================

// ✅ トップ画面 → 画像選択画面
document.getElementById("selectImage").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// ✅ 画像選択 → プレビュー画面
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageData = e.target.result;

      // ✅ previewRef が存在するか確認し、なければ作成
      let previewRef = document.getElementById("previewRef");
      if (!previewRef) {
        previewRef = document.createElement("img");
        previewRef.id = "previewRef";
        previewRef.style.maxWidth = "100%";
        document.getElementById("reference-preview").appendChild(previewRef);
      }

      previewRef.src = currentImageData;
      previewRef.style.display = "block";

      // ✅ reference-preview 画面が存在するか確認
      if (document.getElementById("reference-preview")) {
        showScreen("reference-preview");
      } else {
        console.error("❌ reference-preview が見つかりません");
      }
    };
    reader.readAsDataURL(file);
  }
});

// ✅ 画像プレビューから選び直し
document.getElementById("reselect").addEventListener("click", () => {
  showScreen("reference");
});

// ===================== End Section4 =====================



// ===================== Section5. 診断処理 =====================

// ✅ 撮影プレビュー or 画像プレビュー → 診断結果画面
document.getElementById("analyze").addEventListener("click", () => {
  showScreen("result");
  analyzeImage();
});

document.getElementById("analyzeRef").addEventListener("click", () => {
  showScreen("result");
  analyzeImage();
});

function analyzeImage() {
  console.log("診断処理開始...");
  // API に送信して結果を取得する処理を後で追加
}

// ✅ 診断結果からもう一度診断
document.getElementById("retry").addEventListener("click", () => {
  showScreen("home");
});

// ===================== End Section5 =====================




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
