// Ramadan Quests - Interactive Features
// Photo Upload, Activities, Gallery, Games
// ==========================================

// ===== Photo Upload System =====

let currentQuestForPhoto = null;
let currentPhotoFile = null;
let currentQuestDay = 1; // default value


// ===== IndexedDB for Quest Photos (cached connection) =====
const DB_NAME = 'ramadanQuestsDB';
const DB_VERSION = 1;
const STORE = 'questPhotos';

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('questDay', 'questDay', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    req.onsuccess = () => {
      dbInstance = req.result;

      // optional safety
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    req.onerror = () => reject(req.error);
  });
}

async function idbAddPhoto(record) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);

    store.add({
      ...record,
      timestamp: record.timestamp || new Date().toISOString()
    });
  });
}

async function idbGetAllPhotos() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function idbDeletePhoto(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function openPhotoUploadModal(questDay) {
    currentQuestForPhoto = questDay;
    const modal = document.getElementById('photoModal');
    modal.classList.add('active');
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
    currentQuestForPhoto = null;
    currentPhotoFile = null;

    
    // Reset preview
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
}

function triggerGallery() {
    document.getElementById('galleryInput').click();
}

function triggerCamera() {
  const input = document.getElementById('photoInput');
  if (!input) return;

  input.value = ''; 
  input.click();
}


function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentPhotoFile = file;

  // preview
  const img = document.getElementById('previewImage');
  img.src = URL.createObjectURL(file);

  document.getElementById('photoPreview').style.display = 'block';
}

function retakePhoto() {
  document.getElementById('photoPreview').style.display = 'none';
  currentPhotoFile = null;
}


async function saveQuestPhoto() {
  if (!currentPhotoFile || !currentQuestForPhoto) return;

  const record = {
    questDay: Number(currentQuestForPhoto),
    questTitle: questsData[currentQuestForPhoto - 1].title,
    photoBlob: currentPhotoFile
  };

  try {
    await idbAddPhoto(record);
  } catch (e) {
    console.error('IndexedDB save failed:', e);
    app.showNotification?.('⚠️ Could not save photo, but quest will be completed.', 'warning');
  }

  // complete quest
  app.finalizeQuestCompletion(currentQuestForPhoto);

  closePhotoModal();

  app.showNotification?.('📸 Photo saved! Quest completed with proof!', 'success');
  updatePhotoGallery();
}


function skipPhotoUpload() {
  if (!currentQuestForPhoto) return;

  app.finalizeQuestCompletion(currentQuestForPhoto);

  currentQuestForPhoto = null;
  currentPhotoFile = null;
  closePhotoModal();
}

// ===== Photo Gallery System =====

async function getQuestPhotos() {
  const photos = await idbGetAllPhotos();

  // newest first
  photos.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return photos
    .map(p => {
      let src = '';

      // Preferred: Blob stored in photoBlob
      if (p.photoBlob instanceof Blob) {
        src = URL.createObjectURL(p.photoBlob);
      }
      // Fallback: older records might store a string (dataURL) in photo
      else if (typeof p.photo === 'string' && p.photo.trim()) {
        src = p.photo;
      }
      // Fallback: some records might store Blob directly in photo
      else if (p.photo instanceof Blob) {
        src = URL.createObjectURL(p.photo);
      } else {
        src = ''; // broken record
      }

      return {
        id: p.id,
        questDay: p.questDay,
        questTitle: p.questTitle,
        timestamp: p.timestamp,
        photo: src
      };
    })
    .filter(p => p.photo); // remove broken ones
}


async function openGalleryModal() {
    const photos = await getQuestPhotos();
    const modal = document.getElementById('galleryModal');
    const grid = document.getElementById('photoGalleryGrid');
    
    if (photos.length === 0) {
        grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-images"></i><p>Your photo gallery is empty.<br>Complete quests with photo proof!</p></div>';
    } else {
        grid.innerHTML = photos.map((photo, index) => `
            <div class="gallery-item" onclick="viewPhoto(${index})">
                <img src="${photo.photo}" alt="${photo.questTitle}">
                <div class="gallery-item-overlay">
                    Day ${photo.questDay}: ${photo.questTitle.substring(0, 20)}...
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('active');
}

window.updatePhotoGallery = async function () {
  const photos = await getQuestPhotos();

  // ---- Stats (safe) ----
  const totalPhotosEl = document.getElementById('totalPhotos');
  if (totalPhotosEl) {
    totalPhotosEl.textContent = photos.length;
  }

  const questsWithPhotosEl = document.getElementById('questsWithPhotos');
  if (questsWithPhotosEl) {
    questsWithPhotosEl.textContent = photos.length;
  }

  // ---- Recent photos grid (safe) ----
  const recentGrid = document.getElementById('recentPhotos');
  if (!recentGrid) return; 
  const recentPhotos = photos.slice(-6).reverse();

  if (recentPhotos.length === 0) {
    recentGrid.innerHTML = `
      <div class="gallery-empty">
        <i class="fas fa-camera"></i>
        <p>No photos yet! Complete quests and upload proof.</p>
      </div>
    `;
    return;
  }

  recentGrid.innerHTML = recentPhotos.map(photo => `
    <div class="gallery-item" onclick="viewPhotoById(${photo.id})">
      <img src="${photo.photo}" alt="${photo.questTitle || ''}">
      <div class="gallery-item-overlay">
        Day ${photo.questDay}
      </div>
    </div>
  `).join('');
};

async function viewPhoto(index) {
  const photos = await getQuestPhotos();
  const photo = photos[index];
  if (!photo) return;

  const viewer = document.createElement('div');
  viewer.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  viewer.innerHTML = `
  <div style="color: white; text-align: center; margin-bottom: 20px;">
      <h3>Day ${photo.questDay}: ${photo.questTitle}</h3>
      <p style="opacity: 0.7;">${new Date(photo.timestamp).toLocaleDateString()}</p>
  </div>

  <img src="${photo.photo}" style="max-width: 90%; max-height: 70vh; border-radius: 12px;">

  <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content:center;">
      <button id="downloadBtn" class="btn btn-primary">
          <i class="fas fa-download"></i> Download
      </button>

      <button id="deleteBtn" class="btn btn-danger">
          <i class="fas fa-trash"></i> Delete
      </button>

      <button id="closeBtn" class="btn btn-secondary">
          <i class="fas fa-times"></i> Close
      </button>
  </div>
  `;


  document.body.appendChild(viewer);

  // ✅ Delete
  viewer.querySelector('#deleteBtn').addEventListener('click', async () => {
  const ok = confirm('Are you sure you want to delete this photo? This cannot be undone.');
  if (!ok) return;

  try {
    await deletePhoto(photo.id);   // ✅ existing function
    viewer.remove();               // close viewer
    app?.showNotification?.('🗑️ Photo deleted.', 'success');
  } catch (err) {
    console.error(err);
    app?.showNotification?.('⚠️ Could not delete photo.', 'error');
  }
    });

  // ✅ Download handler (works for dataURL and blob/object URLs)
  viewer.querySelector('#downloadBtn').addEventListener('click', async () => {
    try {
      const src = photo.photo; // could be dataURL or blob URL

      // If it's a dataURL, we can download directly
      if (typeof src === 'string' && src.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = src;
        a.download = `ramadan-quest-day-${photo.questDay}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Otherwise fetch -> blob -> objectURL download
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ramadan-quest-day-${photo.questDay}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      app?.showNotification?.('⚠️ Download failed. Try again.', 'error');
    }
  });

  // Close
  viewer.querySelector('#closeBtn').addEventListener('click', () => {
    viewer.remove();
  });

  // Optional: close when clicking outside image
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) viewer.remove();
  });
}

