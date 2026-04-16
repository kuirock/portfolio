const slideContainer = document.getElementById('slideContainer');
let currentScale = 1;
function resizeContainer() {
  const margin = 20; // 20px padding around container
  const scaleX = window.innerWidth / 1280;
  const scaleY = window.innerHeight / 720;
  currentScale = Math.min(scaleX, scaleY); // Don't scale above 1x to avoid pixelation
  slideContainer.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
}
window.addEventListener('resize', resizeContainer);
resizeContainer();

const slideIndicator = document.getElementById('slideIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addTextBtn = document.getElementById('addTextBtn');
const addShapeBtn = document.getElementById('addShapeBtn');
const imageInput = document.getElementById('imageInput');
const addImageBtn = document.getElementById('addImageBtn');
const insertSlideBtn = document.getElementById('insertSlideBtn');
const delSlideBtn = document.getElementById('delSlideBtn');
const moveSlideLeftBtn = document.getElementById('moveSlideLeftBtn');
const moveSlideRightBtn = document.getElementById('moveSlideRightBtn');
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
const gamingColorGroup = document.getElementById('gamingColorGroup');
const gamingColorCheckbox = document.getElementById('gamingColorCheckbox');
const alignCenterXBtn = document.getElementById('alignCenterXBtn');
const alignRightBtn = document.getElementById('alignRightBtn');
const alignTopBtn = document.getElementById('alignTopBtn');
const alignCenterYBtn = document.getElementById('alignCenterYBtn');
const alignBottomBtn = document.getElementById('alignBottomBtn');
const distributeXBtn = document.getElementById('distributeXBtn');
const distributeYBtn = document.getElementById('distributeYBtn');

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
        gamingColorCheckbox.checked = !!stateEl.isGamingColor;
        fontSelect.parentElement.style.display = 'flex';
        fontSizeInput.parentElement.style.display = 'flex';
        fontWeightSelect.parentElement.style.display = 'flex';
        gamingColorGroup.style.display = 'flex';
      } else {
        fontSelect.parentElement.style.display = 'none';
        fontSizeInput.parentElement.style.display = 'none';
        fontWeightSelect.parentElement.style.display = 'none';
        gamingColorGroup.style.display = 'none';
      }
    }
  } else if (state.selectedElementIds.length > 1) {
    // For multiple elements, hide specific properties but allow alignment
    propertyPanel.style.display = 'flex';
    fontSelect.parentElement.style.display = 'none';
    fontSizeInput.parentElement.style.display = 'none';
    fontWeightSelect.parentElement.style.display = 'none';
    gamingColorGroup.style.display = 'none';
  } else {
    propertyPanel.style.display = 'none';
  }
}

// スナップガイドの要素を管理
let guideLineX, guideLineY;

function drawSnapGuides(x, y) {
  // スナップガイドの要素を管理
  let guideLineX = null;
  let guideLineY = null;

  function drawSnapGuides(x, y) {
    // まだ作られてなかったら作る
    if (!guideLineX) {
      guideLineX = document.createElement('div');
      guideLineX.className = 'snap-guide snap-guide-x';
      guideLineY = document.createElement('div');
      guideLineY.className = 'snap-guide snap-guide-y';
    }

    // ▼▼ ここを追加！ ▼▼
    // updateUI() で画面がリセットされて DOM（HTML）から消えちゃってたら、復活させる！
    if (!guideLineX.parentElement) {
      slideContainer.appendChild(guideLineX);
    }
    if (!guideLineY.parentElement) {
      slideContainer.appendChild(guideLineY);
    }
    // ▲▲ ここまで ▲▲

    if (x !== null) {
      guideLineX.style.display = 'block';
      guideLineX.style.left = `${x}px`;
    } else {
      guideLineX.style.display = 'none';
    }

    if (y !== null) {
      guideLineY.style.display = 'block';
      guideLineY.style.top = `${y}px`;
    } else {
      guideLineY.style.display = 'none';
    }
  }

  function clearSnapGuides() {
    if (guideLineX) guideLineX.style.display = 'none';
    if (guideLineY) guideLineY.style.display = 'none';
  }
}

