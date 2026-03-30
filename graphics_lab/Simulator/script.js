

/* =========================
   CANVAS + COORDINATES
========================= */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const ORIGIN_X = WIDTH / 2;
const ORIGIN_Y = HEIGHT / 2;

function toCanvasX(x) { return ORIGIN_X + x; }
function toCanvasY(y) { return ORIGIN_Y - y; }

function toWorldX(cx) { return cx - ORIGIN_X; }
function toWorldY(cy) { return ORIGIN_Y - cy; }

function plot(x, y, color = "#000") {
  ctx.fillStyle = color;
  ctx.fillRect(toCanvasX(x), toCanvasY(y), 1, 1);
}

/* =========================
   UI ELEMENTS
========================= */
const categorySel = document.getElementById("category");
const algoSel = document.getElementById("algorithm");
const gridModeSel = document.getElementById("gridMode");

const panelBasic = document.getElementById("panelBasic");
const panelTransform = document.getElementById("panelTransform");
const panelClip = document.getElementById("panelClip");
const panelFill = document.getElementById("panelFill");
const panelHidden = document.getElementById("panelHidden");

const btnRun = document.getElementById("btnRun");
const btnStep = document.getElementById("btnStep");
const btnClear = document.getElementById("btnClear");

const speedRange = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");

const statusText = document.getElementById("statusText");
const stepText = document.getElementById("stepText");

/* Basic inputs */
const x1Input = document.getElementById("x1");
const y1Input = document.getElementById("y1");
const x2Input = document.getElementById("x2");
const y2Input = document.getElementById("y2");

/* 2D transformation inputs */
const btnCloseTransform = document.getElementById("btnCloseTransform");
const btnUndoTransform = document.getElementById("btnUndoTransform");
const btnResetTransform = document.getElementById("btnResetTransform");
const transformInfo = document.getElementById("transformInfo");
const txInput = document.getElementById("tx");
const tyInput = document.getElementById("ty");
const sxInput = document.getElementById("sx");
const syInput = document.getElementById("sy");
const angle2dInput = document.getElementById("angle2d");
const shxInput = document.getElementById("shx");
const shyInput = document.getElementById("shy");
const pivotXInput = document.getElementById("pivotX");
const pivotYInput = document.getElementById("pivotY");
const reflectionModeSel = document.getElementById("reflectionMode");

/* Clipping inputs */
const clipXMinInput = document.getElementById("clipXMin");
const clipYMinInput = document.getElementById("clipYMin");
const clipXMaxInput = document.getElementById("clipXMax");
const clipYMaxInput = document.getElementById("clipYMax");
const clipLineX1Input = document.getElementById("clipLineX1");
const clipLineY1Input = document.getElementById("clipLineY1");
const clipLineX2Input = document.getElementById("clipLineX2");
const clipLineY2Input = document.getElementById("clipLineY2");
const btnCloseClipPoly = document.getElementById("btnCloseClipPoly");
const btnUndoClipVertex = document.getElementById("btnUndoClipVertex");
const btnResetClipPoly = document.getElementById("btnResetClipPoly");
const clipPolyInfo = document.getElementById("clipPolyInfo");

/* Fill inputs */
const fillColorInput = document.getElementById("fillColor");
const boundaryColorInput = document.getElementById("boundaryColor");
const btnClosePoly = document.getElementById("btnClosePoly");
const btnUndoVertex = document.getElementById("btnUndoVertex");
const btnResetPoly = document.getElementById("btnResetPoly");
const polyInfo = document.getElementById("polyInfo");
const seedInfo = document.getElementById("seedInfo");

/* Hidden inputs */
const object3dSel = document.getElementById("object3d");
const scale3dInput = document.getElementById("scale3d");
const rotX = document.getElementById("rotX");
const rotY = document.getElementById("rotY");
const rotZ = document.getElementById("rotZ");
const rotXv = document.getElementById("rotXv");
const rotYv = document.getElementById("rotYv");
const rotZv = document.getElementById("rotZv");

/* =========================
   APP STATE
========================= */
const ALGO_LIST = {
  basic: [
    { value: "dda", label: "DDA Line Drawing" },
    { value: "bresenham", label: "Bresenham Line Drawing" },
    { value: "circle", label: "Midpoint Circle Drawing" },
  ],
  transform: [
    { value: "translation", label: "Translation" },
    { value: "scaling", label: "Scaling" },
    { value: "rotation2d", label: "Rotation" },
    { value: "shearing", label: "Shearing" },
    { value: "reflection", label: "Reflection" },
  ],
  clip: [
    { value: "cohen", label: "Cohen-Sutherland Line Clipping" },
    { value: "sutherland", label: "Sutherland-Hodgman Polygon Clipping" },
  ],
  fill: [
    { value: "scanline", label: "Scan-Line Fill" },
    { value: "boundary", label: "Boundary Fill" },
    { value: "flood", label: "Flood Fill" },
  ],
  hidden: [
    { value: "backface", label: "Back-Face Culling" },
    { value: "painter", label: "Painter's Algorithm" },
    { value: "zbuffer", label: "Z-Buffer Algorithm" },
  ]
};

let animation = {
  running: false,
  timer: null,
  fps: 30,
  step: 0,
  queue: [], // items are functions or pixel ops
};

let fillState = {
  vertices: [],        // [{x,y}]
  closed: false,
  seed: null,          // {x,y} in world coords
};

let transformState = {
  vertices: [],        // [{x,y}]
  closed: false,
  lastResult: null,    // [{x,y}]
  lastAlgoLabel: "",
};

let clipState = {
  vertices: [],        // [{x,y}]
  closed: false,
  lastType: "",
  lastOriginal: null,
  lastResult: null,
  lastAccepted: null,
  lastAlgoLabel: "",
};

function setStatus(msg) {
  statusText.textContent = msg;
}

function setStep(n) {
  animation.step = n;
  stepText.textContent = `Step: ${n}`;
}

function stopAnimation() {
  if (animation.timer) clearInterval(animation.timer);
  animation.timer = null;
  animation.running = false;
}

/* =========================
   GRID + AXES
========================= */
function drawGrid() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gridModeSel.value === "on") {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let i = -Math.max(WIDTH, HEIGHT); i <= Math.max(WIDTH, HEIGHT); i += 50) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), 0);
      ctx.lineTo(toCanvasX(i), HEIGHT);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(i));
      ctx.lineTo(WIDTH, toCanvasY(i));
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ORIGIN_Y);
    ctx.lineTo(WIDTH, ORIGIN_Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ORIGIN_X, 0);
    ctx.lineTo(ORIGIN_X, HEIGHT);
    ctx.stroke();
  }
}

