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
const numBlocks = 30;

for (let i = 0; i < numBlocks; i++) {
  glitchBlocks.push({
    x: Math.random() * canvas.width,
    y: Math.random() > 0.5 ? Math.random() * 50 : canvas.height - Math.random() * 50,
    width: Math.random() * 100 + 20,
    height: Math.random() * 5 + 2,
    speed: Math.random() * 5 + 2,
    opacity: Math.random() * 0.8 + 0.2
  });
}

function drawGlitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00f2ff'; // Cyan

  glitchBlocks.forEach(block => {
    ctx.globalAlpha = block.opacity;
    ctx.fillRect(block.x, block.y, block.width, block.height);

    block.x += block.speed;

    // Sometimes random glitch effect
    if (Math.random() > 0.95) {
      block.y += (Math.random() - 0.5) * 10;
    }

    // Wrap around
    if (block.x > canvas.width) {
      block.x = -block.width;
      block.y = Math.random() > 0.5 ? Math.random() * 50 : canvas.height - Math.random() * 50;
    }
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
    y: 100
  };
  state.slides[state.currentSlide].push(newElement);
  renderSlide();
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
    }

    slideContainer.appendChild(div);
  });
}

// Initial render
updateUI();

// --- Agent 3: Interaction & Drag-and-Drop ---
let dragTarget = null;
let offsetX = 0;
let offsetY = 0;

slideContainer.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('slide-element')) {
    dragTarget = e.target;
    const rect = dragTarget.getBoundingClientRect();
    const containerRect = slideContainer.getBoundingClientRect();

    // Calculate relative offset within the element
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
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

document.addEventListener('mouseup', () => {
  if (dragTarget) {
    const id = dragTarget.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.x = parseFloat(dragTarget.style.left);
      stateEl.y = parseFloat(dragTarget.style.top);
    }
    dragTarget = null;
  }
});