window.viewPhotoById = async function (id) {
  const photos = await getQuestPhotos();
  const photo = photos.find(p => p.id === id);
  if (!photo) return;

  const viewer = document.createElement('div');
  viewer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const safeTitle = (photo.questTitle || `day-${photo.questDay}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const filename = `ramadan-quest-day-${photo.questDay}-${safeTitle}.jpg`;

  // ---------- Download ----------
  const handleDownload = async () => {
    try {
      const res = await fetch(photo.photo);
      const blob = await res.blob();

      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      app?.showNotification?.('⚠️ Could not download image.', 'error');
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    const ok = confirm('Delete this photo? This action cannot be undone.');
    if (!ok) return;

    try {
      await deletePhoto(photo.id);   // ✅ existing function
      viewer.remove();
      app?.showNotification?.('🗑️ Photo deleted successfully.', 'success');
    } catch (e) {
      console.error(e);
      app?.showNotification?.('⚠️ Could not delete photo.', 'error');
    }
  };

  viewer.innerHTML = `
    <div style="color: white; text-align: center; margin-bottom: 20px;">
      <h3>Day ${photo.questDay}: ${photo.questTitle}</h3>
      <p style="opacity: 0.7;">${new Date(photo.timestamp).toLocaleDateString()}</p>
    </div>

    <img src="${photo.photo}" style="max-width: 90%; max-height: 70vh; border-radius: 12px;">

    <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content:center;">
      <button class="btn btn-primary" id="downloadBtn">
        <i class="fas fa-download"></i> Download
      </button>

      <button class="btn btn-danger" id="deleteBtn">
        <i class="fas fa-trash"></i> Delete
      </button>

      <button class="btn btn-secondary" id="closeBtn">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `;

  document.body.appendChild(viewer);

  // Wire buttons
  viewer.querySelector('#downloadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDownload();
  });

  viewer.querySelector('#deleteBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDelete();
  });

  viewer.querySelector('#closeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    viewer.remove();
  });

  // Click outside to close
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) {
      viewer.remove();
    }
  });
};

async function deletePhoto(id) {
  await idbDeletePhoto(id);
  updatePhotoGallery();
}

function openActivityModal(activityType, questDay) {
    const modal = document.getElementById('activityModal');
    const content = document.getElementById('activityContent');
    const day = Number(questDay ?? currentQuestDay ?? 1);
    currentQuestDay = day; 

    switch(activityType) {
        case 'drawing':
            content.innerHTML = createDrawingActivity();
            break;
        case 'quiz':
            content.innerHTML = createQuizActivity(day);
            break;
        case 'memory':
            content.innerHTML = createMemoryGame();
            break;
        case 'dua-recorder':
            content.innerHTML = createDuaRecorder();
            break;
        case 'checklist':
            content.innerHTML = createInteractiveChecklist(day);
            break;
        default:
            content.innerHTML = '<p>Activity not found</p>';
    }
    
    modal.classList.add('active');
    
    // Initialize activity
    initializeActivity(activityType);
}

function closeActivityModal() {
    document.getElementById('activityModal').classList.remove('active');
}

// ===== Drawing Canvas Activity =====

let isEraser = false;
let canvas, ctx, isDrawing = false;
let currentColor = '#000000';
let currentSize = 4;

function createDrawingActivity() {
    return `
        <div class="activity-header">
            <h2>🎨 Drawing Activity</h2>
            <p>Draw something beautiful for today's quest!</p>
        </div>
        <div class="drawing-canvas-container">
            <canvas id="drawingCanvas" class="drawing-canvas" width="600" height="400"></canvas>
            <div class="drawing-tools">
                <div class="color-picker">
                    <div class="color-option active" data-color="#000000" style="background: #000000;"></div>
                    <div class="color-option" data-color="#a70c95" style="background: #a70c95; border: 1px solid #ccc;"></div>
                    <div class="color-option" data-color="#FF0000" style="background: #FF0000;"></div>
                    <div class="color-option" data-color="#00FF00" style="background: #00FF00;"></div>
                    <div class="color-option" data-color="#0000FF" style="background: #0000FF;"></div>
                    <div class="color-option" data-color="#FFFF00" style="background: #FFFF00;"></div>
                </div>
                <div class="brush-size">
                    <div class="brush-option" data-size="2">S</div>
                    <div class="brush-option active" data-size="5">M</div>
                    <div class="brush-option" data-size="10">L</div>
                </div>
                <button class="btn btn-secondary" onclick="setEraser(true)">
                    <i class="fas fa-eraser"></i> Eraser
                </button>

                <button class="btn btn-secondary" onclick="clearCanvas()">
                    <i class="fas fa-eraser"></i> Clear
                </button>

            </div>
            <button class="btn btn-primary btn-large" onclick="saveDrawing()">
                <i class="fas fa-check"></i> Save Drawing
            </button>
        </div>
    `;
}

function initializeDrawingCanvas() {
    canvas = document.getElementById('drawingCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.dataset.color;
            isEraser = false;  // disable eraser when color selected
        });
    });
    
    // Brush size
    document.querySelectorAll('.brush-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.brush-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            currentSize = parseInt(this.dataset.size);
            isEraser = false; // disable eraser when size selected
        });
    });
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();

    if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    }

    ctx.lineWidth = currentSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
  ctx.globalCompositeOperation = 'source-over';
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isDrawing) return;

  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
  }

  ctx.lineTo(x, y);
  ctx.stroke();
}

// Clear canvas function
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isEraser = false;
}

// Helper Funtion to convert dataURL to Blob (for saving drawings in IndexedDB)
function dataURLToBlob(dataURL) {
  const [meta, base64] = dataURL.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Helper Function to convert canvas to PNG dataURL with white background (to avoid black bg when saving transparent canvas)
function canvasToWhitePngDataURL(srcCanvas) {
  const out = document.createElement('canvas');
  out.width = srcCanvas.width;
  out.height = srcCanvas.height;

  const octx = out.getContext('2d');

  // Fill white background
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, out.width, out.height);

  // Draw the original canvas on top
  octx.drawImage(srcCanvas, 0, 0);

  return out.toDataURL('image/png');
}

// Save drawing to IndexedDB and update gallery
async function saveDrawing() {
  if (!canvas) return;

  const day = currentQuestForPhoto || app.currentDay;

  const dataURL = canvasToWhitePngDataURL(canvas);
  const blob = dataURLToBlob(dataURL);

  try {
    await idbAddPhoto({
      questDay: day,
      questTitle: questsData[day - 1]?.title || `Day ${day}`,
      timestamp: new Date().toISOString(),
      type: 'drawing',
      photoBlob: blob // IMPORTANT
    });

    closeActivityModal();
    app.showNotification('Drawing saved successfully!', 'success');
    await updatePhotoGallery();
  } catch (e) {
    console.error(e);
    app.showNotification('Could not save drawing.', 'error');
  }
}

// Eraser mode toggle 
function setEraser(value) {
  isEraser = value;
  if (value) {
    currentSize = 15; // Make eraser bigger than brush default (5)
  }
}

// ===== Demo Modal System =====
function openDemoModal() {
    const modal = document.getElementById('demoModal');
    const iframe = document.getElementById('demoIframe');
    if (iframe && !iframe.src) {
        // lazy-load the demo page only when requested
        iframe.src = 'demo-interactive.html';
    }
    if (modal) modal.classList.add('active');
}

function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    const iframe = document.getElementById('demoIframe');
    if (modal) modal.classList.remove('active');
    // Clear iframe src to release memory when closed
    if (iframe) iframe.src = '';
}

// Hook up CTA buttons after DOM load
window.addEventListener('load', () => {
    const openFullBtn = document.getElementById('openDemoFullBtn');
    if (openFullBtn) {
        openFullBtn.addEventListener('click', () => {
            // Redirects the current tab to the new page
            window.location.href = 'demo-interactive.html';
        });
    }
});


// ===== Initialize Activities =====
function initializeActivity(type) {
    setTimeout(() => {
        switch(type) {
            case 'drawing':
                initializeDrawingCanvas();
                break;
            case 'quiz':
                // Quiz is initialized in HTML
                break;
            case 'memory':
                initializeMemoryGame();
                break;
            case 'dua-recorder':
                initializeDuaRecorder();
                renderSavedDuas();
                break;
            case 'checklist':
                initializeChecklist();
                break;
        }
    }, 100);
}

// ===== Quiz Activity =====
function createQuizActivity(questDay) {
    const quizzes = {
      1: {
        question: "In which year was the Quran first compiled into a standardized written text?",
        options: [
          "During Prophet Muhammad's lifetime",
          "Under Caliph Uthman",
          "During the Umayyad era",
          "During the Abbasid era"
        ],
        correct: 1
      },
      2: {
        question: "What is the main pillar of Ramadan?",
        options: [
          "Charity",
          "Fasting",
          "Prayer",
          "Pilgrimage"
        ],
        correct: 1
      },
      3: {
        question: "When do Muslims break their fast?",
        options: [
          "At sunrise",
          "At sunset",
          "At noon",
          "At midnight"
        ],
        correct: 1
      },
      4: {
        question: "Laylatul Qadr is better than how many months?",
        options: [
          "100 months",
          "500 months",
          "1000 months",
          "10,000 months"
        ],
        correct: 2
      },
      5: {
        question: "How many surahs are in the Quran?",
        options: [
          "100",
          "114",
          "130",
          "150"
        ],
        correct: 1
      },
      6: {
        question: "What does 'Ramadan' mean?",
        options: [
          "Month of fasting",
          "Month of heat",
          "Month of charity",
          "Month of prayer"
        ],
        correct: 1
      },
      7: {
        question: "How many pillars of Islam are there?",
        options: [
          "Three",
          "Four",
          "Five",
          "Six"
        ],
        correct: 2
      },
      8: {
        question: "What is Zakat?",
        options: [
          "Prayer",
          "Fasting",
          "Charity",
          "Pilgrimage"
        ],
        correct: 2
      },
      9: {
        question: "When is Eid al-Fitr celebrated?",
        options: [
          "End of Ramadan",
          "Start of Ramadan",
          "Middle of Ramadan",
          "After Hajj"
        ],
        correct: 0
      },
      10: {
        question: "How many times should we pray daily?",
        options: [
          "Three times",
          "Four times",
          "Five times",
          "Six times"
        ],
        correct: 2
      },
      11: {
        question: "What is the Islamic calendar based on?",
        options: [
          "Solar cycle",
          "Lunar cycle",
          "Seasonal changes",
          "Star positions"
        ],
        correct: 1
      },
      12: {
        question: "What is Iftar?",
        options: [
          "Pre-dawn meal",
          "Evening prayer",
          "Breaking the fast meal",
          "Night vigil"
        ],
        correct: 2
      },
      13: {
        question: "Which month is holiest to Muslims?",
        options: [
          "Muharram",
          "Rajab",
          "Ramadan",
          "Dhul-Hijjah"
        ],
        correct: 2
      },
      14: {
        question: "What does Bismillah mean?",
        options: [
          "Praise be to Allah",
          "In the name of Allah",
          "Glory to Allah",
          "Mercy of Allah"
        ],
        correct: 1
      },
      15: {
        question: "How many verses are in the Quran?",
        options: [
          "6200",
          "6236",
          "7000",
          "8000"
        ],
        correct: 1
      },
      16: {
        question: "What is Suhoor?",
        options: [
          "Evening meal",
          "Pre-dawn meal",
          "Afternoon prayer",
          "Night prayer"
        ],
        correct: 1
      },
      17: {
        question: "How many Juz (parts) is the Quran divided into?",
        options: [
          "15",
          "20",
          "25",
          "30"
        ],
        correct: 3
      },
      18: {
        question: "What is Taraweeh?",
        options: [
          "Breaking fast",
          "Special night prayers",
          "Sunrise prayer",
          "Charity giving"
        ],
        correct: 1
      },
      19: {
        question: "How many times is Allah mentioned in the Quran?",
        options: [
          "1000 times",
          "1600 times",
          "2600 times",
          "3000 times"
        ],
        correct: 2
      },
      20: {
        question: "What is the first chapter of the Quran called?",
        options: [
          "Al-Baqarah",
          "Al-Fatiha",
          "Al-Imran",
          "An-Nisa"
        ],
        correct: 1
      },
      21: {
        question: "How many Prophets are mentioned in the Quran?",
        options: [
          "10",
          "20",
          "25",
          "35"
        ],
        correct: 2
      },
      22: {
        question: "What is a Surah?",
        options: [
          "A verse",
          "A chapter",
          "A prayer",
          "A practice"
        ],
        correct: 1
      },
      23: {
        question: "What does 'Dua' mean?",
        options: [
          "Prayer",
          "Supplication",
          "Recitation",
          "Sermon"
        ],
        correct: 1
      },
      24: {
        question: "How many times do we circumambulate the Kaaba?",
        options: [
          "5 times",
          "7 times",
          "10 times",
          "12 times"
        ],
        correct: 1
      },
      25: {
        question: "What is the second pillar of Islam?",
        options: [
          "Zakat",
          "Prayer",
          "Fasting",
          "Hajj"
        ],
        correct: 1
      },
      26: {
        question: "How many Rak‘ahs did the Prophet ﷺ usually pray in night prayer (Qiyam)?",
        options: [
          "8 Rak‘ahs",
          "11 Rak‘ahs",
          "20 Rak‘ahs",
          "36 Rak‘ahs"
        ],
        correct: 1
      },
      27: {
        question: "What is Sadaqah?",
        options: [
          "Mandatory charity",
          "Voluntary charity",
          "Alms tax",
          "Religious tax"
        ],
        correct: 1
      },
      28: {
        question: "When did Prophet Muhammad receive his first revelation?",
        options: [
          "Age 25",
          "Age 35",
          "Age 40",
          "Age 50"
        ],
        correct: 2
      },
      29: {
        question: "What is the significance of the Night of Power?",
        options: [
          "First Ramadan night",
          "Last Ramadan night",
          "Better than 1000 months",
          "Quran revelation night"
        ],
        correct: 2
      },
      30: {
        question: "How many days is Ramadan?",
        options: [
          "25 days",
          "28 days",
          "29-30 days",
          "31 days"
        ],
        correct: 2
      }
    };
    
    const quiz = quizzes[questDay] || quizzes[2];
    
    return `
        <div class="activity-header">
            <h2>📚 Quiz Time!</h2>
            <p>Test your knowledge!</p>
        </div>
        <div class="quiz-container">
            <div class="quiz-question">
                <h3>${quiz.question}</h3>
            </div>
            <div class="quiz-options">
                ${quiz.options.map((option, index) => `
                    <div class="quiz-option" onclick="checkQuizAnswer(${index}, ${quiz.correct})">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </div>
                `).join('')}
            </div>
            <div id="quizFeedback" class="quiz-feedback" style="display: none;"></div>
        </div>
    `;
}

// QUIZ STORAGE + PROGRESS RENDER
function saveQuizResult(day, selected, correct) {
  const key = `quiz_day_${day}`;

  const result = {
    day: Number(day),
    selected: Number(selected),
    correct: Number(correct),
    isCorrect: Number(selected) === Number(correct),
    answeredAt: new Date().toISOString()
  };

  localStorage.setItem(key, JSON.stringify(result));
}

function getQuizResult(day) {
  const key = `quiz_day_${day}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function getAllQuizResults() {
  const results = [];

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("quiz_day_")) continue;

    try {
      const obj = JSON.parse(localStorage.getItem(k));
      if (obj && typeof obj.day === "number") results.push(obj);
    } catch (e) {}
  }

  results.sort((a, b) => a.day - b.day);
  return results;
}