/* =========================
   BASIC ALGORITHMS (Previous)
========================= */
function drawDDA(x1, y1, x2, y2, color = "#000") {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  let xInc = dx / steps;
  let yInc = dy / steps;
  let x = x1, y = y1;
  for (let i = 0; i <= steps; i++) {
    plot(Math.round(x), Math.round(y), color);
    x += xInc;
    y += yInc;
  }
}

function drawBresenham(x1, y1, x2, y2, color = "#000") {
  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1;
  let sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    plot(x1, y1, color);
    if (x1 === x2 && y1 === y2) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x1 += sx; }
    if (e2 < dx) { err += dx; y1 += sy; }
  }
}

function drawCircle(xc, yc, r, color = "#000") {
  let x = 0, y = r;
  let p = 1 - r;

  function sym(x, y) {
    plot(xc + x, yc + y, color);
    plot(xc - x, yc + y, color);
    plot(xc + x, yc - y, color);
    plot(xc - x, yc - y, color);
    plot(xc + y, yc + x, color);
    plot(xc - y, yc + x, color);
    plot(xc + y, yc - x, color);
    plot(xc - y, yc - x, color);
  }

  while (x <= y) {
    sym(x, y);
    x++;
    if (p < 0) p += 2 * x + 1;
    else { y--; p += 2 * (x - y) + 1; }
  }
}

/* =========================
   BASIC 2D TRANSFORMATIONS
========================= */
function updateTransformInfo() {
  const last = transformState.lastAlgoLabel ? ` | Last: ${transformState.lastAlgoLabel}` : "";
  transformInfo.textContent = `Vertices: ${transformState.vertices.length} | Closed: ${transformState.closed ? "Yes" : "No"}${last}`;
}

function clearTransformResult() {
  transformState.lastResult = null;
  transformState.lastAlgoLabel = "";
  updateTransformInfo();
}

