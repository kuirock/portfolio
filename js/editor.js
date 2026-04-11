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

const propertyPanel = document.getElementById('propertyPanel');
const fontSelect = document.getElementById('fontSelect');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontSizeVal = document.getElementById('fontSizeVal');
const fontWeightSelect = document.getElementById('fontWeightSelect');
const frontBtn = document.getElementById('frontBtn');
const backBtn = document.getElementById('backBtn');
const startPresBtn = document.getElementById('startPresBtn');

function updateUI() {
  slideIndicator.textContent = `Slide ${state.currentSlide + 1} / ${state.slides.length}`;
  renderSlide();

  // Populate Property Panel if element is selected
  if (state.selectedElementId) {
      const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
      if (stateEl) {
          propertyPanel.style.display = 'flex';
          if (stateEl.type === 'text') {
              fontSelect.value = stateEl.fontFamily || "'Courier New', Courier, monospace";
              fontSizeInput.value = stateEl.fontSize || 24;
              if (fontSizeVal) fontSizeVal.textContent = stateEl.fontSize || 24;
              fontWeightSelect.value = stateEl.fontWeight || "normal";
              fontSelect.parentElement.style.display = 'flex';
              fontSizeInput.parentElement.style.display = 'flex';
              fontWeightSelect.parentElement.style.display = 'flex';
          } else {
              fontSelect.parentElement.style.display = 'none';
              fontSizeInput.parentElement.style.display = 'none';
              fontWeightSelect.parentElement.style.display = 'none';
          }
      }
  } else {
      propertyPanel.style.display = 'none';
  }
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

startPresBtn.addEventListener('click', () => {
    saveToLocalStorage(); // Ensure latest is saved
    window.open('viewer.html', '_blank');
});

document.addEventListener('keydown', (e) => {
  // Save shortcut
  if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveToLocalStorage();
      return;
  }
  // Undo shortcut
  if (e.ctrlKey && e.key === 'z') {
    undo();
    return;
  }
  // Delete selected element
  if ((e.key === 'Backspace' || e.key === 'Delete') && state.selectedElementId) {
    // Only delete if we are not actively typing in a contenteditable div
    if (document.activeElement && document.activeElement.contentEditable === "true") {
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
    div.style.zIndex = el.zIndex || 1;

    if (el.type === 'text') {
      const textInner = document.createElement('div');
      textInner.className = 'text-content';
      textInner.textContent = el.content;
      textInner.contentEditable = "false"; // Set to false initially, enable on dblclick
      textInner.style.cursor = "move"; // Explicit cursor
      textInner.dataset.id = el.id; // For input/blur tracking

      div.classList.add('glitch-text'); // Add glitch effect
      if (el.color) div.style.color = el.color;
      if (el.fontFamily) div.style.fontFamily = el.fontFamily;
      if (el.fontSize) div.style.fontSize = `${el.fontSize}px`;
      if (el.fontWeight) div.style.fontWeight = el.fontWeight;
      if (el.width) div.style.width = `${el.width}px`;
      if (el.height) div.style.height = `auto`; // Auto-adjust height based on font/wrap

      // Sync text edits to state
      textInner.addEventListener('input', (e) => {
        const id = e.target.dataset.id;
        const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
        if (stateEl) {
          stateEl.content = e.target.textContent;
        }
      });
      // Save state when finishing edit
      textInner.addEventListener('blur', () => {
          textInner.contentEditable = "false";
          textInner.style.cursor = "move";
          saveState();
      });
      div.appendChild(textInner);
    } else if (el.type === 'shape') {
      div.style.width = `${el.width}px`;
      div.style.height = `${el.height}px`;
      div.style.borderRadius = el.borderRadius || '0';
      if (el.backgroundColor) div.style.backgroundColor = el.backgroundColor;
      if (el.borderColor) div.style.border = `2px solid ${el.borderColor}`;
    } else if (el.type === 'image') {
      div.style.width = `${el.width}px`;
      div.style.height = `${el.height}px`;
      div.style.overflow = "hidden"; // Clip the image within the container
      const img = document.createElement('img');
      img.src = el.src;
      img.style.objectFit = "cover";
      img.style.width = "100%";
      img.style.height = "100%";

      const cropX = el.cropX !== undefined ? el.cropX : 50;
      const cropY = el.cropY !== undefined ? el.cropY : 50;
      img.style.objectPosition = `${cropX}% ${cropY}%`;

      if (el.cropMode) {
          // Visual indicator for crop mode
          div.style.outline = "2px dashed #ff00ff";
      }
      div.appendChild(img);
    }

    if (el.id === state.selectedElementId) {
        div.classList.add('selected');

        // Add resize handles after all internal DOM nodes (like textContent or img) have been created
        ['nw', 'ne', 'sw', 'se'].forEach(corner => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${corner}`;
            handle.dataset.corner = corner;
            div.appendChild(handle);
        });
    }

    slideContainer.appendChild(div);
  });
}

// Double click actions
slideContainer.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('shape')) {
    // Toggle border radius of shapes
    const id = e.target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.borderRadius = stateEl.borderRadius === '50%' ? '0' : '50%';
      updateUI();
    }
  } else if (e.target.classList.contains('text-content')) {
      // Edit text inner wrapper
      e.target.contentEditable = "true";
      e.target.style.cursor = "text";
      e.target.focus();

      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
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
    const stateEl = state.slides[state.currentSlide].find(item => item.id === dragTarget.dataset.id);

    if (stateEl && stateEl.cropMode) {
        // Adjust the object-position (cropX, cropY) instead of moving container
        const dx = e.movementX * -0.5; // Sensitivity multiplier
        const dy = e.movementY * -0.5;

        let newCropX = (stateEl.cropX || 50) + dx;
        let newCropY = (stateEl.cropY || 50) + dy;

        // Clamp between 0 and 100%
        newCropX = Math.max(0, Math.min(100, newCropX));
        newCropY = Math.max(0, Math.min(100, newCropY));

        stateEl.cropX = newCropX;
        stateEl.cropY = newCropY;

        const img = dragTarget.querySelector('img');
        if (img) img.style.objectPosition = `${newCropX}% ${newCropY}%`;
    } else {
        const containerRect = slideContainer.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - offsetX;
        let newY = e.clientY - containerRect.top - offsetY;

        dragTarget.style.left = `${newX}px`;
        dragTarget.style.top = `${newY}px`;
    }
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
    const minWidth = resizeTarget.classList.contains('text') ? 50 : 20;
    const minHeight = resizeTarget.classList.contains('text') ? 30 : 20;

    if (newWidth > minWidth && newHeight > minHeight) {
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


// Property Panel Event Listeners
fontSelect.addEventListener('change', (e) => {
    if (state.selectedElementId) {
        saveState();
        const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
        if (stateEl) stateEl.fontFamily = e.target.value;
        updateUI();
    }
});

fontSizeInput.addEventListener('input', (e) => {
    if (fontSizeVal) fontSizeVal.textContent = e.target.value;
    if (state.selectedElementId) {
        const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
        if (stateEl) stateEl.fontSize = e.target.value;
        updateUI();
    }
});

fontSizeInput.addEventListener('change', (e) => {
    saveState();
});

fontWeightSelect.addEventListener('change', (e) => {
    if (state.selectedElementId) {
        saveState();
        const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
        if (stateEl) stateEl.fontWeight = e.target.value;
        updateUI();
    }
});

frontBtn.addEventListener('click', () => {
    if (state.selectedElementId) {
        saveState();
        const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
        if (stateEl) {
            let maxZ = 0;
            state.slides[state.currentSlide].forEach(el => {
                if (el.zIndex > maxZ) maxZ = el.zIndex;
            });
            stateEl.zIndex = maxZ + 1;
        }
        updateUI();
    }
});

backBtn.addEventListener('click', () => {
    if (state.selectedElementId) {
        saveState();
        const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementId);
        if (stateEl) {
            let minZ = 9999;
            state.slides[state.currentSlide].forEach(el => {
                if (el.zIndex < minZ) minZ = el.zIndex;
            });
            stateEl.zIndex = (minZ === 9999 ? 0 : minZ) - 1;
        }
        updateUI();
    }
});


const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');

exportJsonBtn.addEventListener('click', () => {
    exportStateToJson();
});

importJsonBtn.addEventListener('click', () => {
    importJsonInput.click();
});

importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        importStateFromJson(file);
    }
    e.target.value = ''; // reset
});

document.addEventListener('mouseup', (e) => {
  if (dragTarget || resizeTarget) {
    const target = dragTarget || resizeTarget;
    const id = target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.x = parseFloat(target.style.left);
      stateEl.y = parseFloat(target.style.top);

      // Update dimensions explicitly for all element types
      const computedStyle = getComputedStyle(target);
      stateEl.width = parseFloat(computedStyle.width);
      stateEl.height = parseFloat(computedStyle.height);
    }
    dragTarget = null;
    resizeTarget = null;
    resizeCorner = null;
  }
});
