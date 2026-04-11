const slideContainer = document.getElementById('slideContainer');

function updateUI() {
    renderSlide();
}

function renderSlide() {
  slideContainer.innerHTML = '';
  const currentElements = state.slides[state.currentSlide];

  currentElements.forEach(el => {
    const div = document.createElement('div');
    div.classList.add('slide-element', el.type);
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.zIndex = el.zIndex || 1;

    if (el.type === 'text') {
      const textInner = document.createElement('div');
      textInner.className = 'text-content';
      textInner.textContent = el.content;

      div.classList.add('glitch-text'); // Add glitch effect
      if (el.color) div.style.color = el.color;
      if (el.fontFamily) div.style.fontFamily = el.fontFamily;
      if (el.fontSize) div.style.fontSize = `${el.fontSize}px`;
      if (el.fontWeight) div.style.fontWeight = el.fontWeight;
      if (el.width) div.style.width = `${el.width}px`;
      if (el.height) div.style.height = `auto`;

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
      div.appendChild(img);
    }

    slideContainer.appendChild(div);
  });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        if (state.currentSlide < state.slides.length - 1) {
            state.currentSlide++;
            updateUI();
        }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (state.currentSlide > 0) {
            state.currentSlide--;
            updateUI();
        }
    }
});

document.addEventListener('click', () => {
    if (state.currentSlide < state.slides.length - 1) {
        state.currentSlide++;
        updateUI();
    }
});

// Force fullscreen on first click if desired, optional.
document.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Initial render
updateUI();