function clearSnapGuides() {
  if (guideLineX) guideLineX.style.display = 'none';
  if (guideLineY) guideLineY.style.display = 'none';
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

insertSlideBtn.addEventListener('click', () => {
  saveState();
  state.slides.splice(state.currentSlide + 1, 0, []);
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

moveSlideLeftBtn.addEventListener('click', () => {
  if (state.currentSlide > 0) {
    saveState();
    const temp = state.slides[state.currentSlide - 1];
    state.slides[state.currentSlide - 1] = state.slides[state.currentSlide];
    state.slides[state.currentSlide] = temp;
    state.currentSlide--;
    updateUI();
  }
});

moveSlideRightBtn.addEventListener('click', () => {
  if (state.currentSlide < state.slides.length - 1) {
    saveState();
    const temp = state.slides[state.currentSlide + 1];
    state.slides[state.currentSlide + 1] = state.slides[state.currentSlide];
    state.slides[state.currentSlide] = temp;
    state.currentSlide++;
    updateUI();
  }
});

undoBtn.addEventListener('click', undo);

// --- プレゼンモードの魔法 ---
let isPresentationMode = false;

startPresBtn.addEventListener('click', () => {
  isPresentationMode = true;
  state.selectedElementIds = []; // 選択中の枠線を消す
  updateUI();

  // エディタのUI（パネル）を隠す
  document.getElementById('controlPanel').style.display = 'none';
  document.getElementById('propertyPanel').style.display = 'none';

  // スライド枠を透明にして、背景と一体化させる（viewerと同じ見た目！）
  slideContainer.style.border = 'none';
  slideContainer.style.background = 'transparent';
  slideContainer.style.backdropFilter = 'none';
  slideContainer.style.boxShadow = 'none';
  document.body.style.cursor = 'none'; // サイバー感を出すためカーソルを消す

  // 今のタブのまま、ブラウザを全画面表示（フルスクリーン）にする！
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
});

// ESCキーを押して全画面が終わった時、エディタに元通り戻す処理
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    isPresentationMode = false;

    // エディタのUIを復活！
    document.getElementById('controlPanel').style.display = 'flex';
    slideContainer.style.border = '1px solid #00f2ff';
    slideContainer.style.background = 'rgba(0, 20, 20, 0.4)';
    slideContainer.style.backdropFilter = 'blur(10px)';
    slideContainer.style.boxShadow = '0 0 15px rgba(0, 242, 255, 0.3)';
    document.body.style.cursor = 'default';

    updateUI();
  }
});

// 画面クリックでスライドを進める処理（プレゼン中だけ有効）
document.addEventListener('click', (e) => {
  if (isPresentationMode) {
    if (state.currentSlide < state.slides.length - 1) {
      state.currentSlide++;
      updateUI();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (isPresentationMode) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      if (state.currentSlide < state.slides.length - 1) { state.currentSlide++; updateUI(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (state.currentSlide > 0) { state.currentSlide--; updateUI(); }
    }
    return; // プレゼン中はこれ以下の処理（削除やコピペ）を無視する！
  }
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
      const selectedElements = state.slides[state.currentSlide].filter(el => state.selectedElementIds.includes(el.id));
      // ▼ ここに「コピーした時のスライド番号」をセット！
      clipboard = {
        elements: JSON.parse(JSON.stringify(selectedElements)),
        sourceSlide: state.currentSlide
      };
    }
  }

  // 3. ペースト処理 (Ctrl+V または Cmd+V)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (clipboard && clipboard.elements && clipboard.elements.length > 0) {
      saveState();

      // コピー元と同じスライドなら 20px ずらす、違うスライドなら 0px（そのまま）
      const offset = (clipboard.sourceSlide === state.currentSlide) ? 20 : 0;

      const newIds = [];
      clipboard.elements.forEach(copiedEl => {
        const newEl = JSON.parse(JSON.stringify(copiedEl));
        newEl.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);

        // ▼ ここで判定したオフセットを足す！
        newEl.x += offset;
        newEl.y += offset;

        state.slides[state.currentSlide].push(newEl);
        newIds.push(newEl.id);
      });

      state.selectedElementIds = newIds;

      // 次にまた同じページで連打した時のために、コピー元データもずらしておく
      if (offset > 0) {
        clipboard.elements.forEach(el => {
          el.x += offset;
          el.y += offset;
        });
      }

      updateUI();
      saveToLocalStorage();
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
      const img = new Image();
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        // ▼▼ プロ仕様：上限を 2048px に引き上げ！ ▼▼
        const MAX_SIZE = 2048;

        if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / targetWidth, MAX_SIZE / targetHeight);
          targetWidth *= ratio;
          targetHeight *= ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // 描画品質を上げる設定
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // ▼▼ 魔法：toDataURL（同期/重い）ではなく toBlob（非同期/軽い）を使う！ ▼▼
        canvas.toBlob((blob) => {
          // 幻のリンク（Blob URL）を生成。これで LocalStorage は 0 バイト！
          const blobUrl = URL.createObjectURL(blob);

          saveState();
          const newElement = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type: 'image',
            src: blobUrl, // 👈 高画質だけど軽い参照リンク
            width: 400, // 最初から少し大きめに配置
            height: 400 * (targetHeight / targetWidth),
            x: 100,
            y: 100,
            cropMode: false
          };
          state.slides[state.currentSlide].push(newElement);
          state.selectedElementIds = [newElement.id];
          updateUI();
        }, 'image/webp', 0.95); // 画質も 95% まで贅沢に上げる！
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
});
// ==========================================
// 魔法の画像一括ダイエットボタン！
// ==========================================
const compressImagesBtn = document.getElementById('compressImagesBtn');