function renderQuizProgress() {
  const results = getAllQuizResults();
  const el = document.getElementById("quizSummaryText");

  if (!el) return;

  if (results.length === 0) {
    el.innerHTML = "🌱 You haven’t tried a quiz yet — give it a go!";
    return;
  }

  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;

  el.innerHTML = `
    ✨ You’ve tried <strong>${total}</strong> quizzes<br>
    🌟 You answered <strong>${correct}</strong> correctly<br>
    💛 Every try helps you learn — keep going!
  `;
}

// Run once when the main page loads
document.addEventListener("DOMContentLoaded", renderQuizProgress);


// QUIZ ANSWER CHECK (UPDATED)
function checkQuizAnswer(selected, correct) {
  const options = document.querySelectorAll(".quiz-option");
  const feedback = document.getElementById("quizFeedback");

  options.forEach((option, index) => {
    option.style.pointerEvents = "none";
    if (index === selected) {
      option.classList.add(selected === correct ? "correct" : "incorrect");
    }
  });

  // ✅ Save user's answer for this day
  // (Make sure currentQuestDay is set when you open the quiz modal)
  saveQuizResult(currentQuestDay, selected, correct);

  // ✅ Update Progress section instantly
  renderQuizProgress();

  feedback.style.display = "block";

  if (selected === correct) {
    feedback.className = "quiz-feedback correct";
    feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Well done!';
    createConfetti();
  } else {
    feedback.className = "quiz-feedback incorrect";
    feedback.innerHTML = '<i class="fas fa-times-circle"></i> Not quite. Try again next time!';
  }
}


