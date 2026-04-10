// --- Agent 1: Canvas Animation ---
const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const glitchBlocks = [];
const numBlocks = 150; // Increased density

for (let i = 0; i < numBlocks; i++) {
  const size = Math.random() * 30 + 5; // Square size
  glitchBlocks.push({
    baseX: Math.random() * canvas.width,
    // Expand border area to 150px
    baseY: Math.random() > 0.5 ? Math.random() * 150 : canvas.height - Math.random() * 150,
    width: size,
    height: size, // Force squares
    baseOpacity: Math.random() * 0.8 + 0.2
  });
}

function drawGlitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00f2ff'; // Cyan

  const time = Date.now();
  // Create a pulsing beat based on a sine wave.
  // Beat roughly every 0.6 seconds (BPM ~100).
  const beat = Math.max(0, Math.sin(time / 200) ** 8);

  glitchBlocks.forEach(block => {
    // Irregular flickering (flicker opacity randomly)
    let currentOpacity = block.baseOpacity;
    if (Math.random() > 0.7) {
      currentOpacity = Math.random();
    }
    // Boost opacity on beat
    ctx.globalAlpha = Math.min(1.0, currentOpacity + beat);

    // Violent jittering (offset position randomly)
    let offsetX = (Math.random() - 0.5) * 15;
    let offsetY = (Math.random() - 0.5) * 10;

    // Random occasional large jump
    if (Math.random() > 0.95) {
        offsetX += (Math.random() - 0.5) * 50;
        offsetY += (Math.random() - 0.5) * 30;
    }

    // Scale up blocks dramatically on beat
    const scale = 1 + beat * 2.5;
    const drawWidth = block.width * scale;
    const drawHeight = block.height * scale;

    ctx.fillRect(block.baseX + offsetX - (drawWidth - block.width)/2,
                 block.baseY + offsetY - (drawHeight - block.height)/2,
                 drawWidth, drawHeight);
  });

  ctx.globalAlpha = 1.0;
  requestAnimationFrame(drawGlitch);
}

// Start loop
drawGlitch();

// --- Agent 2: State Management & UI logic ---
let state = {
  currentSlide: 0,
  slides: [
    [
      { id: Date.now().toString(), type: 'text', content: 'CYBERPUNK_SLIDES_V1.0', x: 250, y: 200 }
    ]
  ]
};

const slideContainer = document.getElementById('slideContainer');
const slideIndicator = document.getElementById('slideIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addTextBtn = document.getElementById('addTextBtn');
const addShapeBtn = document.getElementById('addShapeBtn');
const imageInput = document.getElementById('imageInput');
const addImageBtn = document.getElementById('addImageBtn');

function updateUI() {
  slideIndicator.textContent = `Slide ${state.currentSlide + 1} / ${state.slides.length}`;
  renderSlide();
}

prevBtn.addEventListener('click', () => {
  if (state.currentSlide > 0) {
    state.currentSlide--;
    updateUI();
  }
});

nextBtn.addEventListener('click', () => {
  if (state.currentSlide === state.slides.length - 1) {
    state.slides.push([]); // Create new slide
  }
  state.currentSlide++;
  updateUI();
});

addTextBtn.addEventListener('click', () => {
  const newElement = {
    id: Date.now().toString(),
    type: 'text',
    content: 'NEW_TEXT_BLOCK',
    x: 50,
    y: 50
  };
  state.slides[state.currentSlide].push(newElement);
  renderSlide();
});

addShapeBtn.addEventListener('click', () => {
  const newElement = {
    id: Date.now().toString(),
    type: 'shape',
    width: 100,
    height: 100,
    x: 50,
    y: 100,
    borderRadius: '0'
  };
  state.slides[state.currentSlide].push(newElement);
  renderSlide();
});

addImageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const newElement = {
        id: Date.now().toString(),
        type: 'image',
        src: event.target.result,
        width: 200,
        height: 200,
        x: 100,
        y: 100
      };
      state.slides[state.currentSlide].push(newElement);
      renderSlide();
    };
    reader.readAsDataURL(file);
  }
  e.target.value = ''; // reset
});

function renderSlide() {
  slideContainer.innerHTML = '';
  const currentElements = state.slides[state.currentSlide];

  currentElements.forEach(el => {
    const div = document.createElement('div');
    div.classList.add('slide-element', el.type);
    div.dataset.id = el.id;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;

    if (el.type === 'text') {
      div.textContent = el.content;
      div.contentEditable = "true";
      if (el.width) div.style.width = `${el.width}px`;
      if (el.height) div.style.height = `${el.height}px`;
      // Sync text edits to state
      div.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
        if (stateEl) {
          stateEl.content = e.target.textContent;
        }
      });
    } else if (el.type === 'shape') {
      div.style.width = `${el.width}px`;
      div.style.height = `${el.height}px`;
      div.style.borderRadius = el.borderRadius || '0';
    } else if (el.type === 'image') {
      div.style.width = `${el.width}px`;
      div.style.height = `${el.height}px`;
      const img = document.createElement('img');
      img.src = el.src;
      div.appendChild(img);
    }

    slideContainer.appendChild(div);
  });
}

// Double click to toggle border radius of shapes
slideContainer.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('shape')) {
    const id = e.target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.borderRadius = stateEl.borderRadius === '50%' ? '0' : '50%';
      renderSlide();
    }
  }
});

// Initial render
updateUI();

// --- Agent 3: Interaction & Drag-and-Drop ---
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

slideContainer.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('slide-element')) {
    const rect = e.target.getBoundingClientRect();

    // Detect if interacting with the resize handle (bottom right corner)
    // Approximate a 20x20px hit area in the corner
    const isResizing = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);

    if (!isResizing) {
        dragTarget = e.target;
        // Calculate relative offset within the element
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (dragTarget) {
    const containerRect = slideContainer.getBoundingClientRect();

    // Calculate new position relative to the container
    let newX = e.clientX - containerRect.left - offsetX;
    let newY = e.clientY - containerRect.top - offsetY;

    // Update DOM
    dragTarget.style.left = `${newX}px`;
    dragTarget.style.top = `${newY}px`;
  }
});

document.addEventListener('mouseup', (e) => {
  if (dragTarget) {
    const id = dragTarget.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.x = parseFloat(dragTarget.style.left);
      stateEl.y = parseFloat(dragTarget.style.top);
    }
    dragTarget = null;
  } else if (e.target.classList && e.target.classList.contains('slide-element')) {
    // If we weren't dragging, we might have been resizing
    const id = e.target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
        stateEl.width = parseFloat(getComputedStyle(e.target).width);
        stateEl.height = parseFloat(getComputedStyle(e.target).height);
    }
  }
});