function clonePoints(points) {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

function drawVertexMarkers(points, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (const p of points) {
    const cx = Math.round(toCanvasX(p.x)) - 2;
    const cy = Math.round(toCanvasY(p.y)) - 2;
    ctx.fillRect(cx, cy, 5, 5);
  }
  ctx.restore();
}

function drawShapeLabel(points, label, color) {
  if (points.length === 0) return;
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "12px Segoe UI";
  ctx.fillText(label, toCanvasX(Math.round(cx)) + 8, toCanvasY(Math.round(cy)) - 8);
  ctx.restore();
}

function draw2DObject(points, closed, color, label) {
  if (points.length === 0) return;
  for (let i = 0; i < points.length - 1; i++) {
    drawBresenham(
      Math.round(points[i].x),
      Math.round(points[i].y),
      Math.round(points[i + 1].x),
      Math.round(points[i + 1].y),
      color
    );
  }
  if (closed && points.length >= 3) {
    const a = points[points.length - 1];
    const b = points[0];
    drawBresenham(Math.round(a.x), Math.round(a.y), Math.round(b.x), Math.round(b.y), color);
  }
  drawVertexMarkers(points, color);
  if (label) drawShapeLabel(points, label, color);
}

function renderTransformScene() {
  draw2DObject(
    transformState.vertices,
    transformState.closed,
    "#4a4a4a",
    transformState.closed ? "Original" : "Object"
  );

  if (transformState.lastResult && transformState.closed) {
    draw2DObject(transformState.lastResult, true, "#1d4ed8", transformState.lastAlgoLabel);
  }
}

function applyTranslation(points, dx, dy) {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

function applyScaling(points, sx, sy, pivot) {
  return points.map((p) => ({
    x: pivot.x + (p.x - pivot.x) * sx,
    y: pivot.y + (p.y - pivot.y) * sy,
  }));
}

function applyRotation2D(points, angleDeg, pivot) {
  const a = degToRad(angleDeg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return points.map((p) => {
    const rx = p.x - pivot.x;
    const ry = p.y - pivot.y;
    return {
      x: pivot.x + rx * c - ry * s,
      y: pivot.y + rx * s + ry * c,
    };
  });
}

function applyShearing(points, shx, shy, pivot) {
  return points.map((p) => {
    const rx = p.x - pivot.x;
    const ry = p.y - pivot.y;
    return {
      x: pivot.x + rx + shx * ry,
      y: pivot.y + shy * rx + ry,
    };
  });
}

function applyReflection(points, mode) {
  return points.map((p) => {
    if (mode === "x-axis") return { x: p.x, y: -p.y };
    if (mode === "y-axis") return { x: -p.x, y: p.y };
    if (mode === "origin") return { x: -p.x, y: -p.y };
    if (mode === "y=x") return { x: p.y, y: p.x };
    return { x: -p.y, y: -p.x };
  });
}

/* =========================
   CLIPPING ALGORITHMS
========================= */
function updateClipPolyInfo() {
  const last = clipState.lastAlgoLabel ? ` | Last: ${clipState.lastAlgoLabel}` : "";
  clipPolyInfo.textContent = `Vertices: ${clipState.vertices.length} | Closed: ${clipState.closed ? "Yes" : "No"}${last}`;
}

function clearClipResult() {
  clipState.lastType = "";
  clipState.lastOriginal = null;
  clipState.lastResult = null;
  clipState.lastAccepted = null;
  clipState.lastAlgoLabel = "";
  updateClipPolyInfo();
}

function getClipWindow() {
  const xmin = Number(clipXMinInput.value);
  const ymin = Number(clipYMinInput.value);
  const xmax = Number(clipXMaxInput.value);
  const ymax = Number(clipYMaxInput.value);

  if (![xmin, ymin, xmax, ymax].every(Number.isFinite)) return null;

  return {
    xmin: Math.min(xmin, xmax),
    xmax: Math.max(xmin, xmax),
    ymin: Math.min(ymin, ymax),
    ymax: Math.max(ymin, ymax),
  };
}

function drawRectangleWorld(rect, color = "#111", label = "") {
  drawBresenham(rect.xmin, rect.ymin, rect.xmax, rect.ymin, color);
  drawBresenham(rect.xmax, rect.ymin, rect.xmax, rect.ymax, color);
  drawBresenham(rect.xmax, rect.ymax, rect.xmin, rect.ymax, color);
  drawBresenham(rect.xmin, rect.ymax, rect.xmin, rect.ymin, color);

  if (label) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "12px Segoe UI";
    ctx.fillText(label, toCanvasX(rect.xmin) + 6, toCanvasY(rect.ymax) - 8);
    ctx.restore();
  }
}

function drawLineSegmentWorld(line, color, label = "") {
  drawBresenham(Math.round(line.x1), Math.round(line.y1), Math.round(line.x2), Math.round(line.y2), color);
  drawVertexMarkers([{ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }], color);

  if (label) {
    const mid = {
      x: (line.x1 + line.x2) / 2,
      y: (line.y1 + line.y2) / 2,
    };
    drawShapeLabel([mid], label, color);
  }
}

const OUT_LEFT = 1;
const OUT_RIGHT = 2;
const OUT_BOTTOM = 4;
const OUT_TOP = 8;

function computeOutCode(x, y, rect) {
  let code = 0;
  if (x < rect.xmin) code |= OUT_LEFT;
  else if (x > rect.xmax) code |= OUT_RIGHT;
  if (y < rect.ymin) code |= OUT_BOTTOM;
  else if (y > rect.ymax) code |= OUT_TOP;
  return code;
}

function cohenSutherlandClip(line, rect) {
  let { x1, y1, x2, y2 } = line;
  let code1 = computeOutCode(x1, y1, rect);
  let code2 = computeOutCode(x2, y2, rect);
  let accept = false;

  while (true) {
    if (!(code1 | code2)) {
      accept = true;
      break;
    }
    if (code1 & code2) break;

    const outCode = code1 ? code1 : code2;
    let x = 0;
    let y = 0;

    if (outCode & OUT_TOP) {
      x = x1 + ((x2 - x1) * (rect.ymax - y1)) / (y2 - y1);
      y = rect.ymax;
    } else if (outCode & OUT_BOTTOM) {
      x = x1 + ((x2 - x1) * (rect.ymin - y1)) / (y2 - y1);
      y = rect.ymin;
    } else if (outCode & OUT_RIGHT) {
      y = y1 + ((y2 - y1) * (rect.xmax - x1)) / (x2 - x1);
      x = rect.xmax;
    } else {
      y = y1 + ((y2 - y1) * (rect.xmin - x1)) / (x2 - x1);
      x = rect.xmin;
    }

    if (outCode === code1) {
      x1 = x;
      y1 = y;
      code1 = computeOutCode(x1, y1, rect);
    } else {
      x2 = x;
      y2 = y;
      code2 = computeOutCode(x2, y2, rect);
    }
  }

  return {
    accepted: accept,
    clipped: accept ? { x1, y1, x2, y2 } : null,
  };
}

function clipAgainstEdge(vertices, isInside, intersect) {
  const out = [];
  if (vertices.length === 0) return out;

  let prev = vertices[vertices.length - 1];
  let prevInside = isInside(prev);

  for (const curr of vertices) {
    const currInside = isInside(curr);

    if (currInside) {
      if (!prevInside) out.push(intersect(prev, curr));
      out.push(curr);
    } else if (prevInside) {
      out.push(intersect(prev, curr));
    }

    prev = curr;
    prevInside = currInside;
  }

  return out;
}

function intersectVertical(a, b, xEdge) {
  if (a.x === b.x) return { x: xEdge, y: a.y };
  const t = (xEdge - a.x) / (b.x - a.x);
  return { x: xEdge, y: a.y + t * (b.y - a.y) };
}

function intersectHorizontal(a, b, yEdge) {
  if (a.y === b.y) return { x: a.x, y: yEdge };
  const t = (yEdge - a.y) / (b.y - a.y);
  return { x: a.x + t * (b.x - a.x), y: yEdge };
}

function sutherlandHodgmanClip(vertices, rect) {
  let out = clonePoints(vertices);

  out = clipAgainstEdge(out, (p) => p.x >= rect.xmin, (a, b) => intersectVertical(a, b, rect.xmin));
  out = clipAgainstEdge(out, (p) => p.x <= rect.xmax, (a, b) => intersectVertical(a, b, rect.xmax));
  out = clipAgainstEdge(out, (p) => p.y >= rect.ymin, (a, b) => intersectHorizontal(a, b, rect.ymin));
  out = clipAgainstEdge(out, (p) => p.y <= rect.ymax, (a, b) => intersectHorizontal(a, b, rect.ymax));

  return out;
}

function renderClipScene() {
  const rect = getClipWindow();
  if (!rect) return;

  drawRectangleWorld(rect, "#111", "Clipping Window");

  if (clipState.lastType === "line" && clipState.lastOriginal) {
    drawLineSegmentWorld(clipState.lastOriginal, "#777", "Original Line");
    if (clipState.lastAccepted && clipState.lastResult) {
      drawLineSegmentWorld(clipState.lastResult, "#1d4ed8", "Clipped Line");
    }
    return;
  }

  if (clipState.lastType === "polygon" && clipState.lastOriginal) {
    draw2DObject(clipState.lastOriginal, true, "#777", "Original Polygon");
    if (clipState.lastResult && clipState.lastResult.length > 0) {
      draw2DObject(clipState.lastResult, clipState.lastResult.length >= 3, "#1d4ed8", "Clipped Polygon");
    }
    return;
  }

  if (algoSel.value === "cohen") {
    const line = {
      x1: Number(clipLineX1Input.value),
      y1: Number(clipLineY1Input.value),
      x2: Number(clipLineX2Input.value),
      y2: Number(clipLineY2Input.value),
    };
    if ([line.x1, line.y1, line.x2, line.y2].every(Number.isFinite)) {
      drawLineSegmentWorld(line, "#777", "Original Line");
    }
  } else {
    draw2DObject(clipState.vertices, clipState.closed, "#777", clipState.closed ? "Original Polygon" : "Polygon");
  }
}

/* =========================
   FILL HELPERS
========================= */
function updatePolyInfo() {
  polyInfo.textContent = `Vertices: ${fillState.vertices.length} | Closed: ${fillState.closed ? "Yes" : "No"}`;
}
function updateSeedInfo() {
  if (!fillState.seed) seedInfo.textContent = `Seed: (not set)`;
  else seedInfo.textContent = `Seed: (${fillState.seed.x}, ${fillState.seed.y})`;
}

function drawPolygonOutline(vertices, closed, color = "#ff0000") {
  if (vertices.length === 0) return;
  for (let i = 0; i < vertices.length - 1; i++) {
    drawBresenham(vertices[i].x, vertices[i].y, vertices[i + 1].x, vertices[i + 1].y, color);
  }
  if (closed && vertices.length >= 3) {
    const a = vertices[vertices.length - 1];
    const b = vertices[0];
    drawBresenham(a.x, a.y, b.x, b.y, color);
  }
}

function polygonYBounds(vertices) {
  let ymin = Infinity, ymax = -Infinity;
  for (const v of vertices) {
    ymin = Math.min(ymin, v.y);
    ymax = Math.max(ymax, v.y);
  }
  return { ymin: Math.floor(ymin), ymax: Math.ceil(ymax) };
}

function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function sameRGBA(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

// canvas pixel access: world(x,y) -> canvas coords
function inCanvasWorld(x, y) {
  const cx = toCanvasX(x);
  const cy = toCanvasY(y);
  return cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT;
}

function getPixelRGBA(imgData, x, y) {
  const cx = toCanvasX(x);
  const cy = toCanvasY(y);
  if (cx < 0 || cx >= WIDTH || cy < 0 || cy >= HEIGHT) return null;
  const idx = (Math.floor(cy) * WIDTH + Math.floor(cx)) * 4;
  const d = imgData.data;
  return [d[idx], d[idx + 1], d[idx + 2], d[idx + 3]];
}

function setPixelRGBA(imgData, x, y, rgba) {
  const cx = toCanvasX(x);
  const cy = toCanvasY(y);
  if (cx < 0 || cx >= WIDTH || cy < 0 || cy >= HEIGHT) return false;
  const idx = (Math.floor(cy) * WIDTH + Math.floor(cx)) * 4;
  const d = imgData.data;
  d[idx] = rgba[0];
  d[idx + 1] = rgba[1];
  d[idx + 2] = rgba[2];
  d[idx + 3] = rgba[3];
  return true;
}

/* =========================
   SCANLINE FILL (Step-by-step)
   - Builds a pixel queue in scanline order
========================= */
function buildScanlineQueue(vertices, fillHex) {
  const fillRGBA = hexToRGBA(fillHex);
  const { ymin, ymax } = polygonYBounds(vertices);

  const q = [];
  // For each scanline y, compute intersections with edges
  for (let y = ymin; y <= ymax; y++) {
    const xInts = [];
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];

      // ignore horizontal edges for intersection counting
      if (v1.y === v2.y) continue;

      const yMinEdge = Math.min(v1.y, v2.y);
      const yMaxEdge = Math.max(v1.y, v2.y);

      // classic scanline rule: include y in [yMin, yMax)
      if (y >= yMinEdge && y < yMaxEdge) {
        const t = (y - v1.y) / (v2.y - v1.y);
        const x = v1.x + t * (v2.x - v1.x);
        xInts.push(x);
      }
    }

    xInts.sort((a, b) => a - b);

    for (let k = 0; k + 1 < xInts.length; k += 2) {
      const xStart = Math.ceil(xInts[k]);
      const xEnd = Math.floor(xInts[k + 1]);
      for (let x = xStart; x <= xEnd; x++) {
        q.push({ x, y, rgba: fillRGBA });
      }
    }
  }
  return q;
}

/* =========================
   BOUNDARY / FLOOD FILL (Step-by-step)
   Uses imageData buffer, fills in batches
========================= */
function buildBoundaryFillQueue(seed, boundaryHex, fillHex) {
  // Support multiple boundary colors (comma-separated hex values)
  const boundaryHexes = boundaryHex.split(',').map(h => h.trim());
  const boundaryRGBAs = boundaryHexes.map(h => hexToRGBA(h));
  const fillRGBA = hexToRGBA(fillHex);

  const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);

  // Helper: check if pixel matches any boundary color
  function isBoundary(px) {
    return boundaryRGBAs.some(br => sameRGBA(px, br));
  }

  // If seed is on boundary or already fill, nothing to do
  const seedPx = getPixelRGBA(img, seed.x, seed.y);
  if (!seedPx) return { img, q: [] };
  if (isBoundary(seedPx) || sameRGBA(seedPx, fillRGBA)) return { img, q: [] };

  const q = [];
  const stack = [seed];
  const seen = new Set();

  while (stack.length) {
    const p = stack.pop();
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!inCanvasWorld(p.x, p.y)) continue;

    const c = getPixelRGBA(img, p.x, p.y);
    if (!c) continue;
    if (isBoundary(c) || sameRGBA(c, fillRGBA)) continue;

    q.push({ x: p.x, y: p.y, rgba: fillRGBA });

    stack.push({ x: p.x + 1, y: p.y });
    stack.push({ x: p.x - 1, y: p.y });
    stack.push({ x: p.x, y: p.y + 1 });
    stack.push({ x: p.x, y: p.y - 1 });
  }

  return { img, q };
}

