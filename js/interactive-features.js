// Ramadan Quests - Interactive Features
// Photo Upload, Activities, Gallery, Games
// ==========================================

// ===== Photo Upload System =====

let currentQuestForPhoto = null;
let currentPhotoFile = null;

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

function triggerCamera() {
    document.getElementById('photoInput').click();
}

function triggerGallery() {
    document.getElementById('galleryInput').click();
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

  return photos.map(p => ({
    id: p.id,
    questDay: p.questDay,
    questTitle: p.questTitle,
    timestamp: p.timestamp,
    photo: URL.createObjectURL(p.photoBlob) // view-only URL
  }));
}

async function updatePhotoGallery() {
  const photos = await getQuestPhotos();
    
    // Update stats
    document.getElementById('totalPhotos').textContent = photos.length;
    document.getElementById('questsWithPhotos').textContent = photos.length;
    
    // Update recent photos (last 6)
    const recentPhotos = photos.slice(-6).reverse();
    const recentGrid = document.getElementById('recentPhotos');
    
    if (recentPhotos.length === 0) {
        recentGrid.innerHTML = '<div class="gallery-empty"><i class="fas fa-camera"></i><p>No photos yet! Complete quests and upload proof.</p></div>';
        return;
    }
    
    recentGrid.innerHTML = recentPhotos.map((photo, index) => `
        <div class="gallery-item" onclick="viewPhotoById(${photo.id})">
            <img src="${photo.photo}" alt="${photo.questTitle}">
            <div class="gallery-item-overlay">
                Day ${photo.questDay}
            </div>
        </div>
    `).join('');
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

async function viewPhoto(index) {
    const photos = await getQuestPhotos();
    const photo = photos[index];
    
    // Create full-screen photo viewer
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
    
    viewer.innerHTML = `
        <div style="color: white; text-align: center; margin-bottom: 20px;">
            <h3>Day ${photo.questDay}: ${photo.questTitle}</h3>
            <p style="opacity: 0.7;">${new Date(photo.timestamp).toLocaleDateString()}</p>
        </div>
        <img src="${photo.photo}" style="max-width: 90%; max-height: 70vh; border-radius: 12px;">
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="sharePhoto(${index})">
                <i class="fas fa-share"></i> Share
            </button>
            <button class="btn btn-primary" onclick="downloadPhoto(${index})">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    document.body.appendChild(viewer);
}

async function deletePhoto(id) {
  await idbDeletePhoto(id);
  updatePhotoGallery();
}

function sharePhoto(index) {
    const photos = getQuestPhotos();
    const photo = photos[index];
    
    if (navigator.share) {
        // Use Web Share API if available
        fetch(photo.photo)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `ramadan-quest-day-${photo.questDay}.jpg`, { type: 'image/jpeg' });
                navigator.share({
                    title: `Ramadan Quest - Day ${photo.questDay}`,
                    text: `I completed Day ${photo.questDay}: ${photo.questTitle}!`,
                    files: [file]
                });
            });
    } else {
        app.showNotification('📱 Sharing is not supported on this device', 'info');
    }
}

function downloadPhoto(index) {
    const photos = getQuestPhotos();
    const photo = photos[index];
    
    const link = document.createElement('a');
    link.href = photo.photo;
    link.download = `ramadan-quest-day-${photo.questDay}.jpg`;
    link.click();
    
    app.showNotification('📥 Photo downloaded!', 'success');
}

// ===== Interactive Activities =====

function openActivityModal(activityType, questDay) {
    const modal = document.getElementById('activityModal');
    const content = document.getElementById('activityContent');
    
    switch(activityType) {
        case 'drawing':
            content.innerHTML = createDrawingActivity();
            break;
        case 'quiz':
            content.innerHTML = createQuizActivity(questDay);
            break;
        case 'memory':
            content.innerHTML = createMemoryGame();
            break;
        case 'dua-recorder':
            content.innerHTML = createDuaRecorder();
            break;
        case 'checklist':
            content.innerHTML = createInteractiveChecklist(questDay);
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
                    <div class="color-option" data-color="#00a896" style="background: #00a896;"></div>
                    <div class="color-option" data-color="#f4a259" style="background: #f4a259;"></div>
                    <div class="color-option" data-color="#6a4c93" style="background: #6a4c93;"></div>
                    <div class="color-option" data-color="#e63946" style="background: #e63946;"></div>
                    <div class="color-option" data-color="#06ffa5" style="background: #06ffa5;"></div>
                </div>
                <div class="brush-size">
                    <div class="brush-option" data-size="2">S</div>
                    <div class="brush-option active" data-size="5">M</div>
                    <div class="brush-option" data-size="10">L</div>
                </div>
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

let canvas, ctx, isDrawing = false;
let currentColor = '#000000';
let currentSize = 5;

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
        });
    });
    
    // Brush size
    document.querySelectorAll('.brush-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.brush-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            currentSize = parseInt(this.dataset.size);
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
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
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
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveDrawing() {
    const drawingData = canvas.toDataURL();
    
    // Save as quest photo
    const photos = getQuestPhotos();
    photos.push({
        questDay: currentQuestForPhoto || app.currentDay,
        photo: drawingData,
        timestamp: new Date().toISOString(),
        questTitle: questsData[(currentQuestForPhoto || app.currentDay) - 1].title,
        type: 'drawing'
    });
    
    localStorage.setItem('ramadanQuestPhotos', JSON.stringify(photos));
    
    closeActivityModal();
    app.showNotification('🎨 Drawing saved successfully!', 'success');
    updatePhotoGallery();
}

// ===== Demo Modal (lazy-load iframe) =====
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
        2: {
            question: "When was the Quran first revealed?",
            options: [
                "During Ramadan",
                "During Hajj",
                "During Eid",
                "During Rajab"
            ],
            correct: 0
        },
        12: {
            question: "Laylatul Qadr is better than how many months?",
            options: [
                "100 months",
                "500 months",
                "1000 months",
                "10,000 months"
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

function checkQuizAnswer(selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quizFeedback');
    
    options.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        if (index === correct) {
            option.classList.add('correct');
        } else if (index === selected && selected !== correct) {
            option.classList.add('incorrect');
        }
    });
    
    feedback.style.display = 'block';
    if (selected === correct) {
        feedback.className = 'quiz-feedback correct';
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> Correct! Well done!';
        createConfetti();
    } else {
        feedback.className = 'quiz-feedback incorrect';
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Not quite. Try again next time!';
    }
}

// ===== Memory Match Game =====
function createMemoryGame() {
    const emojis = ['🌙', '⭐', '🕌', '📿', '🤲', '📖', '🌟', '✨'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    return `
        <div class="activity-header">
            <h2>🧩 Memory Match</h2>
            <p>Find all the matching pairs!</p>
        </div>
        <div class="memory-game">
            ${cards.map((emoji, index) => `
                <div class="memory-card" data-emoji="${emoji}" data-index="${index}" onclick="flipCard(this)">
                    <div class="memory-card-back">?</div>
                    <div class="memory-card-front">${emoji}</div>
                </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <p id="memoryScore">Matches: 0/8</p>
        </div>
    `;
}

let flippedCards = [];
let matchedPairs = 0;

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
    const emoji1 = card1.dataset.emoji;
    const emoji2 = card2.dataset.emoji;
    
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

// ===== Dua Recorder =====
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
    `;
}

let mediaRecorder;
let audioChunks = [];

function initializeDuaRecorder() {
    // Check if browser supports audio recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('recordStatus').textContent = 'Recording not supported on this device';
        document.getElementById('recordButton').disabled = true;
    }
}

async function toggleRecording() {
    const button = document.getElementById('recordButton');
    const status = document.getElementById('recordStatus');
    const visualizer = document.getElementById('audioVisualizer');
    
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                showAudioPlayback(audioUrl);
            };
            
            mediaRecorder.start();
            button.classList.add('recording');
            button.innerHTML = '<i class="fas fa-stop"></i>';
            status.textContent = 'Recording... Tap to stop';
            visualizer.style.display = 'flex';
        } catch (error) {
            status.textContent = 'Error: Could not access microphone';
        }
    } else {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        button.classList.remove('recording');
        button.innerHTML = '<i class="fas fa-microphone"></i>';
        status.textContent = 'Recording saved!';
        visualizer.style.display = 'none';
    }
}

function showAudioPlayback(audioUrl) {
    const playback = document.getElementById('audioPlayback');
    playback.innerHTML = `
        <audio controls src="${audioUrl}"></audio>
        <button class="btn btn-primary" onclick="saveAudioRecording('${audioUrl}')">
            <i class="fas fa-save"></i> Save Recording
        </button>
    `;
    playback.style.display = 'block';
}

function saveAudioRecording(audioUrl) {
    app.showNotification('🎤 Recording saved!', 'success');
    closeActivityModal();
}

window.viewPhotoById = async function (id) {
  const photos = await getQuestPhotos();
  const photo = photos.find(p => p.id === id);
  if (!photo) return;

  // Build viewer
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

  // Create download handler
  const handleDownload = async () => {
    try {
      // If photo.photo is an objectURL, this will still work.
      const res = await fetch(photo.photo);
      const blob = await res.blob();

      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
      app?.showNotification?.('⚠️ Could not download image.', 'error');
    }
  };

  viewer.innerHTML = `
    <div style="color: white; text-align: center; margin-bottom: 20px;">
      <h3>Day ${photo.questDay}: ${photo.questTitle}</h3>
      <p style="opacity: 0.7;">${new Date(photo.timestamp).toLocaleDateString()}</p>
    </div>

    <img src="${photo.photo}" style="max-width: 90%; max-height: 70vh; border-radius: 12px;">

    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button class="btn btn-primary" id="downloadBtn">
        <i class="fas fa-download"></i> Download
      </button>
      <button class="btn btn-danger" id="closeBtn">
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

  viewer.querySelector('#closeBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    viewer.remove();
  });

  // Optional: click outside to close
  viewer.addEventListener('click', () => viewer.remove());
};

// ===== Interactive Checklist =====
function createInteractiveChecklist(questDay) {
    const checklists = {
        24: [
            'Read Quran for 10 minutes',
            'Pray all 5 prayers on time',
            'Make Dhikr (SubhanAllah 33x)',
            'Give Sadaqah',
            'Make Dua for family'
        ]
    };
    
    const items = checklists[questDay] || checklists[24];
    
    return `
        <div class="activity-header">
            <h2>✅ Quest Checklist</h2>
            <p>Complete all items to finish the quest!</p>
        </div>
        <div class="interactive-checklist">
            ${items.map((item, index) => `
                <div class="checklist-item" onclick="toggleChecklistItem(this)">
                    <div class="checklist-checkbox">
                        <i class="fas fa-check"></i>
                    </div>
                    <span>${item}</span>
                </div>
            `).join('')}
            <div class="checklist-progress">
                <p>Progress: <span id="checklistCount">0</span>/${items.length}</p>
                <div class="checklist-progress-bar">
                    <div id="checklistFill" class="checklist-progress-fill" style="width: 0%;"></div>
                </div>
            </div>
        </div>
        <button class="btn btn-primary btn-large" onclick="completeChecklist()" style="margin-top: 20px; width: 100%;">
            <i class="fas fa-check-circle"></i> Complete Quest
        </button>
    `;
}

function initializeChecklist() {
    // Checklist is initialized in HTML
}

function toggleChecklistItem(item) {
    item.classList.toggle('completed');
    updateChecklistProgress();
}

function updateChecklistProgress() {
    const items = document.querySelectorAll('.checklist-item');
    const completed = document.querySelectorAll('.checklist-item.completed').length;
    const total = items.length;
    const percentage = (completed / total) * 100;
    
    document.getElementById('checklistCount').textContent = completed;
    document.getElementById('checklistFill').style.width = percentage + '%';
    
    if (completed === total) {
        createConfetti();
    }
}

function completeChecklist() {
    const completed = document.querySelectorAll('.checklist-item.completed').length;
    const total = document.querySelectorAll('.checklist-item').length;
    
    if (completed === total) {
        closeActivityModal();
        app.showNotification('✅ All tasks completed! Great job!', 'success');
    } else {
        app.showNotification(`Complete all ${total} items first! (${completed}/${total} done)`, 'warning');
    }
}

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
  app.finalizeQuestCompletion = app.completeQuest.bind(app);
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