// ===== Memory Game Activity =====

let flippedCards = [];
let matchedPairs = 0;

function createMemoryGame() {
  const icons = [
    'fa-moon',
    'fa-star',
    'fa-mosque',
    'fa-book',
    'fa-hands',
    'fa-gem',
    'fa-bolt',
    'fa-medal'
  ];

  // Build deck with stable keys
  const deck = [...icons, ...icons].map((key, idx) => ({
    key, // used for matching
    html: `<i class="fas ${key}" aria-hidden="true"></i>`,
    id: `${key}-${idx}` // unique per card
  }));

  // Proper shuffle (Fisher–Yates)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return `
    <div class="activity-header">
      <h2>🧩 Memory Match</h2>
      <p>Find all the matching pairs!</p>
    </div>

    <div class="memory-game">
      ${deck.map((card, index) => `
        <div class="memory-card"
             data-key="${card.key}"
             data-index="${index}"
             data-id="${card.id}"
             onclick="flipCard(this)">
          <div class="memory-card-back">?</div>
          <div class="memory-card-front">${card.html}</div>
        </div>
      `).join('')}
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <p id="memoryScore">Matches: 0/8</p>
    </div>
  `;
}

function initializeMemoryGame() {
    flippedCards = [];
    matchedPairs = 0;
}

function flipCard(card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const emoji1 = card1.dataset.key;
    const emoji2 = card2.dataset.key;
    
    if (emoji1 === emoji2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        document.getElementById('memoryScore').textContent = `Matches: ${matchedPairs}/8`;
        flippedCards = [];
        
        if (matchedPairs === 8) {
            setTimeout(() => {
                createConfetti();
                app.showNotification('🎉 You won! All pairs matched!', 'success');
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}


// ===============================
// DUA RECORDER (FIXED + IDB SAVE)
// ===============================

let mediaRecorder;
let audioChunks = [];
let lastDuaBlob = null; // ✅ holds the last recorded audio file (Blob)

// --- UI HTML ---
function createDuaRecorder() {
  return `
    <div class="activity-header">
      <h2>🎤 Dua Recorder</h2>
      <p>Record yourself reciting today's dua!</p>
    </div>

    <div class="dua-recorder">
      <button id="recordButton" class="record-button" onclick="toggleRecording()">
        <i class="fas fa-microphone"></i>
      </button>
      <p id="recordStatus">Tap to start recording</p>

      <div id="audioVisualizer" class="audio-visualizer" style="display: none;">
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
        <div class="audio-bar"></div>
      </div>

      <div id="audioPlayback" class="audio-playback" style="display: none;"></div>
    </div>

    <!-- 👇 SAVED DUAS WILL APPEAR HERE -->
    <div id="savedDuas" class="saved-duas"></div>
  `;
}

// --- Check for recording support and initialize UI ---
function initializeDuaRecorder() {
  const status = document.getElementById("recordStatus");
  const btn = document.getElementById("recordButton");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.textContent = "Recording not supported on this device";
    if (btn) btn.disabled = true;
  }
}

// --- Record / Stop ---
async function toggleRecording() {
  const button = document.getElementById("recordButton");
  const status = document.getElementById("recordStatus");
  const visualizer = document.getElementById("audioVisualizer");

  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ✅ Let the browser choose best supported format
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      lastDuaBlob = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // ✅ Use the actual output mimeType if provided
        const mime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunks, { type: mime });

        lastDuaBlob = audioBlob;

        const audioUrl = URL.createObjectURL(audioBlob);
        showAudioPlayback(audioUrl);
      };

      mediaRecorder.start();

      if (button) {
        button.classList.add("recording");
        button.innerHTML = '<i class="fas fa-stop"></i>';
      }
      if (status) status.textContent = "Recording... Tap to stop";
      if (visualizer) visualizer.style.display = "flex";
    } catch (error) {
      console.error(error);
      if (status) status.textContent = "Error: Could not access microphone";
    }
  } else {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());

    if (button) {
      button.classList.remove("recording");
      button.innerHTML = '<i class="fas fa-microphone"></i>';
    }
    if (status) status.textContent = "Recording stopped. You can save it now.";
    if (visualizer) visualizer.style.display = "none";
  }
}

// --- Playback UI ---
function showAudioPlayback(audioUrl) {
  const playback = document.getElementById("audioPlayback");
  if (!playback) return;

  playback.innerHTML = `
    <audio controls src="${audioUrl}"></audio>
    <button class="btn btn-primary" onclick="saveAudioRecording()">
      <i class="fas fa-save"></i> Save Recording
    </button>
  `;
  playback.style.display = "block";
}

// INDEXEDDB (DUA RECORDINGS STORE)
function openDuaDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ramadan_app_db", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("dua_recordings")) {
        db.createObjectStore("dua_recordings", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbAddDuaRecording(record) {
  const db = await openDuaDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("dua_recordings", "readwrite");
    const store = tx.objectStore("dua_recordings");
    const req = store.add(record);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

// --- Save to IndexedDB ---
async function saveAudioRecording() {
  try {
    if (!lastDuaBlob) {
      app?.showNotification?.("Record something first 🙂", "warning");
      return;
    }

    const day = Number(currentQuestDay ?? 0);

    await idbAddDuaRecording({
      questDay: day,
      createdAt: new Date().toISOString(),
      mimeType: lastDuaBlob.type,
      audioBlob: lastDuaBlob
    });

    app?.showNotification?.("🎤 Recording saved!", "success");
    lastDuaBlob = null;

    // ✅ render WHILE modal is still open
    renderSavedDuas();

    // then close
    closeActivityModal();
  } catch (e) {
    console.error("Saving dua failed:", e);
    app?.showNotification?.("Could not save recording. Check console.", "error");
  }
}


// --- Retrieve all recordings (for gallery or listing) ---
async function idbGetAllDuas() {
  const db = await openDuaDB();

  return new Promise((resolve) => {
    const tx = db.transaction("dua_recordings", "readonly");
    const store = tx.objectStore("dua_recordings");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);

    tx.oncomplete = () => db.close();
  });
}

// --- Render saved duas in the activity modal (can be called after saving or in a "My Duas" section) ---
async function renderSavedDuas() {
  const container = document.getElementById("savedDuas");
  if (!container) return;

  const recordings = await idbGetAllDuas();

  // newest first
  recordings.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  if (recordings.length === 0) {
    container.innerHTML = `<p class="text-muted">No saved duas yet 🤍</p>`;
    return;
  }

  container.innerHTML = `
    <h3>🎧 Your Saved Duas</h3>
    ${recordings.map(r => {
      const url = URL.createObjectURL(r.audioBlob);
      const dateText = r.createdAt ? new Date(r.createdAt).toLocaleString() : "";
      const dayText = r.questDay ? `Day ${r.questDay}` : "";

      return `
        <div class="saved-dua-item" style="margin-bottom: 12px;">
          <div class="text-muted" style="margin-bottom: 6px;">
            ${dayText}${dayText && dateText ? " • " : ""}${dateText}
          </div>
          <audio controls src="${url}"></audio>
        </div>
      `;
    }).join("")}
  `;
}



// ===== Interactive Checklist =====

// function createInteractiveChecklist(questDay) {
//     const checklists = {
//         24: [
//             'Read Quran for 10 minutes',
//             'Pray all 5 prayers on time',
//             'Make Dhikr (SubhanAllah 33x)',
//             'Give Sadaqah',
//             'Make Dua for family'
//         ]
//     };
    
//     const items = checklists[questDay] || checklists[24];
    
//     return `
//         <div class="activity-header">
//             <h2>✅ Quest Checklist</h2>
//             <p>Complete all items to finish the quest!</p>
//         </div>
//         <div class="interactive-checklist">
//             ${items.map((item, index) => `
//                 <div class="checklist-item" onclick="toggleChecklistItem(this)">
//                     <div class="checklist-checkbox">
//                         <i class="fas fa-check"></i>
//                     </div>
//                     <span>${item}</span>
//                 </div>
//             `).join('')}
//             <div class="checklist-progress">
//                 <p>Progress: <span id="checklistCount">0</span>/${items.length}</p>
//                 <div class="checklist-progress-bar">
//                     <div id="checklistFill" class="checklist-progress-fill" style="width: 0%;"></div>
//                 </div>
//             </div>
//         </div>
//         <button class="btn btn-primary btn-large" onclick="completeChecklist()" style="margin-top: 20px; width: 100%;">
//             <i class="fas fa-check-circle"></i> Complete Quest
//         </button>
//     `;
// }

// function initializeChecklist() {
//     // Checklist is initialized in HTML
// }

// function toggleChecklistItem(item) {
//     item.classList.toggle('completed');
//     updateChecklistProgress();
// }

// function updateChecklistProgress() {
//     const items = document.querySelectorAll('.checklist-item');
//     const completed = document.querySelectorAll('.checklist-item.completed').length;
//     const total = items.length;
//     const percentage = (completed / total) * 100;
    
//     document.getElementById('checklistCount').textContent = completed;
//     document.getElementById('checklistFill').style.width = percentage + '%';
    
//     if (completed === total) {
//         createConfetti();
//     }
// }

// function completeChecklist() {
//     const completed = document.querySelectorAll('.checklist-item.completed').length;
//     const total = document.querySelectorAll('.checklist-item').length;
    
//     if (completed === total) {
//         closeActivityModal();
//         app.showNotification('✅ All tasks completed! Great job!', 'success');
//     } else {
//         app.showNotification(`Complete all ${total} items first! (${completed}/${total} done)`, 'warning');
//     }
// }


// ✅ CHECKLIST (30 DAYS + PERSISTENCE)

//1) 30 checklists based on questsData 
function getChecklistItemsForDay(questDay) {
  const day = Number(questDay);

  const checklists = {
    1: [
      "Go outside after Maghrib and look for the crescent moon",
      "Ask an adult: “How do we know Ramadan started?”",
      "Say Alhamdulillah for Ramadan being here",
      "Share one Ramadan smile with your family",
      "If you spot the moon, celebrate gently and say Allahu Akbar"
    ],
    2: [
      "Ask a parent: “Why do we fast in Ramadan?”",
      "Tell one person one reason Ramadan is special",
      "Say Bismillah before one meal/snack today",
      "Do one quiet good deed (help without being asked)",
      "Make a short dua: “Ya Allah help me have a good Ramadan”"
    ],
    3: [
      "Make or draw 1 star for your Ramadan chart",
      "Write/draw 1 Ramadan blessing on the star",
      "Decorate your star with colors or stickers",
      "Tell your parent what your blessing means",
      "Hang your star or add it to the crescent display"
    ],
    4: [
      "Choose 1 short surah (Al-Ikhlas / Al-Falaq / An-Nas / Al-Fatiha)",
      "Listen to the surah once",
      "Repeat it after the reciter (even a little)",
      "Ask: “What does this surah teach us?”",
      "Say: “Ya Allah make me love Quran”"
    ],
    5: [
      "Do 1 act of kindness at home",
      "Do 1 act of kindness for a sibling/friend",
      "Do 1 act of kindness for yourself (tidy your space / calm down)",
      "Say something nice to someone today",
      "Thank Allah for one blessing"
    ],
    6: [
      "Choose 1 new dua to learn today",
      "Say it 3 times slowly",
      "Say it once before a real moment (eating/sleeping/etc.)",
      "Teach the dua to someone at home",
      "Record your dua in the Dua Recorder (optional)"
    ],
    7: [
      "Set the table or place dates/water for iftar",
      "Help with 1 small kitchen task",
      "Make a kind thank-you to the cook",
      "Sit together at iftar and make a short dua",
      "Help clean up one item after iftar"
    ],
    8: [
      "Pick 1 salah to pray with your family",
      "Make wudu carefully",
      "Stand in salah with calm body and quiet heart",
      "Say a short dua after salah",
      "Smile and say “JazakAllahu khair” to your family"
    ],
    9: [
      "When you feel upset, do 3 deep breaths",
      "Say “أعوذ بالله من الشيطان الرجيم” once if you feel angry",
      "Choose a calm action (sit / drink water / quiet corner)",
      "Say something gentle instead of shouting",
      "Tell yourself: “I’m learning sabr”"
    ],
    10: [
      "Choose something to share (snack/toy/help)",
      "Give it with a smile",
      "Say: “This is sadaqah” (even a smile is sadaqah!)",
      "Make dua for someone who needs help",
      "Thank Allah for what you have"
    ],
    11: [
      "Say SubhanAllah 10 times",
      "Say Alhamdulillah 10 times",
      "Say Allahu Akbar 10 times",
      "Do dhikr using fingers to count",
      "Make a short dua after dhikr"
    ],
    12: [
      "Ask your parents about Laylatul Qadr",
      "Learn 1 thing: it’s better than 1000 months",
      "Ask: “What can I do on that night?”",
      "Make a small dua list (2–3 duas)",
      "Sleep with a happy intention for the last 10 nights"
    ],
    13: [
      "Think of 1 blessing you love",
      "Write or draw 2 blessings",
      "Write or draw 2 more blessings (total 5)",
      "Tell someone one thing you’re grateful for",
      "Say Alhamdulillah from your heart"
    ],
    14: [
      "Sit with family for Quran time (any amount)",
      "Listen to Quran together for 5 minutes",
      "Repeat one ayah/surah line after the reciter",
      "Make a family dua together",
      "Celebrate halfway with kind words (no pressure)"
    ],
    15: [
      "Tell the truth in one small moment today",
      "If you made a mistake, say it honestly",
      "Return something that isn’t yours (if needed)",
      "Say one honest compliment to someone",
      "Make dua: “Ya Allah make me truthful”"
    ],
    16: [
      "Say something kind to your parents",
      "Say “JazakAllahu khair” at least once",
      "Listen politely when a parent speaks",
      "Help without complaining (even a little)",
      "Make dua for your parents"
    ],
    17: [
      "Tidy 1 corner of your room",
      "Put away toys/clothes in one place",
      "Clean your prayer space (or mat) gently",
      "Throw away trash and wipe a surface",
      "Say: “Cleanliness is part of iman”"
    ],
    18: [
      "If you upset someone, say sorry kindly",
      "If someone upset you, try to forgive",
      "Say: “I forgive you for Allah” (if you can)",
      "Make dua: “Ya Allah forgive me”",
      "Do one kind action to soften the heart"
    ],
    19: [
      "Do 1 household task (dishes/tidy/fold)",
      "Do a second helpful task",
      "Do a third small helpful task",
      "Smile and say: “I’m happy to help”",
      "Make dua for your family"
    ],
    20: [
      "Do one secret good deed (only Allah knows)",
      "Avoid telling people about it",
      "Make a secret dua for someone",
      "Help quietly (tidy a space / fix something small)",
      "Say: “Allah sees me”"
    ],
    21: [
      "Pray Isha with family (or be present for it)",
      "Stay up a little longer for extra worship",
      "Make dua for 2 minutes",
      "Read/listen to Quran for 5 minutes",
      "Say: “Ya Allah accept from us”"
    ],
    22: [
      "Write 3 duas you really want",
      "Add 2 more duas (total 5)",
      "Include a dua for family",
      "Include a dua for forgiveness",
      "Keep your dua list somewhere special"
    ],
    23: [
      "Learn the Laylatul Qadr dua (even part of it)",
      "Say it 3 times",
      "Say it again after salah",
      "Make dua for forgiveness",
      "Do one extra worship act tonight"
    ],
    24: [
      "Read Quran for 10 minutes (or listen)",
      "Pray all 5 prayers on time (try your best)",
      "Make Dhikr (SubhanAllah 33x or any you can)",
      "Give Sadaqah (even small)",
      "Make Dua for your family"
    ],
    25: [
      "Sleep with intention to wake up before Fajr",
      "Wake up and make wudu",
      "Pray 2 rak‘ahs (or join family quietly)",
      "Make dua in the quiet time",
      "Say: “Ya Allah accept my effort”"
    ],
    26: [
      "Choose a country to learn about Ramadan",
      "Watch/read 1 short thing about it",
      "Tell your family one interesting tradition",
      "Say: “We are one Ummah”",
      "Make dua for Muslims around the world"
    ],
    27: [
      "Make a strong intention for worship tonight",
      "Read/listen Quran for 10 minutes",
      "Make dua from your list",
      "Do dhikr softly and calmly",
      "Do one extra good deed (kindness/charity/help)"
    ],
    28: [
      "Share your favorite Ramadan memory",
      "Tell what you learned this month",
      "Thank your family for something",
      "Say Alhamdulillah for completing many quests",
      "Make dua for a beautiful Eid"
    ],
    29: [
      "Do your best worship tonight (no pressure)",
      "Make dua for forgiveness",
      "Make dua for family and friends",
      "Read/listen Quran for 5–10 minutes",
      "Say: “Ya Allah accept from us”"
    ],
    30: [
      "Lay out your Eid clothes",
      "Help decorate or tidy the home",
      "Prepare something small for Eid (card/gift/help)",
      "Thank Allah for reaching the end of Ramadan",
      "Make dua: “Ya Allah let us reach next Ramadan”"
    ]
  };

  return checklists[day] || checklists[24];
}

//2) Persistence (localStorage per day)
function checklistKey(day) {
  return `checklist_day_${Number(day)}`;
}

function loadChecklistState(day, totalItems) {
  try {
    const raw = localStorage.getItem(checklistKey(day));
    if (!raw) return Array(totalItems).fill(false);

    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return Array(totalItems).fill(false);

    return Array.from({ length: totalItems }, (_, i) => Boolean(arr[i]));
  } catch {
    return Array(totalItems).fill(false);
  }
}

function saveChecklistState(day, stateArray) {
  localStorage.setItem(checklistKey(day), JSON.stringify(stateArray));
}

// 3) UI Render 
function createInteractiveChecklist(questDay) {
  const day = Number(questDay);
  const items = getChecklistItemsForDay(day);
  const state = loadChecklistState(day, items.length);

  return `
    <div class="activity-header">
      <h2>✅ Today’s Checklist</h2>
      <p>Take it step by step 🤍</p>
    </div>

    <div class="interactive-checklist" data-day="${day}">
      ${items.map((text, index) => `
        <div class="checklist-item ${state[index] ? "completed" : ""}"
             data-index="${index}"
             onclick="toggleChecklistItem(this)">
          <div class="checklist-checkbox">
            <i class="fas fa-check"></i>
          </div>
          <span>${text}</span>
        </div>
      `).join("")}

      <div class="checklist-progress">
        <p>Progress: <span id="checklistCount">0</span>/${items.length}</p>
        <div class="checklist-progress-bar">
          <div id="checklistFill" class="checklist-progress-fill" style="width: 0%;"></div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary btn-large" onclick="completeChecklist()" style="margin-top: 20px; width: 100%;">
      <i class="fas fa-check-circle"></i> Finish for Today
    </button>
  `;
}

function initializeChecklist() {
  updateChecklistProgress();
}

// 4) Toggle + Progress
function toggleChecklistItem(itemEl) {
  itemEl.classList.toggle("completed");

  const wrapper = document.querySelector(".interactive-checklist");
  if (!wrapper) return;

  const day = Number(wrapper.dataset.day);
  const items = wrapper.querySelectorAll(".checklist-item");
  const state = Array.from(items).map(el => el.classList.contains("completed"));

  saveChecklistState(day, state);
  updateChecklistProgress();
}

function updateChecklistProgress() {
  const wrapper = document.querySelector(".interactive-checklist");
  if (!wrapper) return;

  const items = wrapper.querySelectorAll(".checklist-item");
  const total = items.length;
  const completed = wrapper.querySelectorAll(".checklist-item.completed").length;

  const percentage = total === 0 ? 0 : (completed / total) * 100;

  const countEl = document.getElementById("checklistCount");
  const fillEl = document.getElementById("checklistFill");

  if (countEl) countEl.textContent = completed;
  if (fillEl) fillEl.style.width = percentage + "%";

  if (completed === total && total > 0) {
    createConfetti();
  }
}

// 5) Complete button (encouraging copy)
function completeChecklist() {
  const wrapper = document.querySelector(".interactive-checklist");
  if (!wrapper) return;

  const total = wrapper.querySelectorAll(".checklist-item").length;
  const completed = wrapper.querySelectorAll(".checklist-item.completed").length;

  if (completed === total && total > 0) {
    closeActivityModal();
    app.showNotification("✅ Wonderful effort! You finished today’s checklist 🤍", "success");
  } else {
    const remaining = total - completed;
    app.showNotification(`You’re doing great 🌱 Just ${remaining} more to go! (${completed}/${total})`, "warning");
  }
}


// ===== Initialize on Page Load =====

document.addEventListener('DOMContentLoaded', () => {
  if (typeof app !== 'undefined' && app && app.completeQuest) {
    app.finalizeQuestCompletion = app.completeQuest.bind(app);
  }
  updatePhotoGallery();

});

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openPhotoUploadModal,
        openActivityModal,
        openGalleryModal,
        updatePhotoGallery
    };
}