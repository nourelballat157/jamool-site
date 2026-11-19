import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useRewards } from "@/components/feature/RewardProvider";
import { addCreation, getState, removeCreation } from "@/store/progress";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 680;

/** saved artworks are kept small so localStorage stays light */
const SAVE_MAX_SIDE = 480;
const SAVE_QUALITY = 0.72;
const STORE_KEY = "ajyal_progress_v2";

type SaveState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "empty" }
  | { status: "full"; hasOlder: boolean };

/* The drawing palette is a functional exception: these are the real pigments a child paints with. */
const PALETTE_SWATCHES = [
  { hex: "#1f2937", name: "أسود" },
  { hex: "#ef4444", name: "أحمر" },
  { hex: "#f97316", name: "برتقالي" },
  { hex: "#facc15", name: "أصفر" },
  { hex: "#22c55e", name: "أخضر" },
  { hex: "#14b8a6", name: "فيروزي" },
  { hex: "#3b82f6", name: "أزرق" },
  { hex: "#8b5cf6", name: "بنفسجي" },
  { hex: "#ec4899", name: "وردي" },
  { hex: "#a16207", name: "بني" },
  { hex: "#ffffff", name: "أبيض" },
];
const PALETTE = PALETTE_SWATCHES.map((s) => s.hex);

const SIZES = [6, 14, 26, 40];
const SIZE_NAMES: Record<number, string> = { 6: "رفيع", 14: "متوسط", 26: "عريض", 40: "عريض جدًا" };

type Tool = "pen" | "eraser";

type StudioCanvasProps = {
  templateImage?: string;
  templateLabel?: string;
  onSave?: () => void;
};

