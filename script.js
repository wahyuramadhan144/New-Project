const video = document.getElementById('camera');
const snapButton = document.getElementById('snap');
const previewContainer = document.getElementById('previewContainer');
const downloadButton = document.getElementById('downloadButton');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const backButton = document.getElementById('backButton');
const stickyLogo = document.querySelector('.sticky-logo');

window.onload = function () {
  if (!localStorage.getItem("popupShown")) {
    document.getElementById("eventPopup").classList.remove("hidden");
    localStorage.setItem("popupShown", "true");
  }
};

function closePopup() {
  document.getElementById("eventPopup").classList.add("hidden");
}

const photoList = [];
let finalCanvas;

navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 } }
}).then(stream => {
  video.srcObject = stream;
}).catch(error => {
  console.error("Tidak dapat mengakses kamera:", error);
  alert("Tidak dapat mengakses kamera.");
});

function capturePhoto() {
  const fullWidth = video.videoWidth;
  const fullHeight = video.videoHeight;

  const cropWidth = 330;
  const cropHeight = 300;
  const aspectRatio = cropWidth / cropHeight;

  let sx, sy, sw, sh;
  if (fullWidth / fullHeight > aspectRatio) {
    sh = fullHeight;
    sw = sh * aspectRatio;
    sx = (fullWidth - sw) / 2;
    sy = 0;
  } else {
    sw = fullWidth;
    sh = sw / aspectRatio;
    sx = 0;
    sy = (fullHeight - sh) / 2;
  }

  canvas.width = cropWidth;
  canvas.height = cropHeight;
  context.drawImage(video, sx, sy, sw, sh, 0, 0, cropWidth, cropHeight);

  const copiedCanvas = document.createElement('canvas');
  copiedCanvas.width = canvas.width;
  copiedCanvas.height = canvas.height;
  copiedCanvas.getContext('2d').drawImage(canvas, 0, 0);
  photoList.push(copiedCanvas);

  if (photoList.length === 4) {
    combinePhotos();
    video.style.display = 'none';
    document.getElementById('figma-frame').style.display = 'none';
    snapButton.style.display = 'none';
  } else {
    const next = photoList.length + 1;
    showToast(`Foto ${photoList.length} berhasil diambil! Bersiap untuk foto ${next}...`);
    setTimeout(startCountdownAndCapture, 1500);
  }
}

function combinePhotos() {
  Promise.all([
    loadImage('assets/Frame 17.png'),
    loadImage('assets/Frame 18.png')
  ]).then(([frame1, frame2]) => {
    const singleWidth = 1100;
    const singleHeight = 2260;

    const canvas1 = document.createElement('canvas');
    canvas1.width = singleWidth;
    canvas1.height = singleHeight;
    const ctx1 = canvas1.getContext('2d');
    ctx1.drawImage(photoList[0], 32, 40, 980, 900);
    ctx1.drawImage(photoList[1], 32, 920, 980, 900);
    ctx1.drawImage(frame1, 0, 0, singleWidth, singleHeight);

    const canvas2 = document.createElement('canvas');
    canvas2.width = singleWidth;
    canvas2.height = singleHeight;
    const ctx2 = canvas2.getContext('2d');
    ctx2.drawImage(photoList[2], 32, 40, 980, 900);
    ctx2.drawImage(photoList[3], 32, 920, 980, 900);
    ctx2.drawImage(frame2, 0, 0, singleWidth, singleHeight);

const cropBottom = 100;
const cropRight = 40;

  finalCanvas = document.createElement('canvas');
  finalCanvas.width = (singleWidth * 2) - cropRight;
  finalCanvas.height = singleHeight - cropBottom;
  const finalCtx = finalCanvas.getContext('2d');

  finalCtx.drawImage(
    canvas1,
    0, 0, singleWidth, singleHeight - cropBottom,
    0, 0, singleWidth, singleHeight - cropBottom
  );

  finalCtx.drawImage(
    canvas2,
    0, 0, singleWidth - cropRight, singleHeight - cropBottom,
    singleWidth, 0, singleWidth - cropRight, singleHeight - cropBottom
  );

    showPreviewInPage();
  });
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function showPreviewInPage() {
  const imageData = finalCanvas.toDataURL('image/png');
  const previewSection = document.getElementById('previewSection');
  const previewImageContainer = document.getElementById('previewImageContainer');
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
  const filename = `Sweet Happiness Pizzaland_${timestamp}.png`;

  previewImageContainer.innerHTML = `<img src="${imageData}" alt="Hasil Foto" style="max-width: 100%; border-radius: 0px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);"/>`;
  downloadButton.href = imageData;
  downloadButton.download = filename;

  previewSection.style.display = 'flex';
  document.getElementById('downloadContainer').style.display = 'flex';
  document.getElementById('notificationContainer').style.display = 'none';
}

backButton.addEventListener('click', () => {
  document.getElementById('previewSection').style.display = 'none';
  document.getElementById('downloadContainer').style.display = 'none';
  document.getElementById('notificationContainer').style.display = 'block';
  document.getElementById('notificationContainer').textContent = '';
  document.getElementById('figma-frame').style.display = 'block';
  document.getElementById('camera').style.display = 'block';
  document.getElementById('snap').style.display = 'inline-block';

  previewContainer.innerHTML = '';
  photoList.length = 0;

  if (stickyLogo) {
    stickyLogo.style.display = 'block';
  }
});

function startCountdownAndCapture() {
  let counter = 3;
  const countdownElement = document.getElementById('countdown');
  countdownElement.style.display = 'block';
  countdownElement.textContent = counter;

  const interval = setInterval(() => {
    counter--;
    if (counter === 0) {
      clearInterval(interval);
      countdownElement.style.display = 'none';
      capturePhoto();
    } else {
      countdownElement.textContent = counter;
    }
  }, 1000);
}

let toastTimeout;

function showToast(message) {
  const notif = document.getElementById('notificationContainer');
  if (!notif) return;

  clearTimeout(toastTimeout);

  notif.textContent = message;
  notif.style.display = 'block';

  toastTimeout = setTimeout(() => {
    notif.style.display = 'none';
    notif.textContent = '';
  }, 2000);
}

snapButton.addEventListener('click', startCountdownAndCapture);
