// ==========================================
// ドラッグ・リサイズ・パネル用の変数を準備
// ==========================================
let dragTarget = null;
let resizeTarget = null;
let resizeCorner = null;
let startRect = null;
let startMouse = null;
let groupDragInitialPositions = [];

const propertyPanelHeader = document.getElementById('propertyPanelHeader');
let isDraggingPanel = false;
let panelOffsetX = 0;
let panelOffsetY = 0;

if (propertyPanelHeader) {
    propertyPanelHeader.addEventListener('mousedown', (e) => {
        isDraggingPanel = true;
        const propertyPanel = document.getElementById('propertyPanel');
        const rect = propertyPanel.getBoundingClientRect();
        panelOffsetX = e.clientX - rect.left;
        panelOffsetY = e.clientY - rect.top;
        propertyPanel.style.right = 'auto';
        propertyPanel.style.left = `${rect.left}px`;
        propertyPanel.style.top = `${rect.top}px`;
    });
}

// ==========================================
// スナップガイドの要素を管理（複数線対応プール）
// ==========================================
const guidePoolX = [];
const guidePoolY = [];

function drawSnapGuides(xs, ys) {
    guidePoolX.forEach(el => el.style.display = 'none');
    guidePoolY.forEach(el => el.style.display = 'none');

    if (xs && xs.length > 0) {
        xs.forEach((x, i) => {
            if (!guidePoolX[i]) {
                const g = document.createElement('div');
                g.className = 'snap-guide snap-guide-x';
                slideContainer.appendChild(g);
                guidePoolX.push(g);
            }
            if (!guidePoolX[i].parentElement) slideContainer.appendChild(guidePoolX[i]);
            guidePoolX[i].style.display = 'block';
            guidePoolX[i].style.left = `${x}px`;
        });
    }

    if (ys && ys.length > 0) {
        ys.forEach((y, i) => {
            if (!guidePoolY[i]) {
                const g = document.createElement('div');
                g.className = 'snap-guide snap-guide-y';
                slideContainer.appendChild(g);
                guidePoolY.push(g);
            }
            if (!guidePoolY[i].parentElement) slideContainer.appendChild(guidePoolY[i]);
            guidePoolY[i].style.display = 'block';
            guidePoolY[i].style.top = `${y}px`;
        });
    }
}

function clearSnapGuides() {
    guidePoolX.forEach(el => el.style.display = 'none');
    guidePoolY.forEach(el => el.style.display = 'none');
}