function buildFloodFillQueue(seed, targetHex, fillHex) {
  const targetRGBA = hexToRGBA(targetHex);
  const fillRGBA = hexToRGBA(fillHex);

  const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);

  const seedPx = getPixelRGBA(img, seed.x, seed.y);
  if (!seedPx) return { img, q: [] };
  // Flood fill replaces only target color
  if (!sameRGBA(seedPx, targetRGBA) && sameRGBA(seedPx, fillRGBA)) return { img, q: [] };

  const q = [];
  const stack = [seed];
  const seen = new Set();

  while (stack.length) {
    const p = stack.pop();
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!inCanvasWorld(p.x, p.y)) continue;

    const c = getPixelRGBA(img, p.x, p.y);
    if (!c) continue;
    if (!sameRGBA(c, targetRGBA)) continue;

    q.push({ x: p.x, y: p.y, rgba: fillRGBA });

    stack.push({ x: p.x + 1, y: p.y });
    stack.push({ x: p.x - 1, y: p.y });
    stack.push({ x: p.x, y: p.y + 1 });
    stack.push({ x: p.x, y: p.y - 1 });
  }

  return { img, q };
}

/* =========================
   3D: OBJECTS + MATH
========================= */
function degToRad(d) { return (d * Math.PI) / 180; }

function rotXYZ(p, ax, ay, az) {
  // rotate around X
  let x = p.x, y = p.y, z = p.z;
  let cx = Math.cos(ax), sx = Math.sin(ax);
  let cy = Math.cos(ay), sy = Math.sin(ay);
  let cz = Math.cos(az), sz = Math.sin(az);

  // X
  let y1 = y * cx - z * sx;
  let z1 = y * sx + z * cx;
  y = y1; z = z1;

  // Y
  let x2 = x * cy + z * sy;
  let z2 = -x * sy + z * cy;
  x = x2; z = z2;

  // Z
  let x3 = x * cz - y * sz;
  let y3 = x * sz + y * cz;

  return { x: x3, y: y3, z };
}

function sub3(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function cross(a, b) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }

function projectOrtho(p) {
  // orthographic projection onto x-y plane (screen)
  return { x: Math.round(p.x), y: Math.round(p.y), z: p.z };
}

