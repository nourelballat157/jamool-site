/**
 * Geometry + scoring for the tracing step. Everything works on a square area
 * and stores the child's strokes in normalised (0..1) coordinates, so strokes
 * survive resizing and can be rasterised at any resolution.
 */

export type Pt = { x: number; y: number };
export type Stroke = Pt[];

export const GRID = 24;
/** offscreen raster size: 6 px per grid cell */
const HI = GRID * 6;
/** brush width as a fraction of the square side */
export const BRUSH = 0.085;

const GLYPH_CELL_MIN = 0.15;
const INK_CELL_MIN = 0.1;
/** ink further than this many cells from the glyph counts as "far outside" */
const STRAY_RADIUS = 2;

export const THRESHOLD = 0.78;
export const EASY_THRESHOLD = 0.55;

export type GlyphLayout = { size: number; x: number; y: number };

/** Fits the glyph in the middle of an S×S square and returns font size + origin. */
export function glyphLayout(
  ctx: CanvasRenderingContext2D,
  glyph: string,
  S: number,
  family: string
): GlyphLayout {
  const probe = 200;
  ctx.font = `800 ${probe}px ${family}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(glyph);
  const left = m.actualBoundingBoxLeft;
  const right = m.actualBoundingBoxRight;
  const asc = m.actualBoundingBoxAscent;
  const desc = m.actualBoundingBoxDescent;
  const bw = Math.max(1, left + right);
  const bh = Math.max(1, asc + desc);
  const scale = Math.min((S * 0.74) / bw, (S * 0.68) / bh);
  const size = probe * scale;
  return {
    size,
    x: S / 2 - ((right - left) / 2) * scale,
    y: S / 2 + ((asc - desc) / 2) * scale,
  };
}

export function paintGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: string,
  S: number,
  family: string,
  fill: string | null,
  outline: string | null
) {
  const layout = glyphLayout(ctx, glyph, S, family);
  ctx.font = `800 ${layout.size}px ${family}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillText(glyph, layout.x, layout.y);
  }
  if (outline) {
    ctx.save();
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(1.5, S * 0.006);
    ctx.setLineDash([S * 0.02, S * 0.02]);
    ctx.lineJoin = "round";
    ctx.strokeText(glyph, layout.x, layout.y);
    ctx.restore();
  }
}

function tracePath(ctx: CanvasRenderingContext2D, stroke: Stroke, S: number) {
  ctx.beginPath();
  const first = stroke[0];
  ctx.moveTo(first.x * S, first.y * S);
  if (stroke.length === 1) {
    ctx.lineTo(first.x * S + 0.01, first.y * S + 0.01);
    return;
  }
  for (let i = 1; i < stroke.length - 1; i += 1) {
    const mx = ((stroke[i].x + stroke[i + 1].x) / 2) * S;
    const my = ((stroke[i].y + stroke[i + 1].y) / 2) * S;
    ctx.quadraticCurveTo(stroke[i].x * S, stroke[i].y * S, mx, my);
  }
  const last = stroke[stroke.length - 1];
  ctx.lineTo(last.x * S, last.y * S);
}

/** Paints strokes with a thick, soft, round brush. */
export function paintStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  S: number,
  color: string,
  glow: string | null
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    if (glow) {
      ctx.strokeStyle = glow;
      ctx.lineWidth = S * BRUSH * 1.55;
      tracePath(ctx, stroke, S);
      ctx.stroke();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = S * BRUSH;
    tracePath(ctx, stroke, S);
    ctx.stroke();
  }
}

function cellsFrom(ctx: CanvasRenderingContext2D, min: number): Uint8Array {
  const { data } = ctx.getImageData(0, 0, HI, HI);
  const cell = HI / GRID;
  const out = new Uint8Array(GRID * GRID);
  for (let cy = 0; cy < GRID; cy += 1) {
    for (let cx = 0; cx < GRID; cx += 1) {
      let on = 0;
      for (let y = 0; y < cell; y += 1) {
        for (let x = 0; x < cell; x += 1) {
          const idx = ((cy * cell + y) * HI + (cx * cell + x)) * 4 + 3;
          if (data[idx] > 110) on += 1;
        }
      }
      if (on / (cell * cell) >= min) out[cy * GRID + cx] = 1;
    }
  }
  return out;
}

function offscreen(): CanvasRenderingContext2D | null {
  const canvas = document.createElement("canvas");
  canvas.width = HI;
  canvas.height = HI;
  return canvas.getContext("2d", { willReadFrequently: true });
}

export type GlyphMask = { cells: Uint8Array; near: Uint8Array; count: number };

/** Rasterises the glyph on the coarse grid (and a dilated "near the glyph" area). */
export function buildGlyphMask(glyph: string, family: string): GlyphMask | null {
  const ctx = offscreen();
  if (!ctx) return null;
  ctx.clearRect(0, 0, HI, HI);
  paintGlyph(ctx, glyph, HI, family, "rgb(0,0,0)", null);
  const cells = cellsFrom(ctx, GLYPH_CELL_MIN);
  const near = new Uint8Array(GRID * GRID);
  let count = 0;
  for (let cy = 0; cy < GRID; cy += 1) {
    for (let cx = 0; cx < GRID; cx += 1) {
      if (!cells[cy * GRID + cx]) continue;
      count += 1;
      for (let dy = -STRAY_RADIUS; dy <= STRAY_RADIUS; dy += 1) {
        for (let dx = -STRAY_RADIUS; dx <= STRAY_RADIUS; dx += 1) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) near[ny * GRID + nx] = 1;
        }
      }
    }
  }
  return { cells, near, count };
}

export type TraceScore = {
  /** share of glyph cells the child covered, 0..1 */
  coverage: number;
  /** share of the child's ink that is far from the glyph, 0..1 */
  stray: number;
  /** final score used for the meter and the stars, 0..1 */
  score: number;
  inkCells: number;
};

export function scoreStrokes(strokes: Stroke[], mask: GlyphMask): TraceScore {
  const empty: TraceScore = { coverage: 0, stray: 0, score: 0, inkCells: 0 };
  if (strokes.length === 0 || mask.count === 0) return empty;
  const ctx = offscreen();
  if (!ctx) return empty;
  ctx.clearRect(0, 0, HI, HI);
  paintStrokes(ctx, strokes, HI, "rgb(0,0,0)", null);
  const ink = cellsFrom(ctx, INK_CELL_MIN);

  let hit = 0;
  let inkCells = 0;
  let far = 0;
  for (let i = 0; i < ink.length; i += 1) {
    if (!ink[i]) continue;
    inkCells += 1;
    if (mask.cells[i]) hit += 1;
    if (!mask.near[i]) far += 1;
  }
  const coverage = hit / mask.count;
  const stray = inkCells === 0 ? 0 : far / inkCells;
  const penalty = Math.max(0, stray - 0.1) * 1;
  const score = Math.min(1, Math.max(0, coverage - penalty));
  return { coverage, stray, score, inkCells };
}

export const starsFor = (score: number): 1 | 2 | 3 => (score >= 0.92 ? 3 : score >= 0.84 ? 2 : 1);
