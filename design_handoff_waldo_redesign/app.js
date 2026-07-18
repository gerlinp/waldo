const els = {
  home: document.getElementById('home-view'),
  chooseMapBtn: document.getElementById('choose-map-btn'),
  randomBtn: document.getElementById('random-btn'),
  listView: document.getElementById('puzzle-list-view'),
  listHomeBtn: document.getElementById('list-home-btn'),
  list: document.getElementById('puzzle-list'),
  gameView: document.getElementById('game-view'),
  backBtn: document.getElementById('back-btn'),
  title: document.getElementById('game-title'),
  imageWrap: document.getElementById('image-wrap'),
  image: document.getElementById('game-image'),
  zoomInBtn: document.getElementById('zoom-in-btn'),
  zoomOutBtn: document.getElementById('zoom-out-btn'),
  zoomResetBtn: document.getElementById('zoom-reset-btn'),
  minimapToggleBtn: document.getElementById('minimap-toggle-btn'),
  minimap: document.getElementById('minimap'),
  minimapImage: document.getElementById('minimap-image'),
  minimapViewport: document.getElementById('minimap-viewport'),
};

const puzzles = typeof PUZZLES !== 'undefined' ? PUZZLES : [];
let current = null;

// Tuned for touch devices used by kids: gentle zoom steps, a lower max
// (page scans are ~150dpi and get blurry/hard to control past this), and
// pinch-to-zoom follows finger distance 1:1 so it stays predictable.
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const CLICK_MOVE_THRESHOLD = 6;
const KEY_PAN_STEP = 70;
const WHEEL_ZOOM_SENSITIVITY = 0.0012;
const BUTTON_ZOOM_FACTOR = 1.1;
const DBLCLICK_ZOOM_FACTOR = 1.25;
const KEY_ZOOM_FACTOR = 1.08;

let scale = 1;
let tx = 0;
let ty = 0;
let baseRect = { left: 0, top: 0, width: 0, height: 0 };
let minimapRect = { left: 0, top: 0, width: 0, height: 0 };

const pointers = new Map();
let dragState = null;
let pinchState = null;
let moveHistory = [];
let momentumFrame = null;
let zoomAnimFrame = null;
let minimapDragging = false;
let minimapVisible = true;

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, 'very-hard': 3 };
const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard', 'very-hard': 'Very Hard' };

