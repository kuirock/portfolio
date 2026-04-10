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
    baseY: Math.random() * canvas.height, // Cover entire screen
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
  selectedElementId: null,
  slides: [
    [
      { id: Date.now().toString(), type: 'text', content: 'CYBERPUNK_SLIDES_V1.0', x: 250, y: 200 }
    ]
  ]
};
let historyStack = [];

function saveState() {
  historyStack.push(JSON.stringify(state));
  if (historyStack.length > 50) historyStack.shift(); // Limit history to 50
}

function undo() {
  if (historyStack.length > 0) {
    const prevState = historyStack.pop();
    state = JSON.parse(prevState);
    updateUI();
  }
}

// Initial save
saveState();

const slideContainer = document.getElementById('slideContainer');
const slideIndicator = document.getElementById('slideIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addTextBtn = document.getElementById('addTextBtn');
const addShapeBtn = document.getElementById('addShapeBtn');
const imageInput = document.getElementById('imageInput');
const addImageBtn = document.getElementById('addImageBtn');
const delSlideBtn = document.getElementById('delSlideBtn');
const undoBtn = document.getElementById('undoBtn');
const colorPicker = document.getElementById('colorPicker');

function updateUI() {
  slideIndicator.textContent = `Slide ${state.currentSlide + 1} / ${state.slides.length}`;
  renderSlide();
}

prevBtn.addEventListener('click', () => {
  if (state.currentSlide > 0) {
    state.currentSlide--;
    state.selectedElementId = null;
    updateUI();
  }
});

nextBtn.addEventListener('click', () => {
  saveState();
  if (state.currentSlide === state.slides.length - 1) {
    state.slides.push([]); // Create new slide
  }
  state.currentSlide++;
  state.selectedElementId = null;
  updateUI();
});

delSlideBtn.addEventListener('click', () => {
  saveState();
  state.slides.splice(state.currentSlide, 1);
  if (state.slides.length === 0) {
    state.slides.push([]);
  }
  if (state.currentSlide >= state.slides.length) {
    state.currentSlide = Math.max(0, state.slides.length - 1);
  }
  state.selectedElementId = null;
  updateUI();
});

undoBtn.addEventListener('click', undo);

document.addEventListener('keydown', (e) => {
  // Undo shortcut
  if (e.ctrlKey && e.key === 'z') {
    undo();
    return;
  }
  // Delete selected element
  if ((e.key === 'Backspace' || e.key === 'Delete') && state.selectedElementId) {
    // Only delete if we are not actively typing in a contenteditable div
    if (document.activeElement && document.activeElement.isContentEditable) {
        return;
    }
    saveState();
    state.slides[state.currentSlide] = state.slides[state.currentSlide].filter(el => el.id !== state.selectedElementId);
    state.selectedElementId = null;
    updateUI();
  }
});


addTextBtn.addEventListener('click', () => {
  saveState();
  const newElement = {
    id: Date.now().toString(),
    type: 'text',
    content: 'NEW_TEXT_BLOCK',
    x: 50,
    y: 50,
    color: colorPicker.value
  };
  state.slides[state.currentSlide].push(newElement);
  state.selectedElementId = newElement.id;
  updateUI();
});

addShapeBtn.addEventListener('click', () => {
  saveState();
  const newElement = {
    id: Date.now().toString(),
    type: 'shape',
    width: 100,
    height: 100,
    x: 50,
    y: 100,
    borderRadius: '0',
    backgroundColor: 'rgba(0, 242, 255, 0.2)',
    borderColor: colorPicker.value
  };
  state.slides[state.currentSlide].push(newElement);
  state.selectedElementId = newElement.id;
  updateUI();
});

addImageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      saveState();
      const newElement = {
        id: Date.now().toString(),
        type: 'image',
        src: event.target.result,
        width: 200,
        height: 200,
        x: 100,
        y: 100,
        cropMode: false
      };
      state.slides[state.currentSlide].push(newElement);
      state.selectedElementId = newElement.id;
      updateUI();
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

    if (el.id === state.selectedElementId) {
        div.classList.add('selected');

        // Add resize handles
        ['nw', 'ne', 'sw', 'se'].forEach(corner => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${corner}`;
            handle.dataset.corner = corner;
            div.appendChild(handle);
        });
    }

    if (el.type === 'text') {
      div.textContent = el.content;
      div.contentEditable = "true";
      if (el.color) div.style.color = el.color;
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
      if (el.backgroundColor) div.style.backgroundColor = el.backgroundColor;
      if (el.borderColor) div.style.border = `2px solid ${el.borderColor}`;
    } else if (el.type === 'image') {
      div.style.width = `${el.width}px`;
      div.style.height = `${el.height}px`;
      const img = document.createElement('img');
      img.src = el.src;
      if (el.cropMode) img.classList.add('cropped');
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
let resizeTarget = null;
let resizeCorner = null;
let offsetX = 0;
let offsetY = 0;
let startRect = null;
let startMouse = null;

slideContainer.addEventListener('mousedown', (e) => {
  // Handle click on slide container background to deselect
  if (e.target === slideContainer) {
    state.selectedElementId = null;
    updateUI();
    return;
  }

  if (e.target.classList.contains('resize-handle')) {
    e.stopPropagation();
    saveState(); // Save state before resizing
    resizeTarget = e.target.parentElement;
    resizeCorner = e.target.dataset.corner;
    startRect = resizeTarget.getBoundingClientRect();
    startMouse = { x: e.clientX, y: e.clientY };
    return;
  }

  const slideEl = e.target.closest('.slide-element');
  if (slideEl) {
    if (state.selectedElementId !== slideEl.dataset.id) {
        state.selectedElementId = slideEl.dataset.id;
        updateUI();
    }

    // Start drag
    saveState(); // Save state before dragging
    dragTarget = slideEl;
    const rect = dragTarget.getBoundingClientRect();

    // Calculate relative offset within the element
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  }
});

document.addEventListener('mousemove', (e) => {
  if (dragTarget) {
    const containerRect = slideContainer.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - offsetX;
    let newY = e.clientY - containerRect.top - offsetY;

    dragTarget.style.left = `${newX}px`;
    dragTarget.style.top = `${newY}px`;
  } else if (resizeTarget) {
    const dx = e.clientX - startMouse.x;
    const dy = e.clientY - startMouse.y;

    let newWidth = startRect.width;
    let newHeight = startRect.height;
    let newLeft = startRect.left;
    let newTop = startRect.top;

    if (resizeCorner.includes('e')) newWidth = startRect.width + dx;
    if (resizeCorner.includes('s')) newHeight = startRect.height + dy;
    if (resizeCorner.includes('w')) {
        newWidth = startRect.width - dx;
        newLeft = startRect.left + dx;
    }
    if (resizeCorner.includes('n')) {
        newHeight = startRect.height - dy;
        newTop = startRect.top + dy;
    }

    // Enforce minimum size
    if (newWidth > 20 && newHeight > 20) {
        resizeTarget.style.width = `${newWidth}px`;
        resizeTarget.style.height = `${newHeight}px`;

        const containerRect = slideContainer.getBoundingClientRect();
        resizeTarget.style.left = `${newLeft - containerRect.left}px`;
        resizeTarget.style.top = `${newTop - containerRect.top}px`;
    }
  }
});

colorPicker.addEventListener('change', (e) => {
  if (state.selectedElementId) {
    saveState();
    const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
    if (stateEl) {
      if (stateEl.type === 'text') stateEl.color = e.target.value;
      if (stateEl.type === 'shape') {
          stateEl.backgroundColor = `${e.target.value}33`; // 20% opacity approx
          stateEl.borderColor = e.target.value;
      }
      updateUI();
    }
  }
});

const contextMenu = document.getElementById('contextMenu');
const cropOption = document.getElementById('cropOption');
let contextMenuTargetId = null;

slideContainer.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const slideEl = e.target.closest('.slide-element');
  if (slideEl && slideEl.classList.contains('image')) {
      contextMenuTargetId = slideEl.dataset.id;
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
  } else {
      contextMenu.style.display = 'none';
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
      contextMenu.style.display = 'none';
  }
});

cropOption.addEventListener('click', () => {
    if (contextMenuTargetId) {
        saveState();
        const stateEl = state.slides[state.currentSlide].find(item => item.id === contextMenuTargetId);
        if (stateEl && stateEl.type === 'image') {
            stateEl.cropMode = !stateEl.cropMode;
            updateUI();
        }
    }
    contextMenu.style.display = 'none';
});


document.addEventListener('mouseup', (e) => {
  if (dragTarget || resizeTarget) {
    const target = dragTarget || resizeTarget;
    const id = target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.x = parseFloat(target.style.left);
      stateEl.y = parseFloat(target.style.top);
      stateEl.width = parseFloat(target.style.width) || parseFloat(getComputedStyle(target).width);
      stateEl.height = parseFloat(target.style.height) || parseFloat(getComputedStyle(target).height);
    }
    dragTarget = null;
    resizeTarget = null;
    resizeCorner = null;
  }
});
