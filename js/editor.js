const slideContainer = document.getElementById('slideContainer');
let clipboard = null;
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

  const slideToDelete = state.slides[state.currentSlide];
  slideToDelete.forEach(el => {
    if (el.type === 'image' && el.src.startsWith('blob:')) {
      URL.revokeObjectURL(el.src); // 幻のリンクを破棄！
    }
  });

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

startPresBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // 👈 クリックの合図が画面全体に伝わるのをここでブロック！
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

    const elementsToDelete = state.slides[state.currentSlide].filter(el => state.selectedElementIds.includes(el.id));
    elementsToDelete.forEach(el => {
      if (el.type === 'image' && el.src.startsWith('blob:')) {
        URL.revokeObjectURL(el.src); // 幻のリンクを破棄してメモリを空ける！
      }
    });

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

        // 💡 編集が終わってマウスが離れたら、止めていたアニメーションを復活させる！
        div.style.animation = '';

        if (typeof saveState === 'function') saveState();
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
// Double click actions
slideContainer.addEventListener('dblclick', (e) => {
  if (typeof isPresentationMode !== 'undefined' && isPresentationMode) return; // プレゼン中は編集禁止！

  // ▼ 1. 文字の隙間をクリックしても「テキスト枠全体」として判定する！
  const textParent = e.target.closest('.slide-element.text');

  if (e.target.classList.contains('shape')) {
    // Toggle border radius of shapes
    const id = e.target.dataset.id;
    const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
    if (stateEl) {
      stateEl.borderRadius = stateEl.borderRadius === '50%' ? '0' : '50%';
      if (typeof updateUI === 'function') updateUI();
    }
  } else if (textParent) {
    // ▼ 2. 枠内のテキスト本体（text-content）を見つけ出す！
    const textContent = textParent.querySelector('.text-content');

    if (textContent) {
      // 💡 最強の解決策：編集中は文字がブレて選択できないので、アニメーションを一時停止！
      textParent.style.animation = 'none';

      textContent.contentEditable = "true";
      textContent.style.cursor = "text";
      textContent.focus();

      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(textContent);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
});

// Initial render
document.addEventListener('DOMContentLoaded', updateUI);


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