if (compressImagesBtn) {
  compressImagesBtn.addEventListener('click', async () => {
    // ボタンの見た目を「処理中」に変える
    const originalText = compressImagesBtn.textContent;
    compressImagesBtn.textContent = '圧縮中...';
    compressImagesBtn.disabled = true;

    saveState(); // 万が一のためにUNDOできるように保存！

    // Base64画像を再圧縮する関数（WebP / 画質50% / 最大1024px）
    const compressImageBase64 = (base64Str) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          let targetWidth = img.width;
          let targetHeight = img.height;
          const MAX_SIZE = 1024; // 最大1024pxに制限！

          if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
            if (targetWidth > targetHeight) {
              targetHeight *= MAX_SIZE / targetWidth;
              targetWidth = MAX_SIZE;
            } else {
              targetWidth *= MAX_SIZE / targetHeight;
              targetHeight = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // WebP 0.8 に圧縮！
          canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob)); // 👈 ここも幻のリンク！
          }, 'image/webp', 0.8);
        };
        img.src = base64Str;
      });
    };

    let count = 0;
    // 全スライドの中にある「画像」を探し出して上書きするループ
    for (let i = 0; i < state.slides.length; i++) {
      for (let j = 0; j < state.slides[i].length; j++) {
        const el = state.slides[i][j];
        if (el.type === 'image') {
          el.src = await compressImageBase64(el.src);
          count++;
        }
      }
    }

    updateUI(); // 画面を更新
    saveToLocalStorage(); // 軽くなったデータを保存！

    // 終わったらボタンの文字で教えてあげる
    compressImagesBtn.textContent = `完了! (${count}枚)`;
    setTimeout(() => {
      compressImagesBtn.textContent = originalText;
      compressImagesBtn.disabled = false;
    }, 2000);
  });
}
// ==========================================

