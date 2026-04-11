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
const alignLeftBtn = document.getElementById('alignLeftBtn');
const alignCenterXBtn = document.getElementById('alignCenterXBtn');
const alignRightBtn = document.getElementById('alignRightBtn');
const alignTopBtn = document.getElementById('alignTopBtn');
const alignCenterYBtn = document.getElementById('alignCenterYBtn');
const alignBottomBtn = document.getElementById('alignBottomBtn');

function updateUI() {
  slideIndicator.textContent = `Slide ${state.currentSlide + 1} / ${state.slides.length}`;
  renderSlide();

  // Populate Property Panel if exactly 1 element is selected
  if (state.selectedElementIds.length === 1) {
      const stateEl = state.slides[state.currentSlide].find(item => item.id === state.selectedElementIds[0]);
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
  } else if (state.selectedElementIds.length > 1) {
      // For multiple elements, hide specific properties but allow alignment
      propertyPanel.style.display = 'flex';
      fontSelect.parentElement.style.display = 'none';
      fontSizeInput.parentElement.style.display = 'none';
      fontWeightSelect.parentElement.style.display = 'none';
  } else {
      propertyPanel.style.display = 'none';
  }
}

prevBtn.addEventListener('click', () => {
  if (state.currentSlide > 0) {
    state.currentSlide--;
    state.selectedElementIds = [];
    updateUI();
  }
});

nextBtn.addEventListener('click', () => {
  saveState();
  if (state.currentSlide === state.slides.length - 1) {
    state.slides.push([]); // Create new slide
  }
  state.currentSlide++;
  state.selectedElementIds = [];
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
  state.selectedElementIds = [];
  updateUI();
});

undoBtn.addEventListener('click', undo);

startPresBtn.addEventListener('click', () => {
    saveToLocalStorage(); // Ensure latest is saved
    window.open('viewer.html', '_blank');
});

