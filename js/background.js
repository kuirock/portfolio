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

function initGlitchBlocks() {
    glitchBlocks.length = 0;
    for (let i = 0; i < numBlocks; i++) {
      const size = Math.random() * 15 + 2; // Finer, smaller noise blocks

      // Assign to edges (top:0, bottom:1, left:2, right:3)
      const edge = Math.floor(Math.random() * 4);
      let baseX = 0, baseY = 0;

      // Random distance to allow a "thickness" to the edge effect
      const edgeOffset = (Math.random() - 0.5) * 80;

      if (edge === 0) { // Top
          baseX = Math.random() * canvas.width;
          baseY = 20 + edgeOffset;
      } else if (edge === 1) { // Bottom
          baseX = Math.random() * canvas.width;
          baseY = canvas.height - 20 + edgeOffset;
      } else if (edge === 2) { // Left
          baseX = 20 + edgeOffset;
          baseY = Math.random() * canvas.height;
      } else if (edge === 3) { // Right
          baseX = canvas.width - 20 + edgeOffset;
          baseY = Math.random() * canvas.height;
      }

      glitchBlocks.push({
        baseX: baseX,
        baseY: baseY,
        edge: edge, // track which edge for wave effect
        width: size,
        height: size, // Force squares
        baseOpacity: Math.random() * 0.8 + 0.2
      });
    }
}
initGlitchBlocks();
window.addEventListener('resize', initGlitchBlocks);

function drawGlitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00f2ff'; // Cyan

  const time = Date.now();

  glitchBlocks.forEach(block => {
    // Determine position along the edge for the wave (0 to 1)
    let posOnEdge = 0;
    if (block.edge === 0 || block.edge === 1) posOnEdge = block.baseX / canvas.width;
    else posOnEdge = block.baseY / canvas.height;

    // Create a chaotic pulse by combining multiple sine waves with different frequencies
    const wave1 = Math.sin(posOnEdge * 10 + time / 300);
    const wave2 = Math.sin(posOnEdge * 5 - time / 470);
    const wave3 = Math.sin(posOnEdge * 20 + time / 710);

    // Normalize combined waves (values will flutter unpredictably)
    const chaoticPulse = Math.max(0, (wave1 + wave2 + wave3) / 3);

    // Occasional unpredictable spikes
    let spikeMultiplier = 1;
    if (Math.random() > 0.98) {
        spikeMultiplier = Math.random() * 3 + 2; // Spike up to 5x
    }

    // Irregular flickering (flicker opacity randomly)
    let currentOpacity = block.baseOpacity;
    if (Math.random() > 0.8) {
      currentOpacity = Math.random() * 0.8;
    }

    // Boost opacity based on chaotic pulse and spikes
    ctx.globalAlpha = Math.min(1.0, (currentOpacity + chaoticPulse * 0.5) * spikeMultiplier);

    // Jittering (offset position randomly)
    let offsetX = (Math.random() - 0.5) * 10 * spikeMultiplier;
    let offsetY = (Math.random() - 0.5) * 10 * spikeMultiplier;

    // Scale up blocks unpredictably
    const scale = 1 + chaoticPulse * 2 * spikeMultiplier;
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