function renderSlide() {
  slideContainer.innerHTML = '';
  const currentElements = state.slides[state.currentSlide];

  currentElements.forEach(el => {
    // 1280x720の画面に対して、上下左右に500pxの余裕を持たせた範囲だけを描画する
    const elWidth = el.width || 200;
    const elHeight = el.height || 200;
    const isOffScreen = (el.x + elWidth < -500) || (el.x > 1780) || (el.y + elHeight < -500) || (el.y > 1220);

    // 画面外に飛んでいった要素は、HTML（DOM）を作らずにスキップ！これで爆速になる！
    if (isOffScreen) return;
    const div = document.createElement('div');
    div.classList.add('slide-element', el.type);
    div.dataset.id = el.id;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.zIndex = el.zIndex || 1;

    if (el.type === 'text') {
      const textInner = document.createElement('div');
      textInner.className = 'text-content';
      textInner.innerHTML = el.content;
      textInner.contentEditable = "false"; // Set to false initially, enable on dblclick
      textInner.style.cursor = "move"; // Explicit cursor
      textInner.dataset.id = el.id; // For input/blur tracking

      div.classList.add('glitch-text'); // Add glitch effect
      if (el.isGamingColor) {
        textInner.classList.add('gaming-text-fx');
      }

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
          stateEl.content = e.target.innerHTML;
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
      img.loading = "lazy";
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
  if (isPresentationMode) return; // プレゼン中は編集禁止！
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

// Property Panel Dragging
const propertyPanelHeader = document.getElementById('propertyPanelHeader');
let isDraggingPanel = false;
let panelOffsetX = 0;
let panelOffsetY = 0;

propertyPanelHeader.addEventListener('mousedown', (e) => {
  isDraggingPanel = true;
  const rect = propertyPanel.getBoundingClientRect();
  panelOffsetX = e.clientX - rect.left;
  panelOffsetY = e.clientY - rect.top;

  // Switch from right/top to left/top to avoid sizing issues during drag
  propertyPanel.style.right = 'auto';
  propertyPanel.style.left = `${rect.left}px`;
  propertyPanel.style.top = `${rect.top}px`;
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingPanel) {
    propertyPanel.style.left = `${e.clientX - panelOffsetX}px`;
    propertyPanel.style.top = `${e.clientY - panelOffsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDraggingPanel = false;
});

slideContainer.addEventListener('mousedown', (e) => {
  if (isPresentationMode) return; // プレゼン中はドラッグ禁止！
  // Fix text selection drag conflict: prevent drag initialization if clicking inside an actively editable text element
  if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
    return;
  }

  // Handle click on slide container background to deselect
  if (e.target === slideContainer) {
    state.selectedElementIds = [];
    updateUI();
    return;
  }

  if (e.target.classList.contains('resize-handle')) {
    resizeTarget = e.target.parentElement;
    resizeCorner = e.target.dataset.corner;
    // getBoundingClientRect() を使わず、内部の論理値（px）を直接取得
    startRect = {
      width: parseFloat(resizeTarget.style.width) || resizeTarget.offsetWidth,
      height: parseFloat(resizeTarget.style.height) || resizeTarget.offsetHeight,
      left: parseFloat(resizeTarget.style.left) || 0,
      top: parseFloat(resizeTarget.style.top) || 0
    };
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
      // ...(元のcropModeの処理はそのまま残す)
      const dx = e.movementX * -0.5;
      const dy = e.movementY * -0.5;
      let newCropX = Math.max(0, Math.min(100, (stateEl.cropX || 50) + dx));
      let newCropY = Math.max(0, Math.min(100, (stateEl.cropY || 50) + dy));
      stateEl.cropX = newCropX;
      stateEl.cropY = newCropY;
      const img = dragTarget.querySelector('img');
      if (img) img.style.objectPosition = `${newCropX}% ${newCropY}%`;
    } else {
      let dx = (e.clientX - startMouse.x) / currentScale;
      let dy = (e.clientY - startMouse.y) / currentScale;

      if (groupDragInitialPositions.length === 1) { // 単一要素ドラッグ時のみスナップを有効化
        const SNAP_THRESHOLD = 7; // 吸い付く強さ（ピクセル）
        const pos = groupDragInitialPositions[0];

        let newX = pos.initialX + dx;
        let newY = pos.initialY + dy;
        const elWidth = dragTarget.offsetWidth;
        const elHeight = dragTarget.offsetHeight;

        // ▼▼ 1. スナップ候補の座標を集める ▼▼
        const targetXs = [0, 1280 / 2, 1280]; // 画面の左、中央、右
        const targetYs = [0, 720 / 2, 720];   // 画面の上、中央、下

        // 他の要素の座標も候補に追加
        state.slides[state.currentSlide].forEach(otherEl => {
          if (otherEl.id !== pos.id) {
            const oW = otherEl.width || 100;
            const oH = otherEl.height || 100;
            targetXs.push(otherEl.x, otherEl.x + oW / 2, otherEl.x + oW);
            targetYs.push(otherEl.y, otherEl.y + oH / 2, otherEl.y + oH);
          }
        });

        // ▼▼ 2. 吸い付き（スナップ）判定 ▼▼
        let snappedX = null;
        let snappedY = null;

        // X軸のスナップ（左端、中央、右端を判定）
        for (let tx of targetXs) {
          if (Math.abs(newX - tx) < SNAP_THRESHOLD) { newX = tx; snappedX = tx; break; }
          if (Math.abs((newX + elWidth / 2) - tx) < SNAP_THRESHOLD) { newX = tx - elWidth / 2; snappedX = tx; break; }
          if (Math.abs((newX + elWidth) - tx) < SNAP_THRESHOLD) { newX = tx - elWidth; snappedX = tx; break; }
        }

        // Y軸のスナップ
        for (let ty of targetYs) {
          if (Math.abs(newY - ty) < SNAP_THRESHOLD) { newY = ty; snappedY = ty; break; }
          if (Math.abs((newY + elHeight / 2) - ty) < SNAP_THRESHOLD) { newY = ty - elHeight / 2; snappedY = ty; break; }
          if (Math.abs((newY + elHeight) - ty) < SNAP_THRESHOLD) { newY = ty - elHeight; snappedY = ty; break; }
        }

        // ▼▼ 3. ガイド線の描画 ▼▼
        drawSnapGuides(snappedX, snappedY);

        // スナップした結果を実際に適用
        pos.dom.style.left = `${newX}px`;
        pos.dom.style.top = `${newY}px`;

      } else if (groupDragInitialPositions.length > 1) {
        // 複数選択時はスナップさせずそのまま移動
        groupDragInitialPositions.forEach(pos => {
          pos.dom.style.left = `${pos.initialX + dx}px`;
          pos.dom.style.top = `${pos.initialY + dy}px`;
        });
        clearSnapGuides();
      }
    }
  } else if (resizeTarget) {
    const dx = (e.clientX - startMouse.x) / currentScale;
    const dy = (e.clientY - startMouse.y) / currentScale;

    let newWidth = startRect.width;
    let newHeight = startRect.height;
    let newLeft = startRect.left;
    let newTop = startRect.top;

    // まず普通にマウスの移動量からサイズと位置を計算
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

    // ▼▼ ここからリサイズ用のスナップ（吸い付き）ロジック！ ▼▼
    const SNAP_THRESHOLD = 15;
    const targetXs = [0, 1280 / 2, 1280];
    const targetYs = [0, 720 / 2, 720];

    // 他の要素の座標を集める
    state.slides[state.currentSlide].forEach(otherEl => {
      if (otherEl.id !== resizeTarget.dataset.id) {
        const oW = otherEl.width || 100;
        const oH = otherEl.height || 100;
        targetXs.push(otherEl.x, otherEl.x + oW / 2, otherEl.x + oW);
        targetYs.push(otherEl.y, otherEl.y + oH / 2, otherEl.y + oH);
      }
    });

    let snappedX = null;
    let snappedY = null;

    // 【X軸のスナップ】右辺（e）を引っ張っているか、左辺（w）を引っ張っているかで判定を変える！
    if (resizeCorner.includes('e')) {
      let currentRight = newLeft + newWidth;
      for (let tx of targetXs) {
        if (Math.abs(currentRight - tx) < SNAP_THRESHOLD) {
          newWidth = tx - newLeft; // 右辺が吸い付いた分、幅を調整
          snappedX = tx;
          break;
        }
      }
    } else if (resizeCorner.includes('w')) {
      for (let tx of targetXs) {
        if (Math.abs(newLeft - tx) < SNAP_THRESHOLD) {
          newWidth = (startRect.left + startRect.width) - tx; // 右辺は固定で、左辺が吸い付いた分幅を調整
          newLeft = tx;
          snappedX = tx;
          break;
        }
      }
    }

    // 【Y軸のスナップ】下辺（s）を引っ張っているか、上辺（n）を引っ張っているかで判定を変える！
    if (resizeCorner.includes('s')) {
      let currentBottom = newTop + newHeight;
      for (let ty of targetYs) {
        if (Math.abs(currentBottom - ty) < SNAP_THRESHOLD) {
          newHeight = ty - newTop; // 下辺が吸い付いた分、高さを調整
          snappedY = ty;
          break;
        }
      }
    } else if (resizeCorner.includes('n')) {
      for (let ty of targetYs) {
        if (Math.abs(newTop - ty) < SNAP_THRESHOLD) {
          newHeight = (startRect.top + startRect.height) - ty; // 下辺は固定で、上辺が吸い付いた分高さを調整
          newTop = ty;
          snappedY = ty;
          break;
        }
      }
    }

    // ガイド線を引く！
    drawSnapGuides(snappedX, snappedY);

    // Enforce minimum size
    const minWidth = resizeTarget.classList.contains('text') ? 50 : 5;
    const minHeight = resizeTarget.classList.contains('text') ? 30 : 5;

    if (newWidth > minWidth && newHeight > minHeight) {
      resizeTarget.style.width = `${newWidth}px`;
      resizeTarget.style.height = `${newHeight}px`;
      // 親コンテナからの相対位置を計算する必要がないため、そのまま適用
      resizeTarget.style.left = `${newLeft}px`;
      resizeTarget.style.top = `${newTop}px`;
    }
  }
});

colorPicker.addEventListener('change', (e) => {
  saveState();
  if (applyRichTextCommand('foreColor', e.target.value)) return;

  if (state.selectedElementIds.length > 0) {
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
function applyRichTextCommand(command, value = null) {
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === 3) commonAncestor = commonAncestor.parentNode; // Get element if text node

    // Ensure we are inside a contenteditable text element
    if (commonAncestor.isContentEditable || commonAncestor.closest('.text-content[contenteditable="true"]')) {
      document.execCommand(command, false, value);

      // Sync the updated innerHTML back to state
      const textContentEl = commonAncestor.closest('.text-content');
      if (textContentEl) {
        const id = textContentEl.dataset.id;
        const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
        if (stateEl) {
          stateEl.content = textContentEl.innerHTML;
        }
      }
      return true; // Command was applied
    }
  }
  return false; // Command was not applied to rich text
}

fontSelect.addEventListener('change', (e) => {
  saveState();
  if (applyRichTextCommand('fontName', e.target.value)) return;

  if (state.selectedElementIds.length > 0) {
    state.slides[state.currentSlide].forEach(el => {
      if (state.selectedElementIds.includes(el.id)) el.fontFamily = e.target.value;
    });
    updateUI();
  }
});

fontSizeInput.addEventListener('input', (e) => {
  if (fontSizeVal) fontSizeVal.textContent = e.target.value;

  // Instead of execCommand 'fontSize' which only supports 1-7, we apply a span with styling if editing text
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    let commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === 3) commonAncestor = commonAncestor.parentNode;

    if (commonAncestor.isContentEditable || commonAncestor.closest('.text-content[contenteditable="true"]')) {
      document.execCommand('fontSize', false, "7"); // Apply arbitrary large size
      const textContentEl = commonAncestor.closest('.text-content');
      // Replace the injected font size 7 with our pixel size
      const elements = textContentEl.querySelectorAll('font[size="7"]');
      elements.forEach(fontEl => {
        fontEl.removeAttribute('size');
        fontEl.style.fontSize = `${e.target.value}px`;
      });

      const id = textContentEl.dataset.id;
      const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
      if (stateEl) {
        stateEl.content = textContentEl.innerHTML;
      }
      return; // Skip global update
    }
  }

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
  saveState();
  // For rich text, if bold is selected, we run 'bold' command
  const isBold = e.target.value === 'bold';

  const sel = window.getSelection();
  if (sel.rangeCount > 0 && !sel.isCollapsed) {
    let commonAncestor = sel.getRangeAt(0).commonAncestorContainer;
    if (commonAncestor.nodeType === 3) commonAncestor = commonAncestor.parentNode;
    if (commonAncestor.isContentEditable || commonAncestor.closest('.text-content[contenteditable="true"]')) {
      // Document.execCommand('bold') toggles it, but we have an explicit normal/bold dropdown
      // To force it, we wrap it manually or rely on toggle. Here we rely on toggle if it doesn't match state
      document.execCommand('bold', false, null);

      const textContentEl = commonAncestor.closest('.text-content');
      if (textContentEl) {
        const id = textContentEl.dataset.id;
        const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
        if (stateEl) stateEl.content = textContentEl.innerHTML;
      }
      return;
    }
  }

  if (state.selectedElementIds.length > 0) {
    state.slides[state.currentSlide].forEach(el => {
      if (state.selectedElementIds.includes(el.id)) el.fontWeight = e.target.value;
    });
    updateUI();
  }
});

gamingColorCheckbox.addEventListener('change', (e) => {
  if (state.selectedElementIds.length > 0) {
    saveState();
    state.slides[state.currentSlide].forEach(el => {
      if (state.selectedElementIds.includes(el.id) && el.type === 'text') {
        el.isGamingColor = e.target.checked;
      }
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

    switch (type) {
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

      switch (type) {
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

function distributeSelectedElements(axis) {
  if (state.selectedElementIds.length < 3) return;

  let selectedElements = state.slides[state.currentSlide].filter(item => state.selectedElementIds.includes(item.id));

  // Sort elements by coordinate
  selectedElements.sort((a, b) => a[axis] - b[axis]);

  const first = selectedElements[0];
  const last = selectedElements[selectedElements.length - 1];

  let firstSpan = (axis === 'x') ? (first.width || 50) : (first.height || 30);
  let lastSpan = (axis === 'x') ? (last.width || 50) : (last.height || 30);

  // Accurate calculation using DOM width/height for text
  const getSpan = (el) => {
    let span = (axis === 'x') ? (el.width || 50) : (el.height || 30);
    if (el.type === 'text') {
      const domEl = document.querySelector(`.slide-element[data-id="${el.id}"]`);
      if (domEl) {
        const rect = domEl.getBoundingClientRect();
        span = (axis === 'x') ? rect.width : rect.height;
      }
    }
    return span;
  };

  firstSpan = getSpan(first);
  lastSpan = getSpan(last);

  const totalDistance = (last[axis] + lastSpan) - first[axis];

  let totalSpanOfElements = 0;
  selectedElements.forEach(el => totalSpanOfElements += getSpan(el));

  const totalGapSpace = totalDistance - totalSpanOfElements;
  const gap = totalGapSpace / (selectedElements.length - 1);

  let currentPos = first[axis];
  selectedElements.forEach((el, index) => {
    el[axis] = currentPos;
    currentPos += getSpan(el) + gap;
  });

  saveState();
  updateUI();
}

distributeXBtn.addEventListener('click', () => distributeSelectedElements('x'));
distributeYBtn.addEventListener('click', () => distributeSelectedElements('y'));


const exportJsonBtn = document.getElementById('exportJsonBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');
const exportHtmlBtn = document.getElementById('exportHtmlBtn');

exportHtmlBtn.addEventListener('click', async () => {
  exportHtmlBtn.textContent = 'Exporting...';
  exportHtmlBtn.disabled = true;

  try {
    // ▼▼ 魔法：書き出す直前に Base64 に焼き直す！ ▼▼
    const exportState = JSON.parse(JSON.stringify(state)); // コピーを作る
    for (let i = 0; i < exportState.slides.length; i++) {
      for (let j = 0; j < exportState.slides[i].length; j++) {
        const el = exportState.slides[i][j];
        if (el.type === 'image' && el.src.startsWith('blob:')) {
          // 幻のリンクからデータを吸い出してBase64に変換！
          const res = await fetch(el.src);
          const blob = await res.blob();
          el.src = await new Promise(r => {
            const reader = new FileReader();
            reader.onloadend = () => r(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      }
    }
    const stateJson = JSON.stringify(exportState); // 焼き直したデータを文字にする！
    const cssContent = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { margin: 0; overflow: hidden; background-color: #050505; font-family: 'Courier New', Courier, monospace; color: #00f2ff; }
#glitchCanvas { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; }
.slide-container { position: absolute; top: 50%; left: 50%; transform-origin: center center; transform: translate(-50%, -50%) scale(1); width: 1280px; height: 720px; background: rgba(0, 20, 20, 0.4); backdrop-filter: blur(10px); border: 1px solid #00f2ff; box-shadow: 0 0 15px rgba(0, 242, 255, 0.3); overflow: hidden; z-index: 1; }
.slide-element { position: absolute; user-select: none; }
.slide-element img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.slide-element.image { border: 1px solid #00f2ff; }
.slide-element.text { font-size: 24px; min-width: 50px; min-height: 30px; padding: 5px; outline: none; border: 1px dashed transparent; display: flex; }
.text-content { width: 100%; height: auto; white-space: pre-wrap; word-wrap: break-word; outline: none; }
.glitch-text { animation: textGlitch 1.5s infinite linear; }
@keyframes textGlitch {
  0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, 100% { text-shadow: none; transform: translate(0, 0); }
  5%, 55% { text-shadow: 5px 0 0 #ff0000, -5px 0 0 #0000ff; transform: translate(-3px, 0); }
  15%, 65% { text-shadow: -4px 0 0 #ff0000, 4px 0 0 #0000ff; transform: translate(3px, 0); }
  25%, 75% { text-shadow: 3px 0 0 #ff0000, -3px 0 0 #0000ff; transform: translate(-1px, 2px); }
  35%, 85% { text-shadow: -6px 0 0 #ff0000, 6px 0 0 #0000ff; transform: translate(2px, -2px); }
  45%, 95% { text-shadow: 2px 0 0 #ff0000, -2px 0 0 #0000ff; transform: translate(-2px, 0); }
}
.gaming-text-fx { background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000); background-size: 400%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gamingColor 3s linear infinite; }
@keyframes gamingColor { 0% { background-position: 0%; } 100% { background-position: 400%; } }
.slide-element.shape { background-color: rgba(0, 242, 255, 0.2); border: 2px solid #00f2ff; position: absolute; overflow: hidden; animation: shapeGlitch 4s infinite; }
@keyframes shapeGlitch { 0% { opacity: 1; transform: translate(0, 0); } 2% { opacity: 0.8; transform: translate(-2px, 1px); background-color: rgba(0, 242, 255, 0.4); } 4% { opacity: 1; transform: translate(2px, -1px); } 6% { opacity: 0.9; transform: translate(0, 0); background-color: rgba(0, 242, 255, 0.2); } 45% { opacity: 1; transform: translate(0, 0); } 46% { opacity: 0.7; transform: translate(1px, 2px); } 48% { opacity: 1; transform: translate(-1px, -2px); } 50% { opacity: 1; transform: translate(0, 0); } 100% { opacity: 1; transform: translate(0, 0); } }
.slide-element.shape::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px); pointer-events: none; z-index: 1; }
`;

    const stateJsContent = `
let state = { currentSlide: 0, selectedElementIds: [], slides: [ [] ] };
const savedState = window.__INJECTED_STATE__ ? JSON.stringify(window.__INJECTED_STATE__) : localStorage.getItem('cyberpunk_state');
if (savedState) {
    try {
        const parsedState = JSON.parse(savedState);
        parsedState.selectedElementIds = [];
        state = parsedState;
    } catch (e) { console.error(e); }
}
`;

    const bgJsContent = `
const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const glitchBlocks = [];
const numBlocks = 150;
function initGlitchBlocks() {
    glitchBlocks.length = 0;
    for (let i = 0; i < numBlocks; i++) {
      const size = Math.random() * 15 + 2;
      const edge = Math.floor(Math.random() * 4);
      let baseX = 0, baseY = 0;
      const edgeOffset = (Math.random() - 0.5) * 80;
      if (edge === 0) { baseX = Math.random() * canvas.width; baseY = 20 + edgeOffset; }
      else if (edge === 1) { baseX = Math.random() * canvas.width; baseY = canvas.height - 20 + edgeOffset; }
      else if (edge === 2) { baseX = 20 + edgeOffset; baseY = Math.random() * canvas.height; }
      else if (edge === 3) { baseX = canvas.width - 20 + edgeOffset; baseY = Math.random() * canvas.height; }
      glitchBlocks.push({ baseX, baseY, edge, width: size, height: size, baseOpacity: Math.random() * 0.8 + 0.2 });
    }
}
initGlitchBlocks();
window.addEventListener('resize', initGlitchBlocks);
function drawGlitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const time = Date.now();
  const tMod = time % 1200;
  const ecgSpike = Math.exp(-Math.pow(tMod - 600, 2) / 800) * 1.5;
  const jitterSpike = (Math.random() > 0.98) ? Math.random() * 2 : 0;
  const globalPulse = ecgSpike + jitterSpike;
  glitchBlocks.forEach(block => {
    let posOnEdge = (block.edge === 0 || block.edge === 1) ? block.baseX / canvas.width : block.baseY / canvas.height;
    const hue = (posOnEdge * 360 + time / 20) % 360;
    ctx.fillStyle = \`hsl(\${hue}, 70%, 50%)\`;
    ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
    const wave1 = Math.sin(posOnEdge * 50 + time / 150);
    const wave2 = Math.sin(posOnEdge * 20 - time / 220);
    const localNoise = Math.max(0, (wave1 + wave2) / 2);
    const combinedPulse = Math.max(0, localNoise * 0.5 + globalPulse);
    let spikeMultiplier = (Math.random() > 0.99) ? Math.random() * 2 + 1.5 : 1;
    let currentOpacity = (Math.random() > 0.8) ? Math.random() * 0.8 : block.baseOpacity;
    ctx.globalAlpha = Math.min(1.0, (currentOpacity + combinedPulse * 0.5) * spikeMultiplier);
    let offsetX = (Math.random() - 0.5) * 10 * spikeMultiplier;
    let offsetY = (Math.random() - 0.5) * 10 * spikeMultiplier;
    const scale = 1 + combinedPulse * 1.5 * spikeMultiplier;
    const drawWidth = block.width * scale; const drawHeight = block.height * scale;
    ctx.fillRect(block.baseX + offsetX - (drawWidth - block.width)/2, block.baseY + offsetY - (drawHeight - block.height)/2, drawWidth, drawHeight);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1.0; requestAnimationFrame(drawGlitch);
}
drawGlitch();
`;

    const viewerJsContent = `
const slideContainer = document.getElementById('slideContainer');
let currentScale = 1;
function resizeContainer() {
    const margin = 40;
    const scaleX = (window.innerWidth - margin) / 1280;
    const scaleY = (window.innerHeight - margin) / 720;
    currentScale = Math.min(scaleX, scaleY, 1);
    slideContainer.style.transform = \`translate(-50%, -50%) scale(\${currentScale})\`;
}
window.addEventListener('resize', resizeContainer);
resizeContainer();

function updateUI() { renderSlide(); }
function renderSlide() {
  slideContainer.innerHTML = '';
  const currentElements = state.slides[state.currentSlide];
  currentElements.forEach(el => {
    const elWidth = el.width || 200;
    const elHeight = el.height || 200;
    const isOffScreen = (el.x + elWidth < -500) || (el.x > 1780) || (el.y + elHeight < -500) || (el.y > 1220);
    if (isOffScreen) return;
    const div = document.createElement('div');
    div.classList.add('slide-element', el.type);
    div.style.left = \`\${el.x}px\`; div.style.top = \`\${el.y}px\`; div.style.zIndex = el.zIndex || 1;
    if (el.type === 'text') {
      const textInner = document.createElement('div'); textInner.className = 'text-content'; textInner.innerHTML = el.content;
      div.classList.add('glitch-text');
      if (el.isGamingColor) textInner.classList.add('gaming-text-fx');
      if (el.color) div.style.color = el.color;
      if (el.fontFamily) div.style.fontFamily = el.fontFamily;
      if (el.fontSize) div.style.fontSize = \`\${el.fontSize}px\`;
      if (el.fontWeight) div.style.fontWeight = el.fontWeight;
      if (el.width) div.style.width = \`\${el.width}px\`;
      if (el.height) div.style.height = \`auto\`;
      div.appendChild(textInner);
    } else if (el.type === 'shape') {
      div.style.width = \`\${el.width}px\`; div.style.height = \`\${el.height}px\`; div.style.borderRadius = el.borderRadius || '0';
      if (el.backgroundColor) div.style.backgroundColor = el.backgroundColor;
      if (el.borderColor) div.style.border = \`2px solid \${el.borderColor}\`;
    } else if (el.type === 'image') {
      div.style.width = \`\${el.width}px\`; div.style.height = \`\${el.height}px\`; div.style.overflow = "hidden";
      const img = document.createElement('img'); img.src = el.src; img.style.objectFit = "cover"; img.style.width = "100%"; img.style.height = "100%";
      const cropX = el.cropX !== undefined ? el.cropX : 50; const cropY = el.cropY !== undefined ? el.cropY : 50;
      img.style.objectPosition = \`\${cropX}% \${cropY}%\`; div.appendChild(img);
    }
    slideContainer.appendChild(div);
  });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        if (state.currentSlide < state.slides.length - 1) { state.currentSlide++; updateUI(); }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (state.currentSlide > 0) { state.currentSlide--; updateUI(); }
    }
});
document.addEventListener('click', () => {
    if (state.currentSlide < state.slides.length - 1) { state.currentSlide++; updateUI(); }
});
document.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e=>console.error(e)); }
    else { document.exitFullscreen(); }
});
document.addEventListener('DOMContentLoaded', updateUI);
`;

    const originalStateJson = JSON.stringify(state);

    const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Presentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" rel="stylesheet">
  <style>
${cssContent}
  /* Override for viewer mode: no borders, hide overflow */
  body { cursor: none; }
  .slide-container { border: none; box-shadow: none; background: transparent; backdrop-filter: none;}
  .slide-element { cursor: default; }
  </style>
</head>
<body>
  <canvas id="glitchCanvas"></canvas>
  <div id="slideContainer" class="slide-container"></div>

  <script>
    window.__INJECTED_STATE__ = ${originalStateJson};
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
  clearSnapGuides();
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
