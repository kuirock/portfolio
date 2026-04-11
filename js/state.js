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

// Strict LocalStorage Cleanup: only keep 'cyberpunk_state'
for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key.startsWith('cyberpunk_') && key !== 'cyberpunk_state') {
        localStorage.removeItem(key);
    }
}

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

function saveToLocalStorage() {
    localStorage.setItem('cyberpunk_state', JSON.stringify(state));
}

function saveState() {
  historyStack.push(JSON.stringify(state));
  if (historyStack.length > 50) historyStack.shift(); // Limit history to 50
  saveToLocalStorage(); // Auto-save on every state change
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

function exportStateToJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cyberpunk_presentation.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importStateFromJson(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedState = JSON.parse(event.target.result);
                if (parsedState && parsedState.slides) {
                    saveState();
                    state = parsedState;
                    state.selectedElementId = null;
                    if (typeof updateUI === 'function') {
                        updateUI();
                    }
                }
            } catch(e) {
                console.error("Error parsing JSON file", e);
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    }
}

// Initial save
saveState();