function renderList() {
  if (!puzzles.length) {
    els.list.innerHTML = '<p class="empty-state">No puzzles yet. Add entries to puzzles.js.</p>';
    return;
  }
  const sorted = [...puzzles].sort((a, b) =>
    (DIFFICULTY_ORDER[a.difficulty] ?? 99) - (DIFFICULTY_ORDER[b.difficulty] ?? 99)
  );
  els.list.innerHTML = '';
  for (const puzzle of sorted) {
    const card = document.createElement('button');
    card.className = 'puzzle-card';
    const difficultyLabel = DIFFICULTY_LABEL[puzzle.difficulty];
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${puzzle.thumbnail || puzzle.image}" alt="${puzzle.title}" loading="lazy">
        ${difficultyLabel ? `<span class="difficulty-stamp difficulty-${puzzle.difficulty}">${difficultyLabel}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${puzzle.title}</h3>
      </div>
    `;
    card.addEventListener('click', () => startPuzzle(puzzle, 'list'));
    els.list.appendChild(card);
  }
}

let returnView = 'home';

function showView(view) {
  els.home.classList.toggle('hidden', view !== 'home');
  els.listView.classList.toggle('hidden', view !== 'list');
  els.gameView.classList.toggle('hidden', view !== 'game');
  document.body.classList.toggle('is-home', view === 'home');
  document.body.classList.toggle('is-playing', view === 'game');
}

function startPuzzle(puzzle, from) {
  if (from) returnView = from;
  current = puzzle;
  els.title.textContent = puzzle.title;
  showView('game');

  cancelMomentum();
  scale = 1;
  tx = 0;
  ty = 0;
  els.image.src = puzzle.image;
  els.minimapImage.src = puzzle.image;
}

function stopGame() {
  cancelMomentum();
  showView(returnView);
  renderList();
}

// --- Layout: fit the image inside its container like object-fit:contain,
// then zoom/pan is applied on top via CSS transform on the img element. ---

function computeContainRect(naturalW, naturalH, containerW, containerH) {
  const imgAspect = naturalW / naturalH;
  const containerAspect = containerW / containerH;
  let width, height;
  if (imgAspect > containerAspect) {
    width = containerW;
    height = containerW / imgAspect;
  } else {
    height = containerH;
    width = containerH * imgAspect;
  }
  return {
    left: (containerW - width) / 2,
    top: (containerH - height) / 2,
    width,
    height,
  };
}

function computeBaseRect() {
  baseRect = computeContainRect(
    els.image.naturalWidth || 1,
    els.image.naturalHeight || 1,
    els.imageWrap.clientWidth,
    els.imageWrap.clientHeight
  );
}

function applyBaseLayout() {
  els.image.style.left = `${baseRect.left}px`;
  els.image.style.top = `${baseRect.top}px`;
  els.image.style.width = `${baseRect.width}px`;
  els.image.style.height = `${baseRect.height}px`;
}

function computeMinimapRect() {
  minimapRect = computeContainRect(
    els.image.naturalWidth || 1,
    els.image.naturalHeight || 1,
    els.minimap.clientWidth,
    els.minimap.clientHeight
  );
}

function applyMinimapLayout() {
  els.minimapImage.style.left = `${minimapRect.left}px`;
  els.minimapImage.style.top = `${minimapRect.top}px`;
  els.minimapImage.style.width = `${minimapRect.width}px`;
  els.minimapImage.style.height = `${minimapRect.height}px`;
}

function updateMinimapViewport() {
  const containerW = els.imageWrap.clientWidth;
  const containerH = els.imageWrap.clientHeight;

  const fxMin = clamp01(((0 - baseRect.left - tx) / scale) / baseRect.width);
  const fxMax = clamp01(((containerW - baseRect.left - tx) / scale) / baseRect.width);
  const fyMin = clamp01(((0 - baseRect.top - ty) / scale) / baseRect.height);
  const fyMax = clamp01(((containerH - baseRect.top - ty) / scale) / baseRect.height);

  els.minimapViewport.style.left = `${minimapRect.left + fxMin * minimapRect.width}px`;
  els.minimapViewport.style.top = `${minimapRect.top + fyMin * minimapRect.height}px`;
  els.minimapViewport.style.width = `${Math.max(4, (fxMax - fxMin) * minimapRect.width)}px`;
  els.minimapViewport.style.height = `${Math.max(4, (fyMax - fyMin) * minimapRect.height)}px`;
}

function setMinimapVisible(visible) {
  minimapVisible = visible;
  els.minimap.classList.toggle('hidden', !visible);
  els.minimapToggleBtn.title = visible ? 'Hide map' : 'Show map';
  els.minimapToggleBtn.classList.toggle('map-icon-btn-active', !visible);
}

function applyTransform() {
  els.image.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  updateMinimapViewport();
}

function clampPan() {
  const containerW = els.imageWrap.clientWidth;
  const containerH = els.imageWrap.clientHeight;
  const scaledWidth = baseRect.width * scale;
  const scaledHeight = baseRect.height * scale;

  // Bounds include a half-viewport margin on each axis so that any point in
  // the image — including the extreme edges/corners — can be panned all the
  // way to the center of the screen, not just until its edge is flush with
  // the container edge.
  const maxTx = -baseRect.left + containerW / 2;
  const minTx = containerW / 2 - scaledWidth - baseRect.left;
  tx = Math.min(maxTx, Math.max(minTx, tx));

  const maxTy = -baseRect.top + containerH / 2;
  const minTy = containerH / 2 - scaledHeight - baseRect.top;
  ty = Math.min(maxTy, Math.max(minTy, ty));
}

function resetZoom() {
  scale = MIN_SCALE;
  tx = 0;
  ty = 0;
  applyTransform();
}

function zoomAround(clientX, clientY, factor) {
  const containerRect = els.imageWrap.getBoundingClientRect();
  const px = clientX - containerRect.left;
  const py = clientY - containerRect.top;
  zoomAroundContainerPoint(px, py, scale * factor);
}

function zoomAroundContainerPoint(px, py, newScaleRaw) {
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScaleRaw));
  const ratio = newScale / scale;
  const relX = px - baseRect.left;
  const relY = py - baseRect.top;
  tx = relX - ratio * (relX - tx);
  ty = relY - ratio * (relY - ty);
  scale = newScale;
  clampPan();
  applyTransform();
}