function makeCube(scale) {
  const s = scale;
  const V = [
    { x: -s, y: -s, z: -s }, { x:  s, y: -s, z: -s }, { x:  s, y:  s, z: -s }, { x: -s, y:  s, z: -s },
    { x: -s, y: -s, z:  s }, { x:  s, y: -s, z:  s }, { x:  s, y:  s, z:  s }, { x: -s, y:  s, z:  s },
  ];

  // faces as quads (will triangulate)
  const faces = [
    { idx: [0, 1, 2, 3], color: "#ff6b6b" }, // back (-z)
    { idx: [4, 5, 6, 7], color: "#4dabf7" }, // front (+z)
    { idx: [0, 4, 7, 3], color: "#51cf66" }, // left
    { idx: [1, 5, 6, 2], color: "#ffd43b" }, // right
    { idx: [3, 2, 6, 7], color: "#9775fa" }, // top
    { idx: [0, 1, 5, 4], color: "#ffa94d" }, // bottom
  ];
  return { V, faces };
}

function makePyramid(scale) {
  const s = scale;
  const V = [
    { x: -s, y: -s, z: -s },
    { x:  s, y: -s, z: -s },
    { x:  s, y: -s, z:  s },
    { x: -s, y: -s, z:  s },
    { x:  0, y:  s, z:  0 }, // apex
  ];
  const faces = [
    { idx: [0, 1, 2, 3], color: "#4dabf7" }, // base
    { idx: [0, 1, 4], color: "#ff6b6b" },
    { idx: [1, 2, 4], color: "#51cf66" },
    { idx: [2, 3, 4], color: "#ffd43b" },
    { idx: [3, 0, 4], color: "#9775fa" },
  ];
  return { V, faces };
}

function triangulateFace(idxArr) {
  // idxArr length 3 => already triangle
  if (idxArr.length === 3) return [idxArr];
  // quad => two triangles
  if (idxArr.length === 4) return [
    [idxArr[0], idxArr[1], idxArr[2]],
    [idxArr[0], idxArr[2], idxArr[3]],
  ];
  // fallback fan triangulation
  const tris = [];
  for (let i = 1; i + 1 < idxArr.length; i++) {
    tris.push([idxArr[0], idxArr[i], idxArr[i + 1]]);
  }
  return tris;
}

function build3DScene() {
  const scale = Number(scale3dInput.value) || 120;
  const objName = object3dSel.value;

  const ax = degToRad(Number(rotX.value));
  const ay = degToRad(Number(rotY.value));
  const az = degToRad(Number(rotZ.value));

  const model = (objName === "cube") ? makeCube(scale) : makePyramid(scale);

  // transform vertices
  const Vt = model.V.map(v => rotXYZ(v, ax, ay, az));

  // build polygons in transformed space + projected space
  const polys = model.faces.map(f => {
    const pts3 = f.idx.map(i => Vt[i]);
    const pts2 = pts3.map(p => projectOrtho(p));
    const avgZ = pts3.reduce((s, p) => s + p.z, 0) / pts3.length;

    // normal from first 3 vertices (in 3D space)
    const e1 = sub3(pts3[1], pts3[0]);
    const e2 = sub3(pts3[2], pts3[0]);
    const n = cross(e1, e2);

    return { pts3, pts2, color: f.color, avgZ, normal: n };
  });

  return polys;
}

/* =========================
   3D RENDERING MODES
========================= */
function renderBackFaceCulling(polys) {
  // view direction: camera looks along -Z, so "towards viewer" is +Z normal
  const viewDir = { x: 0, y: 0, z: -1 };

  // keep faces whose normal points toward camera (dot(normal, viewDir) < 0)
  const visible = polys.filter(p => dot(p.normal, viewDir) < 0);

  // draw outlines + fill
  for (const p of visible) {
    fillPolygonCanvas(p.pts2, p.color);
    strokePolygonCanvas(p.pts2, "#111");
  }

  setStatus(`Back-Face Culling: visible faces = ${visible.length}/${polys.length}`);
}

function renderPainter(polys) {
  // painter: far-to-near (more negative z is farther if camera looks -Z)
  const sorted = [...polys].sort((a, b) => a.avgZ - b.avgZ);
  for (const p of sorted) {
    fillPolygonCanvas(p.pts2, p.color);
    strokePolygonCanvas(p.pts2, "#111");
  }
  setStatus(`Painter's Algorithm: polygons drawn in depth order (avgZ).`);
}