// ==========================================
// 要素を「掴む」処理（mousedown）
// ==========================================
slideContainer.addEventListener('mousedown', (e) => {
    if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
    if (typeof isPresentationMode !== 'undefined' && isPresentationMode) return;

    if (e.target === slideContainer) {
        state.selectedElementIds = [];
        if (typeof updateUI === 'function') updateUI();
        return;
    }

    if (e.target.classList.contains('resize-handle')) {
        resizeTarget = e.target.parentElement;
        resizeCorner = e.target.dataset.corner;
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
            if (state.selectedElementIds.includes(id)) {
                state.selectedElementIds = state.selectedElementIds.filter(i => i !== id);
            } else {
                state.selectedElementIds.push(id);
            }
            if (typeof updateUI === 'function') updateUI();
        } else {
            if (!state.selectedElementIds.includes(id)) {
                state.selectedElementIds = [id];
                if (typeof updateUI === 'function') updateUI();
            }
        }

        if (typeof saveState === 'function') saveState();
        dragTarget = slideEl;
        startMouse = { x: e.clientX, y: e.clientY };

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

// ==========================================
// 魔法の超ヌルヌル描画（requestAnimationFrame）
// ==========================================
let isUpdatingFrame = false;
let latestMouseEvent = null;
let accMoveX = 0;
let accMoveY = 0;

document.addEventListener('mousemove', (e) => {
    if (isDraggingPanel) {
        const propertyPanel = document.getElementById('propertyPanel');
        propertyPanel.style.left = `${e.clientX - panelOffsetX}px`;
        propertyPanel.style.top = `${e.clientY - panelOffsetY}px`;
    }

    latestMouseEvent = e;
    accMoveX += e.movementX;
    accMoveY += e.movementY;

    if (isUpdatingFrame) return;
    isUpdatingFrame = true;

    requestAnimationFrame(() => {
        const ev = latestMouseEvent;
        const totalMoveX = accMoveX;
        const totalMoveY = accMoveY;
        accMoveX = 0;
        accMoveY = 0;

        if (dragTarget) {
            const stateEl = state.slides[state.currentSlide].find(item => item.id === dragTarget.dataset.id);

            if (stateEl && stateEl.cropMode) {
                const dx = totalMoveX * -0.5;
                const dy = totalMoveY * -0.5;
                let newCropX = Math.max(0, Math.min(100, (stateEl.cropX || 50) + dx));
                let newCropY = Math.max(0, Math.min(100, (stateEl.cropY || 50) + dy));
                stateEl.cropX = newCropX;
                stateEl.cropY = newCropY;
                const img = dragTarget.querySelector('img');
                if (img) img.style.objectPosition = `${newCropX}% ${newCropY}%`;
            } else {
                let dx = (ev.clientX - startMouse.x) / currentScale;
                let dy = (ev.clientY - startMouse.y) / currentScale;

                if (groupDragInitialPositions.length === 1) {
                    const SNAP_THRESHOLD = 7;
                    const pos = groupDragInitialPositions[0];
                    const elWidth = dragTarget.offsetWidth;
                    const elHeight = dragTarget.offsetHeight;

                    const targetXs = [0, 1280 / 2, 1280];
                    const targetYs = [0, 720 / 2, 720];

                    state.slides[state.currentSlide].forEach(otherEl => {
                        if (otherEl.id !== pos.id) {
                            const domNode = document.querySelector(`.slide-element[data-id="${otherEl.id}"]`);
                            if (domNode) {
                                const oW = domNode.offsetWidth;
                                const oH = domNode.offsetHeight;
                                const oX = parseFloat(domNode.style.left) || 0;
                                const oY = parseFloat(domNode.style.top) || 0;
                                targetXs.push(oX, oX + oW / 2, oX + oW);
                                targetYs.push(oY, oY + oH / 2, oY + oH);
                            }
                        }
                    });

                    let baseNewX = pos.initialX + dx;
                    let finalNewX = baseNewX;
                    let bestDistX = SNAP_THRESHOLD;

                    for (let tx of targetXs) {
                        let dLeft = Math.abs(baseNewX - tx);
                        if (dLeft < bestDistX) { bestDistX = dLeft; finalNewX = tx; }
                        let dCenter = Math.abs((baseNewX + elWidth / 2) - tx);
                        if (dCenter < bestDistX) { bestDistX = dCenter; finalNewX = tx - elWidth / 2; }
                        let dRight = Math.abs((baseNewX + elWidth) - tx);
                        if (dRight < bestDistX) { bestDistX = dRight; finalNewX = tx - elWidth; }
                    }

                    let baseNewY = pos.initialY + dy;
                    let finalNewY = baseNewY;
                    let bestDistY = SNAP_THRESHOLD;

                    for (let ty of targetYs) {
                        let dTop = Math.abs(baseNewY - ty);
                        if (dTop < bestDistY) { bestDistY = dTop; finalNewY = ty; }
                        let dCenter = Math.abs((baseNewY + elHeight / 2) - ty);
                        if (dCenter < bestDistY) { bestDistY = dCenter; finalNewY = ty - elHeight / 2; }
                        let dBottom = Math.abs((baseNewY + elHeight) - ty);
                        if (dBottom < bestDistY) { bestDistY = dBottom; finalNewY = ty - elHeight; }
                    }

                    let snappedXs = [];
                    if (bestDistX < SNAP_THRESHOLD) {
                        for (let tx of targetXs) {
                            if (Math.abs(finalNewX - tx) < 0.1) snappedXs.push(tx);
                            if (Math.abs((finalNewX + elWidth / 2) - tx) < 0.1) snappedXs.push(tx);
                            if (Math.abs((finalNewX + elWidth) - tx) < 0.1) snappedXs.push(tx);
                        }
                    }

                    let snappedYs = [];
                    if (bestDistY < SNAP_THRESHOLD) {
                        for (let ty of targetYs) {
                            if (Math.abs(finalNewY - ty) < 0.1) snappedYs.push(ty);
                            if (Math.abs((finalNewY + elHeight / 2) - ty) < 0.1) snappedYs.push(ty);
                            if (Math.abs((finalNewY + elHeight) - ty) < 0.1) snappedYs.push(ty);
                        }
                    }

                    snappedXs = [...new Set(snappedXs)];
                    snappedYs = [...new Set(snappedYs)];
                    drawSnapGuides(snappedXs, snappedYs);

                    pos.dom.style.left = `${finalNewX}px`;
                    pos.dom.style.top = `${finalNewY}px`;

                } else if (groupDragInitialPositions.length > 1) {
                    groupDragInitialPositions.forEach(pos => {
                        pos.dom.style.left = `${pos.initialX + dx}px`;
                        pos.dom.style.top = `${pos.initialY + dy}px`;
                    });
                    clearSnapGuides();
                }
            }
        } else if (resizeTarget) {
            const dx = (ev.clientX - startMouse.x) / currentScale;
            const dy = (ev.clientY - startMouse.y) / currentScale;

            let baseNewLeft = startRect.left;
            let baseNewTop = startRect.top;
            let baseNewWidth = startRect.width;
            let baseNewHeight = startRect.height;

            if (resizeCorner.includes('e')) baseNewWidth = startRect.width + dx;
            if (resizeCorner.includes('s')) baseNewHeight = startRect.height + dy;
            if (resizeCorner.includes('w')) { baseNewWidth = startRect.width - dx; baseNewLeft = startRect.left + dx; }
            if (resizeCorner.includes('n')) { baseNewHeight = startRect.height - dy; baseNewTop = startRect.top + dy; }

            const SNAP_THRESHOLD = 15;
            const targetXs = [0, 1280 / 2, 1280];
            const targetYs = [0, 720 / 2, 720];

            state.slides[state.currentSlide].forEach(otherEl => {
                if (otherEl.id !== resizeTarget.dataset.id) {
                    const domNode = document.querySelector(`.slide-element[data-id="${otherEl.id}"]`);
                    if (domNode) {
                        const oW = domNode.offsetWidth;
                        const oH = domNode.offsetHeight;
                        const oX = parseFloat(domNode.style.left) || 0;
                        const oY = parseFloat(domNode.style.top) || 0;
                        targetXs.push(oX, oX + oW / 2, oX + oW);
                        targetYs.push(oY, oY + oH / 2, oY + oH);
                    }
                }
            });

            let finalNewLeft = baseNewLeft;
            let finalNewTop = baseNewTop;
            let finalNewWidth = baseNewWidth;
            let finalNewHeight = baseNewHeight;
            let snappedXs = [];
            let snappedYs = [];

            if (resizeCorner.includes('e')) {
                let bestDist = SNAP_THRESHOLD;
                for (let tx of targetXs) {
                    let d = Math.abs((baseNewLeft + baseNewWidth) - tx);
                    if (d < bestDist) { bestDist = d; finalNewWidth = tx - baseNewLeft; }
                }
                if (bestDist < SNAP_THRESHOLD) {
                    for (let tx of targetXs) {
                        if (Math.abs((finalNewLeft + finalNewWidth) - tx) < 0.1) snappedXs.push(tx);
                    }
                }
            } else if (resizeCorner.includes('w')) {
                let bestDist = SNAP_THRESHOLD;
                for (let tx of targetXs) {
                    let d = Math.abs(baseNewLeft - tx);
                    if (d < bestDist) { bestDist = d; finalNewLeft = tx; finalNewWidth = (startRect.left + startRect.width) - tx; }
                }
                if (bestDist < SNAP_THRESHOLD) {
                    for (let tx of targetXs) {
                        if (Math.abs(finalNewLeft - tx) < 0.1) snappedXs.push(tx);
                    }
                }
            }

            if (resizeCorner.includes('s')) {
                let bestDist = SNAP_THRESHOLD;
                for (let ty of targetYs) {
                    let d = Math.abs((baseNewTop + baseNewHeight) - ty);
                    if (d < bestDist) { bestDist = d; finalNewHeight = ty - baseNewTop; }
                }
                if (bestDist < SNAP_THRESHOLD) {
                    for (let ty of targetYs) {
                        if (Math.abs((finalNewTop + finalNewHeight) - ty) < 0.1) snappedYs.push(ty);
                    }
                }
            } else if (resizeCorner.includes('n')) {
                let bestDist = SNAP_THRESHOLD;
                for (let ty of targetYs) {
                    let d = Math.abs(baseNewTop - ty);
                    if (d < bestDist) { bestDist = d; finalNewTop = ty; finalNewHeight = (startRect.top + startRect.height) - ty; }
                }
                if (bestDist < SNAP_THRESHOLD) {
                    for (let ty of targetYs) {
                        if (Math.abs(finalNewTop - ty) < 0.1) snappedYs.push(ty);
                    }
                }
            }

            snappedXs = [...new Set(snappedXs)];
            snappedYs = [...new Set(snappedYs)];
            drawSnapGuides(snappedXs, snappedYs);

            const minWidth = resizeTarget.classList.contains('text') ? 50 : 5;
            const minHeight = resizeTarget.classList.contains('text') ? 30 : 5;

            if (finalNewWidth > minWidth && finalNewHeight > minHeight) {
                resizeTarget.style.width = `${finalNewWidth}px`;
                resizeTarget.style.height = `${finalNewHeight}px`;
                resizeTarget.style.left = `${finalNewLeft}px`;
                resizeTarget.style.top = `${finalNewTop}px`;
            }
        }
        isUpdatingFrame = false;
    });
});

// ==========================================
// 離す処理（mouseup）
// ==========================================
document.addEventListener('mouseup', (e) => {
    isDraggingPanel = false;
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
            if (typeof saveState === 'function') saveState();
        } else if (resizeTarget) {
            const id = resizeTarget.dataset.id;
            const stateEl = state.slides[state.currentSlide].find(item => item.id === id);
            if (stateEl) {
                stateEl.x = parseFloat(resizeTarget.style.left);
                stateEl.y = parseFloat(resizeTarget.style.top);

                const computedStyle = getComputedStyle(resizeTarget);
                stateEl.width = parseFloat(computedStyle.width);
                stateEl.height = parseFloat(computedStyle.height);

                if (typeof saveState === 'function') saveState();
            }
        }

        dragTarget = null;
        resizeTarget = null;
        resizeCorner = null;
        groupDragInitialPositions = [];
    }
});