function cancelZoomAnim() {
  if (zoomAnimFrame) cancelAnimationFrame(zoomAnimFrame);
  zoomAnimFrame = null;
}

// --- Animated zoom for discrete actions (buttons, dblclick, keyboard). Unlike
// a CSS transition, this re-clamps the pan on every single frame, so the
// image can never momentarily uncover the container mid-animation (which
// showed as a flash of black at the edges before snapping into place). ---

function animateZoomAround(px, py, factor, duration = 180) {
  cancelZoomAnim();
  const startScale = scale;
  const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * factor));
  if (Math.abs(targetScale - startScale) < 0.001) return;

  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    zoomAroundContainerPoint(px, py, startScale + (targetScale - startScale) * eased);
    zoomAnimFrame = t < 1 ? requestAnimationFrame(step) : null;
  }
  zoomAnimFrame = requestAnimationFrame(step);
}

els.image.addEventListener('load', () => {
  computeBaseRect();
  applyBaseLayout();
  computeMinimapRect();
  applyMinimapLayout();
  resetZoom();
});

window.addEventListener('resize', () => {
  if (els.gameView.classList.contains('hidden')) return;
  computeBaseRect();
  applyBaseLayout();
  computeMinimapRect();
  applyMinimapLayout();
  clampPan();
  applyTransform();
});

// --- Wheel zoom: instant (no transition) and proportional to scroll speed,
// same as pinch, so continuous scrolling tracks smoothly instead of
// restarting a little animation on every tick (which felt stuttery). ---
els.imageWrap.addEventListener('wheel', (evt) => {
  if (!current) return;
  evt.preventDefault();
  cancelMomentum();
  cancelZoomAnim();
  const factor = Math.exp(-evt.deltaY * WHEEL_ZOOM_SENSITIVITY);
  zoomAround(evt.clientX, evt.clientY, factor);
}, { passive: false });

els.imageWrap.addEventListener('dblclick', (evt) => {
  if (!current) return;
  evt.preventDefault();
  cancelMomentum();
  const containerRect = els.imageWrap.getBoundingClientRect();
  const px = evt.clientX - containerRect.left;
  const py = evt.clientY - containerRect.top;
  if (scale > MIN_SCALE + 0.1) {
    animateZoomAround(px, py, MIN_SCALE / scale);
  } else {
    animateZoomAround(px, py, DBLCLICK_ZOOM_FACTOR);
  }
});

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// --- Momentum panning: after a drag release with velocity, glide and decelerate,
// stopping automatically once clampPan reaches an edge. ---

function cancelMomentum() {
  if (momentumFrame) cancelAnimationFrame(momentumFrame);
  momentumFrame = null;
}

