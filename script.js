document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded - JavaScriptが正しく読み込まれました");

  const homeScreen = document.getElementById("home");
  const previewScreen = document.getElementById("previewScreen");
  const startCameraBtn = document.getElementById("startCamera");
  const selectImageBtn = document.getElementById("selectImage");
  const fileInput = document.getElementById("fileInput");
  const video = document.getElementById("video");
  const captureBtn = document.getElementById("capture");
  const preview = document.getElementById("preview");
  const retryBtn = document.getElementById("retry");

  let stream = null; // カメラストリーム用

  // ✅ 画面遷移処理（home → previewScreen）
  function showPreviewScreen() {
    homeScreen.style.display = "none";
    previewScreen.style.display = "block";
  }

  // ✅ 撮影開始ボタンが押されたとき
  startCameraBtn.addEventListener("click", async () => {
    console.log("✅ 撮影開始");

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      video.srcObject = stream;
      video.style.display = "block";
      captureBtn.style.display = "block";
      preview.style.display = "none";
      showPreviewScreen();
      await video.play();
    } catch (err) {
      alert("カメラのアクセスが許可されていません。設定を確認してください。");
      console.error("❌ カメラ起動エラー:", err);
    }
  });

  // ✅ 撮影処理（カメラ映像から画像キャプチャ）
  captureBtn.addEventListener("click", () => {
    console.log("✅ 撮影ボタンが押されました");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    preview.src = canvas.toDataURL("image/webp", 0.7);
    preview.style.display = "block";
    video.style.display = "none";
    captureBtn.style.display = "none";

    // カメラ停止
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  });

  // ✅ 画像選択ボタンが押されたとき
  selectImageBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // ✅ ファイル選択時の処理
  fileInput.addEventListener("change", (event) => {
    console.log("✅ 画像が選択されました");

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
        video.style.display = "none";
        captureBtn.style.display = "none";
        showPreviewScreen();
      };
      reader.readAsDataURL(file);
    }
  });

  // ✅ もう一度撮影 or 画像選択に戻る
  retryBtn.addEventListener("click", () => {
    previewScreen.style.display = "none";
    homeScreen.style.display = "block";

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  });
});
