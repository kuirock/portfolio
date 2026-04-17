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