function startMomentum(vx, vy) {
  let lastT = performance.now();
  function step(now) {
    const dt = Math.min(48, now - lastT);
    lastT = now;
    const decay = Math.pow(0.94, dt / 16);
    vx *= decay;
    vy *= decay;
    tx += vx * dt;
    ty += vy * dt;

    const beforeTx = tx;
    const beforeTy = ty;
    clampPan();
    if (tx !== beforeTx) vx = 0;
    if (ty !== beforeTy) vy = 0;
    applyTransform();

    if (Math.hypot(vx, vy) > 0.01) {
      momentumFrame = requestAnimationFrame(step);
    } else {
      momentumFrame = null;
    }
  }
  cancelMomentum();
  momentumFrame = requestAnimationFrame(step);
}

// --- Pointer events: unified mouse + touch for drag-to-pan and pinch-to-zoom,
// with click-vs-drag detection so a tap/click still triggers the hit test. ---

els.imageWrap.addEventListener('pointerdown', (evt) => {
  if (!current) return;
  cancelMomentum();
  cancelZoomAnim();
  els.imageWrap.setPointerCapture(evt.pointerId);
  pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

  if (pointers.size === 1) {
    dragState = {
      pointerId: evt.pointerId,
      startX: evt.clientX,
      startY: evt.clientY,
      startTx: tx,
      startTy: ty,
      moved: false,
    };
    moveHistory = [{ x: evt.clientX, y: evt.clientY, t: performance.now() }];
  } else if (pointers.size === 2) {
    dragState = null;
    const pts = [...pointers.values()];
    pinchState = {
      startDist: distance(pts[0], pts[1]),
      startScale: scale,
    };
  }
});

els.imageWrap.addEventListener('pointermove', (evt) => {
  if (!pointers.has(evt.pointerId)) return;
  pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });

  if (pinchState && pointers.size >= 2) {
    const pts = [...pointers.values()].slice(0, 2);
    const dist = distance(pts[0], pts[1]);
    const mid = midpoint(pts[0], pts[1]);
    const containerRect = els.imageWrap.getBoundingClientRect();
    const px = mid.x - containerRect.left;
    const py = mid.y - containerRect.top;
    const newScale = pinchState.startScale * (dist / pinchState.startDist);
    zoomAroundContainerPoint(px, py, newScale);
  } else if (dragState && evt.pointerId === dragState.pointerId) {
    const dx = evt.clientX - dragState.startX;
    const dy = evt.clientY - dragState.startY;
    if (Math.abs(dx) > CLICK_MOVE_THRESHOLD || Math.abs(dy) > CLICK_MOVE_THRESHOLD) {
      dragState.moved = true;
    }
    if (dragState.moved) {
      els.imageWrap.classList.add('panning');
      tx = dragState.startTx + dx;
      ty = dragState.startTy + dy;
      clampPan();
      applyTransform();
    }
    moveHistory.push({ x: evt.clientX, y: evt.clientY, t: performance.now() });
    if (moveHistory.length > 5) moveHistory.shift();
  }
});

function onPointerEnd(evt) {
  const wasDrag = dragState && dragState.pointerId === evt.pointerId && dragState.moved;

  if (wasDrag && moveHistory.length >= 2) {
    const last = moveHistory[moveHistory.length - 1];
    const first = moveHistory[0];
    const dt = Math.max(1, last.t - first.t);
    const vx = (last.x - first.x) / dt;
    const vy = (last.y - first.y) / dt;
    if (Math.hypot(vx, vy) > 0.05) {
      startMomentum(vx, vy);
    }
  }

  pointers.delete(evt.pointerId);
  if (pointers.size < 2) pinchState = null;
  if (pointers.size === 0) {
    dragState = null;
    els.imageWrap.classList.remove('panning');
  }
}

els.imageWrap.addEventListener('pointerup', onPointerEnd);
els.imageWrap.addEventListener('pointercancel', onPointerEnd);

// --- Minimap: click or drag on it to jump the main view to that spot. ---