document.addEventListener('keydown', (e) => {
  // 1. 文字入力中ならカスタムコピペや削除を無視（ブラウザ標準の文字コピペに任せる）
  if (document.activeElement && document.activeElement.contentEditable === "true") {
    return;
  }

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
  if ((e.key === 'Backspace' || e.key === 'Delete') && state.selectedElementIds.length > 0) {
    saveState();
    state.slides[state.currentSlide] = state.slides[state.currentSlide].filter(el => !state.selectedElementIds.includes(el.id));
    state.selectedElementIds = [];
    updateUI();
  }

  // 2. コピー処理 (Ctrl+C または Cmd+C)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (state.selectedElementIds.length > 0) {
      // 選択中の要素を抽出
      const selectedElements = state.slides[state.currentSlide].filter(el => state.selectedElementIds.includes(el.id));
      // 完全なディープコピーでクリップボードに保存
      clipboard = JSON.parse(JSON.stringify(selectedElements));
    }
  }

  // 3. ペースト処理 (Ctrl+V または Cmd+V)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (clipboard.length > 0) {
      saveState(); // UNDOできるように現在の状態を保存

      const newIds = [];
      clipboard.forEach(copiedEl => {
        // ペースト用にもう一度ディープコピー
        const newEl = JSON.parse(JSON.stringify(copiedEl));
        // 絶対に重複しない新しいIDを生成
        newEl.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        // 位置を少しずらす
        newEl.x += 20;
        newEl.y += 20;

        state.slides[state.currentSlide].push(newEl);
        newIds.push(newEl.id);
      });

      // ペーストした要素だけを即座に選択状態にする
      state.selectedElementIds = newIds;

      // Also update clipboard so next paste offsets again
      clipboard = JSON.parse(JSON.stringify(clipboard));
      clipboard.forEach(el => {
          el.x += 20;
          el.y += 20;
      });

      updateUI();
      saveToLocalStorage(); // オートセーブ
    }
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
  state.selectedElementIds = [newElement.id];
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
  state.selectedElementIds = [newElement.id];
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
      state.selectedElementIds = [newElement.id];
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

    if (state.selectedElementIds.includes(el.id)) {
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
document.addEventListener('DOMContentLoaded', updateUI);

// --- Agent 3: Interaction & Drag-and-Drop ---
let dragTarget = null;
let resizeTarget = null;
let resizeCorner = null;
let startRect = null;
let startMouse = null;
let groupDragInitialPositions = [];

// グローバルスコープにクリップボードを用意
let clipboard = [];

slideContainer.addEventListener('mousedown', (e) => {
  // Handle click on slide container background to deselect
  if (e.target === slideContainer) {
    state.selectedElementIds = [];
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
    const id = slideEl.dataset.id;
    if (e.shiftKey) {
        // Toggle selection
        if (state.selectedElementIds.includes(id)) {
            state.selectedElementIds = state.selectedElementIds.filter(i => i !== id);
        } else {
            state.selectedElementIds.push(id);
        }
        updateUI();
    } else {
        // Select only this if not already in selection
        if (!state.selectedElementIds.includes(id)) {
            state.selectedElementIds = [id];
            updateUI();
        }
    }

    // Start drag
    saveState(); // Save state before dragging
    dragTarget = slideEl;
    startMouse = { x: e.clientX, y: e.clientY };

    // Group drag setup
    groupDragInitialPositions = [];
    state.selectedElementIds.forEach(selectedId => {
        const domEl = document.querySelector(`.slide-element[data-id="${selectedId}"]`);
        if (domEl) {
            groupDragInitialPositions.push({
                id: selectedId,
                dom: domEl,
                initialX: parseFloat(domEl.style.left) || 0,
                initialY: parseFloat(domEl.style.top) || 0
            });
        }
    });
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
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;

        if (groupDragInitialPositions.length > 0) {
            groupDragInitialPositions.forEach(pos => {
                pos.dom.style.left = `${pos.initialX + dx}px`;
                pos.dom.style.top = `${pos.initialY + dy}px`;
            });
        }
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
  if (state.selectedElementIds.length > 0) {
    saveState();
    state.slides[state.currentSlide].forEach(el => {
      if (state.selectedElementIds.includes(el.id)) {
        if (el.type === 'text') el.color = e.target.value;
        if (el.type === 'shape') {
            el.backgroundColor = `${e.target.value}33`; // 20% opacity approx
            el.borderColor = e.target.value;
        }
      }
    });
    updateUI();
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
    if (state.selectedElementIds.length > 0) {
        saveState();
        state.slides[state.currentSlide].forEach(el => {
            if (state.selectedElementIds.includes(el.id)) el.fontFamily = e.target.value;
        });
        updateUI();
    }
});

fontSizeInput.addEventListener('input', (e) => {
    if (fontSizeVal) fontSizeVal.textContent = e.target.value;
    if (state.selectedElementIds.length > 0) {
        state.slides[state.currentSlide].forEach(el => {
            if (state.selectedElementIds.includes(el.id)) el.fontSize = e.target.value;
        });
        updateUI();
    }
});

fontSizeInput.addEventListener('change', (e) => {
    saveState();
});

fontWeightSelect.addEventListener('change', (e) => {
    if (state.selectedElementIds.length > 0) {
        saveState();
        state.slides[state.currentSlide].forEach(el => {
            if (state.selectedElementIds.includes(el.id)) el.fontWeight = e.target.value;
        });
        updateUI();
    }
});

frontBtn.addEventListener('click', () => {
    if (state.selectedElementIds.length > 0) {
        saveState();
        let maxZ = 0;
        state.slides[state.currentSlide].forEach(el => {
            if (el.zIndex > maxZ) maxZ = el.zIndex;
        });
        state.slides[state.currentSlide].forEach(el => {
            if (state.selectedElementIds.includes(el.id)) el.zIndex = maxZ + 1;
        });
        updateUI();
    }
});

backBtn.addEventListener('click', () => {
    if (state.selectedElementIds.length > 0) {
        saveState();
        let minZ = 9999;
        state.slides[state.currentSlide].forEach(el => {
            if (el.zIndex < minZ) minZ = el.zIndex;
        });
        state.slides[state.currentSlide].forEach(el => {
            if (state.selectedElementIds.includes(el.id)) el.zIndex = (minZ === 9999 ? 0 : minZ) - 1;
        });
        updateUI();
    }
});

// Alignment Logic
function alignSelectedElement(type) {
    if (state.selectedElementIds.length === 0) return;

    const containerWidth = slideContainer.clientWidth;
    const containerHeight = slideContainer.clientHeight;

    const selectedElements = state.slides[state.currentSlide].filter(item => state.selectedElementIds.includes(item.id));

    if (selectedElements.length === 1) {
        // Align relative to slide container
        const stateEl = selectedElements[0];
        let elWidth = stateEl.width || 50;
        let elHeight = stateEl.height || 30;
        if (stateEl.type === 'text') {
            const domEl = document.querySelector(`.slide-element[data-id="${stateEl.id}"]`);
            if (domEl) {
                const rect = domEl.getBoundingClientRect();
                elWidth = rect.width;
                elHeight = rect.height;
            }
        }

        switch(type) {
            case 'left': stateEl.x = 0; break;
            case 'centerX': stateEl.x = (containerWidth - elWidth) / 2; break;
            case 'right': stateEl.x = containerWidth - elWidth; break;
            case 'top': stateEl.y = 0; break;
            case 'centerY': stateEl.y = (containerHeight - elHeight) / 2; break;
            case 'bottom': stateEl.y = containerHeight - elHeight; break;
        }
    } else {
        // Align relative to group bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // Calculate group bounding box
        selectedElements.forEach(el => {
            let elWidth = el.width || 50;
            let elHeight = el.height || 30;
            if (el.type === 'text') {
                const domEl = document.querySelector(`.slide-element[data-id="${el.id}"]`);
                if (domEl) {
                    const rect = domEl.getBoundingClientRect();
                    elWidth = rect.width;
                    elHeight = rect.height;
                }
            }
            minX = Math.min(minX, el.x);
            minY = Math.min(minY, el.y);
            maxX = Math.max(maxX, el.x + elWidth);
            maxY = Math.max(maxY, el.y + elHeight);
        });

        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;

        selectedElements.forEach(stateEl => {
            let elWidth = stateEl.width || 50;
            let elHeight = stateEl.height || 30;
            if (stateEl.type === 'text') {
                const domEl = document.querySelector(`.slide-element[data-id="${stateEl.id}"]`);
                if (domEl) {
                    elWidth = domEl.getBoundingClientRect().width;
                    elHeight = domEl.getBoundingClientRect().height;
                }
            }

            switch(type) {
                case 'left': stateEl.x = minX; break;
                case 'centerX': stateEl.x = centerX - (elWidth / 2); break;
                case 'right': stateEl.x = maxX - elWidth; break;
                case 'top': stateEl.y = minY; break;
                case 'centerY': stateEl.y = centerY - (elHeight / 2); break;
                case 'bottom': stateEl.y = maxY - elHeight; break;
            }
        });
    }

    saveState();
    updateUI();
}

alignLeftBtn.addEventListener('click', () => alignSelectedElement('left'));
alignCenterXBtn.addEventListener('click', () => alignSelectedElement('centerX'));
alignRightBtn.addEventListener('click', () => alignSelectedElement('right'));
alignTopBtn.addEventListener('click', () => alignSelectedElement('top'));
alignCenterYBtn.addEventListener('click', () => alignSelectedElement('centerY'));
alignBottomBtn.addEventListener('click', () => alignSelectedElement('bottom'));


const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');
const exportHtmlBtn = document.getElementById('exportHtmlBtn');

exportHtmlBtn.addEventListener('click', async () => {
    exportHtmlBtn.textContent = 'Exporting...';
    exportHtmlBtn.disabled = true;

    try {
        const cssFetch = await fetch('css/style.css');
        const cssContent = await cssFetch.text();

        const stateJsFetch = await fetch('js/state.js');
        const stateJsContent = await stateJsFetch.text();

        const bgJsFetch = await fetch('js/background.js');
        const bgJsContent = await bgJsFetch.text();

        const viewerJsFetch = await fetch('js/viewer.js');
        const viewerJsContent = await viewerJsFetch.text();

        const stateJson = JSON.stringify(state);

        const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Presentation</title>
  <style>
${cssContent}
  /* Override for viewer mode: no borders, hide overflow */
  body {
      cursor: none;
  }
  .slide-container {
    border: none;
    box-shadow: none;
  }
  .slide-element {
      cursor: default;
  }
  </style>
</head>
<body>
  <canvas id="glitchCanvas"></canvas>
  <div id="slideContainer" class="slide-container"></div>

  <script>
    window.__INJECTED_STATE__ = ${stateJson};
  </script>
  <script>
${stateJsContent}
  </script>
  <script>
${bgJsContent}
  </script>
  <script>
${viewerJsContent}
  </script>
</body>
</html>`;

        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation_export.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to export HTML", e);
        alert("Failed to export HTML.");
    } finally {
        exportHtmlBtn.textContent = 'Export Single HTML';
        exportHtmlBtn.disabled = false;
    }
});

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
    if (dragTarget && groupDragInitialPositions.length > 0) {
        groupDragInitialPositions.forEach(pos => {
            const stateEl = state.slides[state.currentSlide].find(item => item.id === pos.id);
            if (stateEl) {
                stateEl.x = parseFloat(pos.dom.style.left);
                stateEl.y = parseFloat(pos.dom.style.top);
            }
        });
        saveState();
    } else if (resizeTarget) {
        const id = resizeTarget.dataset.id;
        const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
        if (stateEl) {
          stateEl.x = parseFloat(resizeTarget.style.left);
          stateEl.y = parseFloat(resizeTarget.style.top);

          // Update dimensions explicitly for all element types
          const computedStyle = getComputedStyle(resizeTarget);
          stateEl.width = parseFloat(computedStyle.width);
          stateEl.height = parseFloat(computedStyle.height);

          saveState(); // Ensure state persists after movement/resize
        }
    }

    dragTarget = null;
    resizeTarget = null;
    resizeCorner = null;
    groupDragInitialPositions = [];
  }
});