export default function StudioCanvas({ templateImage, templateLabel, onSave }: StudioCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const templateRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const undoRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const pendingImageRef = useRef<{ image: string; kind: "drawing" | "coloring"; title: string } | null>(null);
  const { notify, announce } = useRewards();

  const [color, setColor] = useState(PALETTE[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [tool, setTool] = useState<Tool>("pen");
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const [confirmClear, setConfirmClear] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });

  const syncHistory = () => setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    undoRef.current = [];
    redoRef.current = [];
  }, []);

  useEffect(() => {
    if (!templateImage) {
      templateRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateRef.current = img;
    };
    img.onerror = () => {
      templateRef.current = null;
    };
    img.src = templateImage;
  }, [templateImage]);

  const getPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  const snapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    undoRef.current.push(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    if (undoRef.current.length > 20) undoRef.current.shift();
    redoRef.current = [];
    syncHistory();
    if (saveState.status !== "idle") setSaveState({ status: "idle" });
  };

  const applyStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    snapshot();
    drawingRef.current = true;
    const point = getPoint(event);
    lastRef.current = point;
    applyStyle(ctx);
    ctx.beginPath();
    ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const point = getPoint(event);
    const last = lastRef.current;
    if (!last) return;
    applyStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastRef.current = point;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const handleUndo = () => {
    const ctx = canvasRef.current?.getContext("2d");
    const data = undoRef.current.pop();
    if (!ctx || !data) return;
    redoRef.current.push(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    ctx.globalCompositeOperation = "source-over";
    ctx.putImageData(data, 0, 0);
    syncHistory();
  };

  const handleRedo = () => {
    const ctx = canvasRef.current?.getContext("2d");
    const data = redoRef.current.pop();
    if (!ctx || !data) return;
    undoRef.current.push(ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    ctx.globalCompositeOperation = "source-over";
    ctx.putImageData(data, 0, 0);
    syncHistory();
  };

  /** true when the drawing layer has at least one painted pixel */
  const hasInk = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return false;
    try {
      const { data } = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] > 0) return true;
      }
    } catch {
      return true;
    }
    return false;
  };

  const handleClear = () => {
    if (!hasInk()) return;
    setConfirmClear(true);
  };

  const clearBoard = () => {
    const ctx = canvasRef.current?.getContext("2d");
    setConfirmClear(false);
    if (!ctx) return;
    snapshot();
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  /** Flatten template + drawing on white and downscale to a small JPEG data URL. */
  const buildSmallJpeg = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const scale = Math.min(1, SAVE_MAX_SIDE / Math.max(CANVAS_WIDTH, CANVAS_HEIGHT));
    const width = Math.round(CANVAS_WIDTH * scale);
    const height = Math.round(CANVAS_HEIGHT * scale);
    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const octx = out.getContext("2d");
    if (!octx) return null;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, width, height);

    const template = templateRef.current;
    if (template && template.naturalWidth > 0) {
      try {
        // same look as on screen: contained inside the board with soft padding and 60% opacity
        const rect = canvas.getBoundingClientRect();
        const pad = rect.width > 0 ? (24 / rect.width) * width : width * 0.03;
        const boxW = width - pad * 2;
        const boxH = height - pad * 2;
        const ratio = Math.min(boxW / template.naturalWidth, boxH / template.naturalHeight);
        const drawW = template.naturalWidth * ratio;
        const drawH = template.naturalHeight * ratio;
        octx.globalAlpha = 0.6;
        octx.drawImage(template, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
        octx.globalAlpha = 1;
      } catch {
        octx.globalAlpha = 1;
      }
    }
    try {
      octx.drawImage(canvas, 0, 0, width, height);
      return out.toDataURL("image/jpeg", SAVE_QUALITY);
    } catch {
      return null;
    }
  };

  const isStored = (id: string) => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      return Boolean(raw && raw.includes(`"id":"${id}"`));
    } catch {
      return false;
    }
  };

  /** Adds the creation and makes sure it really reached storage (the store swallows quota errors). */
  const tryStore = (item: { image: string; kind: "drawing" | "coloring"; title: string }): boolean => {
    const result = addCreation(item);
    const state = getState();
    const newest = state.data[state.activeChildId]?.creations[0];
    if (newest && isStored(newest.id)) {
      announce(result);
      notify("تم حفظ رسمتك في غرفتي", "ri-image-2-line");
      return true;
    }
    // storage is full: undo the in-memory add so memory and storage agree
    if (newest) removeCreation(newest.id);
    return false;
  };

  const handleSaveToRoom = () => {
    if (!hasInk()) {
      setSaveState({ status: "empty" });
      return;
    }
    const image = buildSmallJpeg();
    if (!image) {
      setSaveState({ status: "full", hasOlder: false });
      return;
    }
    const item = {
      image,
      kind: templateImage ? ("coloring" as const) : ("drawing" as const),
      title: templateImage ? `تلوين ${templateLabel ?? "رسمة"}` : "رسمتي الجميلة",
    };
    pendingImageRef.current = item;
    if (tryStore(item)) {
      pendingImageRef.current = null;
      setSaveState({ status: "saved" });
    } else {
      const state = getState();
      setSaveState({ status: "full", hasOlder: (state.data[state.activeChildId]?.creations.length ?? 0) > 0 });
    }
  };

  const handleDeleteOldestAndRetry = () => {
    const state = getState();
    const list = state.data[state.activeChildId]?.creations ?? [];
    const oldest = list[list.length - 1];
    if (oldest) removeCreation(oldest.id);
    const pending = pendingImageRef.current;
    if (pending && tryStore(pending)) {
      pendingImageRef.current = null;
      setSaveState({ status: "saved" });
      return;
    }
    const after = getState();
    setSaveState({ status: "full", hasOlder: (after.data[after.activeChildId]?.creations.length ?? 0) > 0 });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = CANVAS_WIDTH;
    out.height = CANVAS_HEIGHT;
    const octx = out.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (templateRef.current) {
      try {
        octx.drawImage(templateRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } catch {
        /* template unavailable for export — skip */
      }
    }
    try {
      octx.drawImage(canvas, 0, 0);
    } catch {
      /* drawing layer unavailable — keep what we have */
    }
    try {
      const link = document.createElement("a");
      link.href = out.toDataURL("image/png");
      link.download = "my-drawing.png";
      link.click();
    } catch {
      /* export blocked — ignore */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card overflow-hidden bg-background-100 !p-0 shadow-[0_26px_44px_-26px_rgb(120_70_0/0.45)]">
        {/* the studio's title bar */}
        <div className="flex items-center justify-between gap-3 border-b border-amber-900/10 bg-gradient-to-b from-amber-50 to-amber-100/70 px-3 py-2 md:px-4">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="h-2 w-2 rounded-full bg-leaf-500" />
            </span>
            <span className="font-heading text-sm font-bold text-foreground-800">استوديو الرسم</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-900/10">
            <i className={tool === "eraser" ? "ri-eraser-line" : "ri-brush-line"} aria-hidden="true" />
            {templateLabel ? `تلوين: ${templateLabel}` : tool === "eraser" ? "الممحاة" : "رسم حر"}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* tools */}
          <div role="group" aria-label="الأدوات" className="flex items-center gap-1 rounded-full bg-background-50 p-1">
            <button
              type="button"
              onClick={() => setTool("pen")}
              aria-pressed={tool === "pen"}
              aria-label="قلم الرسم"
              title="قلم الرسم"
              className={`btn-icon text-xl ${tool === "pen" ? "!bg-primary-500 !text-foreground-900" : "!bg-transparent"}`}
            >
              <i className="ri-pen-nib-line" />
            </button>
            <button
              type="button"
              onClick={() => setTool("eraser")}
              aria-pressed={tool === "eraser"}
              aria-label="الممحاة"
              title="الممحاة"
              className={`btn-icon text-xl ${tool === "eraser" ? "!bg-primary-500 !text-foreground-900" : "!bg-transparent"}`}
            >
              <i className="ri-eraser-line" />
            </button>
          </div>

          {/* brush sizes */}
          <div role="group" aria-label="سمك القلم" className="flex items-center gap-1 rounded-full bg-background-50 p-1">
            {SIZES.map((thickness) => (
              <button
                key={thickness}
                type="button"
                aria-label={`سمك القلم ${SIZE_NAMES[thickness] ?? thickness}`}
                title={SIZE_NAMES[thickness]}
                onClick={() => setSize(thickness)}
                aria-pressed={size === thickness}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  size === thickness ? "bg-primary-200" : "hover:bg-background-100"
                }`}
              >
                <span
                  className="rounded-full bg-foreground-900"
                  style={{ width: `${Math.min(thickness, 22)}px`, height: `${Math.min(thickness, 22)}px` }}
                />
              </button>
            ))}
          </div>

          {/* history */}
          <div role="group" aria-label="التراجع والإعادة" className="flex items-center gap-1 rounded-full bg-background-50 p-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.undo === 0}
              aria-label="تراجع"
              title="تراجع"
              className="btn-icon text-xl !bg-transparent disabled:cursor-default disabled:opacity-40"
            >
              <i className="ri-arrow-go-back-line" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={history.redo === 0}
              aria-label="إعادة"
              title="إعادة"
              className="btn-icon text-xl !bg-transparent disabled:cursor-default disabled:opacity-40"
            >
              <i className="ri-arrow-go-forward-line" />
            </button>
            <button type="button" onClick={handleClear} aria-label="امسح الكل" title="امسح الكل" className="btn-icon text-xl !bg-transparent">
              <i className="ri-brush-2-line" />
            </button>
          </div>
        </div>

        {/* colours */}
        <div role="group" aria-label="الألوان" className="flex flex-wrap items-center gap-0.5 rounded-3xl bg-background-50 px-2 py-1">
          {PALETTE_SWATCHES.map((swatch) => {
            const active = color === swatch.hex && tool === "pen";
            return (
              <button
                key={swatch.hex}
                type="button"
                aria-label={`لون ${swatch.name}`}
                aria-pressed={active}
                title={swatch.name}
                onClick={() => {
                  setColor(swatch.hex);
                  setTool("pen");
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full cursor-pointer"
              >
                <span
                  style={{ backgroundColor: swatch.hex }}
                  className={`block h-8 w-8 rounded-full border-2 transition-transform ${
                    active ? "scale-110 border-foreground-900 ring-2 ring-primary-300" : "border-background-300 hover:scale-110"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* save / share */}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleSaveToRoom} className="btn btn-primary btn-sm">
            <i className="ri-heart-add-line" />
            احفظ في غرفتي
          </button>
          <button type="button" onClick={handleDownload} className="btn btn-secondary btn-sm">
            <i className="ri-download-2-line" />
            احفظ صورة
          </button>
          {onSave ? (
            <button type="button" onClick={onSave} className="btn btn-ghost btn-sm">
              <i className="ri-upload-cloud-2-line" />
              ارفع رسمتك
            </button>
          ) : null}
        </div>
        </div>
      </div>

      <div aria-live="polite">
        {saveState.status === "saved" ? (
          <div className="animate-rise-in flex flex-wrap items-center gap-3 rounded-3xl bg-accent-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xl text-background-50">
              <i className="ri-check-line" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-bold text-foreground-900">تم حفظ رسمتك في غرفتي</p>
              <p className="text-sm font-medium text-foreground-600">ستجدها هناك كلما أردت أن تراها من جديد.</p>
            </div>
            <Link to="/room" className="btn btn-ghost btn-sm">
              <i className="ri-door-open-line" />
              افتح غرفتي
            </Link>
          </div>
        ) : null}
        {saveState.status === "empty" ? (
          <div className="animate-rise-in flex items-center gap-3 rounded-3xl bg-primary-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl text-foreground-900">
              <i className="ri-brush-line" />
            </span>
            <p className="flex-1 text-sm font-bold text-foreground-800">ارسم شيئًا جميلًا أولًا، ثم احفظه في غرفتي.</p>
          </div>
        ) : null}
        {saveState.status === "full" ? (
          <div className="animate-rise-in flex flex-wrap items-center gap-3 rounded-3xl bg-primary-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl text-foreground-900">
              <i className="ri-archive-drawer-line" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-bold text-foreground-900">غرفتي ممتلئة قليلًا</p>
              <p className="text-sm font-medium text-foreground-700">
                لم أستطع حفظ رسمتك الآن. {saveState.hasOlder ? "يمكنك حذف أقدم رسمة في غرفتي لنفسح مكانًا لها، أو حفظها كصورة." : "يمكنك حفظها كصورة على جهازك."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {saveState.hasOlder ? (
                <button type="button" onClick={handleDeleteOldestAndRetry} className="btn btn-primary btn-sm">
                  <i className="ri-delete-bin-6-line" />
                  احذف أقدم رسمة واحفظ
                </button>
              ) : (
                <button type="button" onClick={handleDownload} className="btn btn-primary btn-sm">
                  <i className="ri-download-2-line" />
                  احفظ صورة
                </button>
              )}
              <button type="button" onClick={() => setSaveState({ status: "idle" })} className="btn btn-ghost btn-sm">
                ليس الآن
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-[0_30px_50px_-28px_rgb(120_70_0/0.5),inset_0_2px_8px_rgb(120_70_0/0.1)] ring-1 ring-amber-900/15">
        <div className="relative aspect-[1000/680] w-full bg-[radial-gradient(rgb(200_140_60/0.2)_1.2px,transparent_1.8px)] [background-size:20px_20px]">
          {templateImage ? (
            <img
              src={templateImage}
              alt={templateLabel || "رسمة للتلوين"}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain p-6 opacity-60"
            />
          ) : null}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="لوح الرسم"
            className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
            onPointerCancel={endStroke}
          />
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs font-medium leading-relaxed text-foreground-500">
        <i className="ri-lightbulb-line mt-0.5 text-base text-primary-500" />
        {templateImage
          ? "لوّن فوق الرسمة بقلمك، وامسح أي خطأ بالممحاة. تقدر ترجع خطوة للوراء أو تحفظ اللوحة كصورة."
          : "ارسم بحرّية على اللوح الأبيض، اختر لونك وسمك القلم، وامسح أي خطأ بالممحاة."}
      </p>

      {confirmClear ? (
        <div role="dialog" aria-modal="true" aria-label="مسح اللوحة" className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setConfirmClear(false)}
            className="absolute inset-0 h-full w-full cursor-pointer bg-foreground-950/50"
          />
          <div className="card relative z-10 w-full max-w-sm p-6 text-center animate-rise-in">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-3xl text-secondary-600">
              <i className="ri-brush-2-line" />
            </span>
            <h3 className="mt-4 font-heading text-xl font-bold text-foreground-900">هل تمسح الرسمة كلها؟</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-600">
              ستبدأ من لوحة نظيفة. لا تقلق، يمكنك الضغط على «تراجع» لإعادتها.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={clearBoard} className="btn btn-primary">
                نعم، امسح الكل
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-ghost">
                لا، أكمل الرسم
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