function fillPolygonCanvas(pts2, color) {
  if (pts2.length < 3) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(pts2[0].x), toCanvasY(pts2[0].y));
  for (let i = 1; i < pts2.length; i++) {
    ctx.lineTo(toCanvasX(pts2[i].x), toCanvasY(pts2[i].y));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function strokePolygonCanvas(pts2, color) {
  if (pts2.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(pts2[0].x), toCanvasY(pts2[0].y));
  for (let i = 1; i < pts2.length; i++) {
    ctx.lineTo(toCanvasX(pts2[i].x), toCanvasY(pts2[i].y));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/* =========================
   Z-BUFFER (Per pixel) using triangles
========================= */
function renderZBuffer(polys) {
  // Build triangles
  const tris = [];
  for (const p of polys) {
    const idx = [...Array(p.pts3.length).keys()];
    const triIdxs = triangulateFace(idx);
    for (const t of triIdxs) {
      const a3 = p.pts3[t[0]], b3 = p.pts3[t[1]], c3 = p.pts3[t[2]];
      const a2 = projectOrtho(a3), b2 = projectOrtho(b3), c2 = projectOrtho(c3);
      tris.push({ a3, b3, c3, a2, b2, c2, color: p.color });
    }
  }

  // init zbuffer
  const zbuf = new Float32Array(WIDTH * HEIGHT);
  zbuf.fill(Number.POSITIVE_INFINITY); // store "closest" using smaller depth? We'll use camera at z=+inf looking -Z:
  // Use depth = -z (bigger z => closer if looking -Z), but easiest: compare by z directly with reversed sense.
  // We'll store depth = -z, smaller is closer? If z is larger (closer), -z is smaller -> yes.
  // So compare smaller depth.
  const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const data = img.data;

  function putCanvasPixel(cx, cy, rgba) {
    if (cx < 0 || cx >= WIDTH || cy < 0 || cy >= HEIGHT) return;
    const idx = (cy * WIDTH + cx) * 4;
    data[idx] = rgba[0];
    data[idx + 1] = rgba[1];
    data[idx + 2] = rgba[2];
    data[idx + 3] = 255;
  }

  function hexToRGB(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  // Rasterize each triangle
  for (const t of tris) {
    const x0 = Math.floor(Math.min(t.a2.x, t.b2.x, t.c2.x));
    const x1 = Math.ceil(Math.max(t.a2.x, t.b2.x, t.c2.x));
    const y0 = Math.floor(Math.min(t.a2.y, t.b2.y, t.c2.y));
    const y1 = Math.ceil(Math.max(t.a2.y, t.b2.y, t.c2.y));

    const rgb = hexToRGB(t.color);

    // barycentric in 2D
    const Ax = t.a2.x, Ay = t.a2.y;
    const Bx = t.b2.x, By = t.b2.y;
    const Cx = t.c2.x, Cy = t.c2.y;

    const denom = (By - Cy) * (Ax - Cx) + (Cx - Bx) * (Ay - Cy);
    if (denom === 0) continue;

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const w1 = ((By - Cy) * (x - Cx) + (Cx - Bx) * (y - Cy)) / denom;
        const w2 = ((Cy - Ay) * (x - Cx) + (Ax - Cx) * (y - Cy)) / denom;
        const w3 = 1 - w1 - w2;

        if (w1 >= 0 && w2 >= 0 && w3 >= 0) {
          // interpolate z in 3D
          const z = w1 * t.a3.z + w2 * t.b3.z + w3 * t.c3.z;
          const depth = -z;

          const cxp = Math.round(toCanvasX(x));
          const cyp = Math.round(toCanvasY(y));

          if (cxp < 0 || cxp >= WIDTH || cyp < 0 || cyp >= HEIGHT) continue;

          const zi = cyp * WIDTH + cxp;
          if (depth < zbuf[zi]) {
            zbuf[zi] = depth;
            putCanvasPixel(cxp, cyp, [rgb[0], rgb[1], rgb[2], 255]);
          }
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  setStatus(`Z-Buffer: per-pixel visibility resolved (depth test).`);
}

/* =========================
   STEP ENGINE (queue-driven)
========================= */
function runQueuePixelOps(imgDataOpt = null) {
  stopAnimation();
  setStep(0);

  if (animation.queue.length === 0) {
    setStatus("Nothing to visualize.");
    return;
  }

  animation.running = true;

  const batchSize = 1200; // pixels per frame
  animation.timer = setInterval(() => {
    let count = 0;

    // If using imageData buffer, apply there and flush per frame
    const img = imgDataOpt;

    while (count < batchSize && animation.queue.length > 0) {
      const op = animation.queue.shift();

      if (op && op.type === "pixel" && img) {
        setPixelRGBA(img, op.x, op.y, op.rgba);
      } else if (op && op.type === "pixel") {
        plot(op.x, op.y, rgbaToHex(op.rgba));
      }

      count++;
      animation.step++;
    }

    setStep(animation.step);

    if (img) ctx.putImageData(img, 0, 0);

    if (animation.queue.length === 0) {
      stopAnimation();
      setStatus("Done.");
    }
  }, 1000 / animation.fps);
}

function rgbaToHex(rgba) {
  const r = rgba[0].toString(16).padStart(2, "0");
  const g = rgba[1].toString(16).padStart(2, "0");
  const b = rgba[2].toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function doOneStep(imgDataOpt = null) {
  if (animation.queue.length === 0) {
    setStatus("No steps available.");
    return;
  }

  const img = imgDataOpt;
  const batch = 600;

  let count = 0;
  while (count < batch && animation.queue.length > 0) {
    const op = animation.queue.shift();
    if (op && op.type === "pixel" && img) setPixelRGBA(img, op.x, op.y, op.rgba);
    else if (op && op.type === "pixel") plot(op.x, op.y, rgbaToHex(op.rgba));
    count++;
    animation.step++;
  }
  setStep(animation.step);
  if (img) ctx.putImageData(img, 0, 0);
  if (animation.queue.length === 0) setStatus("Done.");
}

/* =========================
   CONTROLLERS
========================= */
function resetCanvas() {
  stopAnimation();
  drawGrid();

  if (categorySel.value === "transform") {
    renderTransformScene();
  }

  if (categorySel.value === "clip") {
    renderClipScene();
  }

  // redraw polygon outline if in fill mode
  if (categorySel.value === "fill") {
    // show polygon edges in boundary color to support boundary fill
    const bc = boundaryColorInput.value;
    drawPolygonOutline(fillState.vertices, fillState.closed, bc);
    if (fillState.seed) plot(fillState.seed.x, fillState.seed.y, "#00aa00");
  }

  setStatus("Cleared.");
  setStep(0);
}

function refreshAlgorithmList() {
  const cat = categorySel.value;
  algoSel.innerHTML = "";
  for (const a of ALGO_LIST[cat]) {
    const opt = document.createElement("option");
    opt.value = a.value;
    opt.textContent = a.label;
    algoSel.appendChild(opt);
  }
}

function refreshPanels() {
  const cat = categorySel.value;
  panelBasic.classList.toggle("active", cat === "basic");
  panelTransform.classList.toggle("active", cat === "transform");
  panelClip.classList.toggle("active", cat === "clip");
  panelFill.classList.toggle("active", cat === "fill");
  panelHidden.classList.toggle("active", cat === "hidden");
}

/* =========================
   RUN ACTION
========================= */
function runSelectedAlgorithm() {
  stopAnimation();
  setStep(0);
  drawGrid();

  const cat = categorySel.value;
  const algo = algoSel.value;

  if (cat === "basic") {
    const x1Str = x1Input.value, y1Str = y1Input.value, x2Str = x2Input.value, y2Str = y2Input.value;

    if (algo === "circle") {
      if (x1Str === "" || y1Str === "" || x2Str === "") {
        alert("For Circle: enter center (x, y) and radius");
        return;
      }
    } else {
      if (x1Str === "" || y1Str === "" || x2Str === "" || y2Str === "") {
        alert("For Line: enter x1, y1, x2, y2");
        return;
      }
    }

    const x1 = Number(x1Str), y1 = Number(y1Str), x2 = Number(x2Str), y2 = Number(y2Str);

    if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || (algo !== "circle" && !Number.isFinite(y2))) {
      alert("Invalid numeric input");
      return;
    }

    if (algo === "dda") drawDDA(x1, y1, x2, y2);
    else if (algo === "bresenham") drawBresenham(x1, y1, x2, y2);
    else drawCircle(x1, y1, x2);

    setStatus("Rendered basic algorithm.");
    return;
  }

  if (cat === "fill") {
    const bc = boundaryColorInput.value;
    drawPolygonOutline(fillState.vertices, fillState.closed, bc);

    const fillHex = fillColorInput.value;

    if (algo === "scanline") {
      if (!fillState.closed || fillState.vertices.length < 3) {
        alert("Scan-line fill needs a closed polygon (>=3 vertices).");
        return;
      }
      const qpx = buildScanlineQueue(fillState.vertices, fillHex).map(p => ({ type: "pixel", ...p }));
      animation.queue = qpx;
      setStatus(`Scan-Line Fill: ${qpx.length} pixels queued.`);
      runQueuePixelOps(null);
      return;
    }

    if (algo === "boundary") {
      if (!fillState.seed) {
        alert("Boundary fill needs a seed point. Click inside the polygon.");
        return;
      }
      // boundary is drawn using boundary color already
      const { img, q } = buildBoundaryFillQueue(fillState.seed, bc, fillHex);
      animation.queue = q.map(p => ({ type: "pixel", ...p }));
      setStatus(`Boundary Fill: ${q.length} pixels queued.`);
      runQueuePixelOps(img);
      return;
    }

    // flood fill: target color is CURRENT color at seed (or user expects a "target" color).
    // Here we interpret "target" as the current seed pixel color.
    if (algo === "flood") {
      if (!fillState.seed) {
        alert("Flood fill needs a seed point. Click inside region.");
        return;
      }
      const img0 = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const seedRGBA = getPixelRGBA(img0, fillState.seed.x, fillState.seed.y);
      if (!seedRGBA) {
        alert("Seed is outside canvas.");
        return;
      }
      const targetHex = rgbaToHex(seedRGBA);
      const { img, q } = buildFloodFillQueue(fillState.seed, targetHex, fillHex);
      animation.queue = q.map(p => ({ type: "pixel", ...p }));
      setStatus(`Flood Fill (target = seed color ${targetHex}): ${q.length} pixels queued.`);
      runQueuePixelOps(img);
      return;
    }
  }

  if (cat === "transform") {
    if (!transformState.closed || transformState.vertices.length < 3) {
      renderTransformScene();
      alert("Create a closed 2D object with at least 3 vertices first.");
      return;
    }

    const tx = Number(txInput.value);
    const ty = Number(tyInput.value);
    const sx = Number(sxInput.value);
    const sy = Number(syInput.value);
    const angle = Number(angle2dInput.value);
    const shx = Number(shxInput.value);
    const shy = Number(shyInput.value);
    const pivot = { x: Number(pivotXInput.value), y: Number(pivotYInput.value) };

    const numericValues = [tx, ty, sx, sy, angle, shx, shy, pivot.x, pivot.y];
    if (numericValues.some((value) => !Number.isFinite(value))) {
      renderTransformScene();
      alert("Enter valid numeric values for the transformation parameters.");
      return;
    }

    const source = clonePoints(transformState.vertices);
    let result = source;

    if (algo === "translation") result = applyTranslation(source, tx, ty);
    else if (algo === "scaling") result = applyScaling(source, sx, sy, pivot);
    else if (algo === "rotation2d") result = applyRotation2D(source, angle, pivot);
    else if (algo === "shearing") result = applyShearing(source, shx, shy, pivot);
    else result = applyReflection(source, reflectionModeSel.value);

    transformState.lastResult = result;
    transformState.lastAlgoLabel = algoSel.options[algoSel.selectedIndex]?.textContent || "Transformation";
    updateTransformInfo();
    renderTransformScene();
    setStatus(`${transformState.lastAlgoLabel} applied to the current 2D object.`);
    return;
  }

  if (cat === "clip") {
    const rect = getClipWindow();
    if (!rect) {
      renderClipScene();
      alert("Enter valid clipping window coordinates.");
      return;
    }

    if (algo === "cohen") {
      const line = {
        x1: Number(clipLineX1Input.value),
        y1: Number(clipLineY1Input.value),
        x2: Number(clipLineX2Input.value),
        y2: Number(clipLineY2Input.value),
      };

      if (![line.x1, line.y1, line.x2, line.y2].every(Number.isFinite)) {
        renderClipScene();
        alert("Enter valid line coordinates.");
        return;
      }

      const result = cohenSutherlandClip(line, rect);
      clipState.lastType = "line";
      clipState.lastOriginal = line;
      clipState.lastResult = result.clipped;
      clipState.lastAccepted = result.accepted;
      clipState.lastAlgoLabel = algoSel.options[algoSel.selectedIndex]?.textContent || "Clipping";
      updateClipPolyInfo();
      renderClipScene();
      setStatus(result.accepted ? "Line clipped successfully." : "Line rejected: fully outside clipping window.");
      return;
    }

    if (!clipState.closed || clipState.vertices.length < 3) {
      renderClipScene();
      alert("Create and close a polygon before running polygon clipping.");
      return;
    }

    const original = clonePoints(clipState.vertices);
    const clipped = sutherlandHodgmanClip(original, rect);
    clipState.lastType = "polygon";
    clipState.lastOriginal = original;
    clipState.lastResult = clipped;
    clipState.lastAccepted = clipped.length > 0;
    clipState.lastAlgoLabel = algoSel.options[algoSel.selectedIndex]?.textContent || "Clipping";
    updateClipPolyInfo();
    renderClipScene();
    setStatus(clipped.length > 0 ? `Polygon clipped successfully. Output vertices: ${clipped.length}` : "Polygon rejected: no visible area inside clipping window.");
    return;
  }

  if (cat === "hidden") {
    const polys = build3DScene();

    // for these modes, we render in one pass (still “step” button works only for fill visualization)
    if (algo === "backface") renderBackFaceCulling(polys);
    else if (algo === "painter") renderPainter(polys);
    else renderZBuffer(polys);
  }
}

/* =========================
   STEP ACTION
========================= */
function stepOnce() {
  const cat = categorySel.value;
  const algo = algoSel.value;

  if (cat !== "fill") {
    setStatus("Step mode is designed for Polygon Filling visualization.");
    return;
  }

  // For boundary/flood we need current image data each step, so store one in a closure:
  // simplest: re-run algorithm preparation if queue empty
  if (animation.queue.length === 0) {
    setStatus("No queued steps. Press Run first.");
    return;
  }

  // If last run used imageData, we can’t reconstruct it here easily, so Step is best after Run (which starts the interval).
  // But we still support step by applying direct plotting if not using imageData.
  // We detect by checking status text:
  // Practical approach: do a one-step with imageData snapshot each click.
  const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  doOneStep(img);
}

/* =========================
   CANVAS INTERACTION
   - Fill mode: click to add vertex (if polygon not closed)
   - Or set seed (if polygon closed OR boundary/flood selected)
========================= */
canvas.addEventListener("click", (e) => {
  const cat = categorySel.value;
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const x = Math.round(toWorldX(cx));
  const y = Math.round(toWorldY(cy));

  if (cat === "transform") {
    if (transformState.closed) {
      setStatus("Object already closed. Use Reset Object to create a new one.");
      return;
    }
    transformState.vertices.push({ x, y });
    clearTransformResult();
    updateTransformInfo();
    resetCanvas();
    setStatus(`Object vertex added: (${x}, ${y})`);
    return;
  }

  if (cat === "clip" && algoSel.value === "sutherland") {
    if (clipState.closed) {
      setStatus("Polygon already closed. Use Reset Polygon to create a new one.");
      return;
    }
    clipState.vertices.push({ x, y });
    clearClipResult();
    updateClipPolyInfo();
    resetCanvas();
    setStatus(`Clipping polygon vertex added: (${x}, ${y})`);
    return;
  }

  if (cat !== "fill") return;

  // if polygon not closed: add vertex
  if (!fillState.closed) {
    fillState.vertices.push({ x, y });
    updatePolyInfo();
    resetCanvas();
    setStatus(`Vertex added: (${x}, ${y})`);
    return;
  }

  // polygon closed: set seed
  fillState.seed = { x, y };
  updateSeedInfo();
  resetCanvas();
  plot(x, y, "#00aa00");
  setStatus(`Seed set: (${x}, ${y})`);
});

/* =========================
   FILL BUTTONS
========================= */
btnClosePoly.addEventListener("click", () => {
  if (fillState.vertices.length < 3) {
    alert("Need at least 3 vertices to close polygon.");
    return;
  }
  fillState.closed = true;
  updatePolyInfo();
  resetCanvas();
  setStatus("Polygon closed.");
});

btnUndoVertex.addEventListener("click", () => {
  if (fillState.vertices.length === 0) return;
  fillState.vertices.pop();
  updatePolyInfo();
  resetCanvas();
  setStatus("Last vertex removed.");
});

btnResetPoly.addEventListener("click", () => {
  fillState.vertices = [];
  fillState.closed = false;
  fillState.seed = null;
  updatePolyInfo();
  updateSeedInfo();
  resetCanvas();
  setStatus("Polygon reset.");
});

/* =========================
   TRANSFORMATION BUTTONS
========================= */
btnCloseTransform.addEventListener("click", () => {
  if (transformState.vertices.length < 3) {
    alert("Need at least 3 vertices to close a 2D object.");
    return;
  }
  transformState.closed = true;
  clearTransformResult();
  resetCanvas();
  setStatus("2D object closed.");
});

btnUndoTransform.addEventListener("click", () => {
  if (transformState.vertices.length === 0) return;
  if (transformState.closed) transformState.closed = false;
  transformState.vertices.pop();
  clearTransformResult();
  resetCanvas();
  setStatus("Last object vertex removed.");
});

btnResetTransform.addEventListener("click", () => {
  transformState.vertices = [];
  transformState.closed = false;
  clearTransformResult();
  resetCanvas();
  setStatus("2D object reset.");
});

/* =========================
   CLIPPING BUTTONS
========================= */
btnCloseClipPoly.addEventListener("click", () => {
  if (clipState.vertices.length < 3) {
    alert("Need at least 3 vertices to close a polygon.");
    return;
  }
  clipState.closed = true;
  clearClipResult();
  resetCanvas();
  setStatus("Clipping polygon closed.");
});

btnUndoClipVertex.addEventListener("click", () => {
  if (clipState.vertices.length === 0) return;
  if (clipState.closed) clipState.closed = false;
  clipState.vertices.pop();
  clearClipResult();
  resetCanvas();
  setStatus("Last clipping polygon vertex removed.");
});

btnResetClipPoly.addEventListener("click", () => {
  clipState.vertices = [];
  clipState.closed = false;
  clearClipResult();
  resetCanvas();
  setStatus("Clipping polygon reset.");
});

/* =========================
   ROTATION LABELS
========================= */
function syncRotLabels() {
  rotXv.textContent = rotX.value;
  rotYv.textContent = rotY.value;
  rotZv.textContent = rotZ.value;
}
[rotX, rotY, rotZ].forEach(sl => sl.addEventListener("input", () => {
  syncRotLabels();
  if (categorySel.value === "hidden") runSelectedAlgorithm();
}));

/* =========================
   SPEED
========================= */
function syncSpeed() {
  animation.fps = Number(speedRange.value);
  speedLabel.textContent = `${animation.fps} fps`;
  if (animation.running) {
    // restart with new fps
    const q = animation.queue;
    stopAnimation();
    animation.queue = q;
    // continue
    runQueuePixelOps(null);
  }
}
speedRange.addEventListener("input", syncSpeed);

[
  clipXMinInput,
  clipYMinInput,
  clipXMaxInput,
  clipYMaxInput,
  clipLineX1Input,
  clipLineY1Input,
  clipLineX2Input,
  clipLineY2Input,
].forEach((input) => {
  input.addEventListener("input", () => {
    if (categorySel.value === "clip") {
      clearClipResult();
      resetCanvas();
    }
  });
});

/* =========================
   CATEGORY + ALGO CHANGES
========================= */
categorySel.addEventListener("change", () => {
  stopAnimation();
  refreshAlgorithmList();
  refreshPanels();
  resetCanvas();

  if (categorySel.value === "fill") {
    updatePolyInfo();
    updateSeedInfo();
    setStatus("Fill mode: click to add vertices, close polygon, then run fill.");
  } else if (categorySel.value === "transform") {
    updateTransformInfo();
    setStatus("Transformation mode: click to add vertices, close the object, choose a transformation, then run.");
  } else if (categorySel.value === "clip") {
    updateClipPolyInfo();
    setStatus("Clipping mode: set the window, then either enter a line or build a polygon and run clipping.");
  } else if (categorySel.value === "hidden") {
    syncRotLabels();
    setStatus("Hidden surface mode: choose method + object, adjust rotation.");
    runSelectedAlgorithm();
  } else {
    setStatus("Basic mode ready.");
  }
});

algoSel.addEventListener("change", () => {
  stopAnimation();
  setStep(0);
  if (categorySel.value === "transform") clearTransformResult();
  if (categorySel.value === "clip") clearClipResult();
  resetCanvas();
});

gridModeSel.addEventListener("change", resetCanvas);

/* =========================
   MAIN BUTTONS
========================= */
btnRun.addEventListener("click", runSelectedAlgorithm);
btnStep.addEventListener("click", stepOnce);
btnClear.addEventListener("click", () => {
  // Clear everything but keep state for fill mode
  stopAnimation();
  drawGrid();
  setStep(0);
  setStatus("Canvas cleared (state preserved).");
  if (categorySel.value === "fill") {
    // redraw outline if exists
    const bc = boundaryColorInput.value;
    drawPolygonOutline(fillState.vertices, fillState.closed, bc);
    if (fillState.seed) plot(fillState.seed.x, fillState.seed.y, "#00aa00");
  } else if (categorySel.value === "transform") {
    renderTransformScene();
  } else if (categorySel.value === "clip") {
    renderClipScene();
  }
});

/* =========================
   INIT
========================= */
function init() {
  refreshAlgorithmList();
  refreshPanels();
  syncSpeed();
  syncRotLabels();
  updatePolyInfo();
  updateSeedInfo();
  updateTransformInfo();
  updateClipPolyInfo();
  drawGrid();
  setStatus("Ready.");
}
init();
