// --- Agent 2: Shared State Management ---
let state = {
  currentSlide: 0,
  selectedElementIds: [],
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
        const parsedState = JSON.parse(savedState);
        // Safely migrate old state structure
        if (parsedState.selectedElementId !== undefined) {
            parsedState.selectedElementIds = [];
            delete parsedState.selectedElementId;
        }
        parsedState.selectedElementIds = []; // deselect on reload
        state = parsedState;
    } catch (e) {
        console.error("Failed to parse saved state", e);
    }
}

let historyStack = [];

function saveToLocalStorage() {
    localStorage.setItem('cyberpunk_state', JSON.stringify(state));
}

function saveState() {
  // Use deep copy to prevent reference mutation bugs in history stack
  historyStack.push(JSON.stringify(state));
  if (historyStack.length > 50) historyStack.shift(); // Limit history to 50
  saveToLocalStorage(); // Auto-save on every state change
}

function undo() {
  if (historyStack.length > 0) {
    const prevState = historyStack.pop();
    state = JSON.parse(prevState);
    // Explicitly reset selection during undo to avoid ghost handles
    state.selectedElementIds = [];
    saveToLocalStorage(); // Ensure un-done state is persisted
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
                    // Safely migrate old state structure
                    if (state.selectedElementId !== undefined) {
                        state.selectedElementIds = [];
                        delete state.selectedElementId;
                    }
                    state.selectedElementIds = [];
                    saveToLocalStorage();
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
