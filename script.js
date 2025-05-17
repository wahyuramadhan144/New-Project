const video = document.getElementById('camera');
const snapButton = document.getElementById('snap');
const previewContainer = document.getElementById('previewContainer');
const downloadButton = document.getElementById('downloadButton');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const backButton = document.getElementById('backButton');

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


  if (photoList.length === 2) {
    combinePhotos();
    video.style.display = 'none';
    document.getElementById('figma-frame').style.display = 'none';
    snapButton.style.display = 'none';
  } else {
    alert('Foto pertama diambil, ambil satu lagi.');
  }
}

function combinePhotos() {
  finalCanvas = document.createElement('canvas');
  finalCanvas.width = 1100;
  finalCanvas.height = 2260;
  const ctx = finalCanvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(photoList[0], 32, 40, 980, 900);
  ctx.drawImage(photoList[1], 32, 920, 980, 900);

  const frameImage = new Image();
  frameImage.src = 'assets/Frame 17.png';
  frameImage.onload = () => {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; 
    ctx.shadowBlur = 50;                  
    ctx.shadowOffsetX = 0;               
    ctx.shadowOffsetY = 10;               

    ctx.drawImage(frameImage, 0, 0, finalCanvas.width, finalCanvas.height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    showPreviewInPage();
  };
}

function showPreviewInPage() {
  const doubleCanvas = document.createElement('canvas');
  doubleCanvas.width = finalCanvas.width * 2;
  doubleCanvas.height = finalCanvas.height;

  const ctx = doubleCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(finalCanvas, 0, 0); 
  ctx.drawImage(finalCanvas, finalCanvas.width, 0);

  const imageData = doubleCanvas.toDataURL('image/png');
  const previewSection = document.getElementById('previewSection');
  const previewImageContainer = document.getElementById('previewImageContainer');
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
  const filename = `Sweet Happiness Pizzaland_${timestamp}.png`;
  const downloadButton = document.getElementById('downloadButton');
  const downloadContainer = document.getElementById('downloadContainer');

  previewImageContainer.innerHTML = `<img src="${imageData}" alt="Hasil Foto" style="max-width: 100%; border-radius: 8px;" />`;

  downloadButton.href = imageData;
  downloadButton.download = filename;

  previewSection.style.display = 'flex';
  downloadContainer.style.display = 'flex';
}

backButton.addEventListener('click', () => {
  document.getElementById('previewSection').style.display = 'none';
  document.getElementById('downloadContainer').style.display = 'none';

  document.getElementById('figma-frame').style.display = 'block';
  document.getElementById('camera').style.display = 'block';
  document.getElementById('snap').style.display = 'inline-block';

  document.getElementById('previewContainer').innerHTML = '';

  photoList.length = 0;
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


snapButton.addEventListener('click', startCountdownAndCapture);
downloadButton.addEventListener('click', downloadButton);
