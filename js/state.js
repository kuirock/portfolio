// --- Agent 2: Shared State Management ---
let state = {
  currentSlide: 0,
  selectedElementId: null,
  slides: [
    [
      { id: Date.now().toString(), type: 'text', content: 'CYBERPUNK_SLIDES_V1.0', x: 250, y: 200, zIndex: 1 }
    ]
  ]
};

// Attempt to load from localStorage
const savedState = localStorage.getItem('cyberpunk_state');
if (savedState) {
    try {
        state = JSON.parse(savedState);
        state.selectedElementId = null; // deselect on reload
    } catch (e) {
        console.error("Failed to parse saved state", e);
    }
}

let historyStack = [];

function saveState() {
  historyStack.push(JSON.stringify(state));
  if (historyStack.length > 50) historyStack.shift(); // Limit history to 50
}

function saveToLocalStorage() {
    localStorage.setItem('cyberpunk_state', JSON.stringify(state));
    // Optional: visual indicator if saveBtn exists
    const btn = document.getElementById('saveBtn');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = 'SAVED!';
        setTimeout(() => btn.textContent = orig, 1000);
    }
}

function undo() {
  if (historyStack.length > 0) {
    const prevState = historyStack.pop();
    state = JSON.parse(prevState);
    if (typeof updateUI === 'function') {
        updateUI();
    }
  }
}

// Initial save
saveState();