function jumpFromMinimap(clientX, clientY) {
  const rect = els.minimap.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const fx = clamp01((px - minimapRect.left) / minimapRect.width);
  const fy = clamp01((py - minimapRect.top) / minimapRect.height);
  const containerW = els.imageWrap.clientWidth;
  const containerH = els.imageWrap.clientHeight;

  tx = containerW / 2 - baseRect.left - scale * fx * baseRect.width;
  ty = containerH / 2 - baseRect.top - scale * fy * baseRect.height;
  clampPan();
  applyTransform();
}

els.minimap.addEventListener('pointerdown', (evt) => {
  if (!current) return;
  evt.stopPropagation();
  cancelMomentum();
  cancelZoomAnim();
  minimapDragging = true;
  els.minimap.setPointerCapture(evt.pointerId);
  jumpFromMinimap(evt.clientX, evt.clientY);
});

els.minimap.addEventListener('pointermove', (evt) => {
  if (!minimapDragging) return;
  evt.stopPropagation();
  jumpFromMinimap(evt.clientX, evt.clientY);
});

els.minimap.addEventListener('pointerup', (evt) => {
  evt.stopPropagation();
  minimapDragging = false;
});

els.minimap.addEventListener('pointercancel', () => {
  minimapDragging = false;
});

// --- Keyboard: arrow keys pan, +/- zoom, 0 resets. ---

window.addEventListener('keydown', (evt) => {
  if (els.gameView.classList.contains('hidden')) return;

  const panKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  const zoomKeys = ['+', '=', '-', '_', '0'];
  if (!panKeys.includes(evt.key) && !zoomKeys.includes(evt.key)) return;

  evt.preventDefault();
  cancelMomentum();

  const r = els.imageWrap.getBoundingClientRect();
  switch (evt.key) {
    case 'ArrowUp': cancelZoomAnim(); ty += KEY_PAN_STEP; clampPan(); applyTransform(); break;
    case 'ArrowDown': cancelZoomAnim(); ty -= KEY_PAN_STEP; clampPan(); applyTransform(); break;
    case 'ArrowLeft': cancelZoomAnim(); tx += KEY_PAN_STEP; clampPan(); applyTransform(); break;
    case 'ArrowRight': cancelZoomAnim(); tx -= KEY_PAN_STEP; clampPan(); applyTransform(); break;
    case '+':
    case '=': animateZoomAround(r.width / 2, r.height / 2, KEY_ZOOM_FACTOR); break;
    case '-':
    case '_': animateZoomAround(r.width / 2, r.height / 2, 1 / KEY_ZOOM_FACTOR); break;
    case '0': animateZoomAround(r.width / 2, r.height / 2, MIN_SCALE / scale); break;
  }
});

els.backBtn.addEventListener('click', stopGame);
els.zoomInBtn.addEventListener('click', () => {
  cancelMomentum();
  const rect = els.imageWrap.getBoundingClientRect();
  animateZoomAround(rect.width / 2, rect.height / 2, BUTTON_ZOOM_FACTOR);
});
els.zoomOutBtn.addEventListener('click', () => {
  cancelMomentum();
  const rect = els.imageWrap.getBoundingClientRect();
  animateZoomAround(rect.width / 2, rect.height / 2, 1 / BUTTON_ZOOM_FACTOR);
});
els.zoomResetBtn.addEventListener('click', () => {
  cancelMomentum();
  const rect = els.imageWrap.getBoundingClientRect();
  animateZoomAround(rect.width / 2, rect.height / 2, MIN_SCALE / scale);
});

els.minimapToggleBtn.addEventListener('click', () => {
  setMinimapVisible(!minimapVisible);
});

els.chooseMapBtn.addEventListener('click', () => {
  showView('list');
  renderList();
});

els.randomBtn.addEventListener('click', () => {
  if (puzzles.length) {
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    startPuzzle(puzzle, 'home');
  } else {
    showView('list');
    renderList();
  }
});

els.listHomeBtn.addEventListener('click', () => showView('home'));

showView('home');
