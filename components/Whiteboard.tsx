"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";
import type { Role, RoomApi } from "@/lib/useRoomChannel";

// Repère logique fixe : tout le monde voit exactement le même tableau, quelle que soit la taille d'écran.
const W = 1000;
const H = 700;
const SCALE = 2; // résolution interne ×2 pour des traits nets

type Tool = "pen" | "eraser";

interface Stroke {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  /** [x0, y0, x1, y1, ...] */
  pts: number[];
}

interface DrawPayload {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  pts: number[];
}

const COLORS = [
  { name: "Noir", v: "#17324d" },
  { name: "Bleu", v: "#1565c0" },
  { name: "Rouge", v: "#c62828" },
  { name: "Vert", v: "#2e7d32" },
  { name: "Orange", v: "#ef6c00" },
];
const WIDTHS = [
  { name: "Fin", v: 2 },
  { name: "Moyen", v: 4 },
  { name: "Gros", v: 8 },
];

/** Dessine un trait (ou seulement sa fin, à partir du point `fromPt`). */
function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, fromPt = 0) {
  const n = s.pts.length / 2;
  if (n === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (n === 1) {
    ctx.beginPath();
    ctx.arc(s.pts[0], s.pts[1], s.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const start = Math.max(fromPt - 1, 0);
    ctx.beginPath();
    ctx.moveTo(s.pts[start * 2], s.pts[start * 2 + 1]);
    for (let i = start + 1; i < n; i++) ctx.lineTo(s.pts[i * 2], s.pts[i * 2 + 1]);
    ctx.stroke();
  }
  ctx.restore();
}

/** Garde les traits les plus récents sous la limite de 256 Ko par message. */
function trimForSync(strokes: Stroke[], limit = 200_000): Stroke[] {
  const out: Stroke[] = [];
  let size = 0;
  for (let i = strokes.length - 1; i >= 0; i--) {
    const len = JSON.stringify(strokes[i]).length;
    if (size + len > limit) break;
    size += len;
    out.unshift(strokes[i]);
  }
  return out;
}

export default function Whiteboard({
  room,
  role,
  code,
}: {
  room: RoomApi;
  role: Role;
  code: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const mapRef = useRef(new Map<string, Stroke>());
  const lockedRef = useRef(false);
  const drawingRef = useRef<{
    stroke: Stroke;
    sent: number;
    timer: ReturnType<typeof setInterval>;
  } | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `scopeark:board:${code}`;

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(role === "prof" ? "#c62828" : "#1565c0");
  const [width, setWidth] = useState(4);
  const [locked, setLocked] = useState(false);

  const getCtx = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    return ctx;
  }, []);

  const redraw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    strokesRef.current.forEach((s) => drawStroke(ctx, s));
  }, [getCtx]);

  const persistSoon = useCallback(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(strokesRef.current));
      } catch {
        /* ignore */
      }
    }, 400);
  }, [storageKey]);

  const setStrokes = useCallback(
    (list: Stroke[]) => {
      strokesRef.current = list;
      mapRef.current = new Map(list.map((s) => [s.id, s]));
      redraw();
      persistSoon();
    },
    [redraw, persistSoon]
  );

  const applyLocked = useCallback((v: boolean) => {
    lockedRef.current = v;
    setLocked(v);
  }, []);

  // Restaure le tableau après un rafraîchissement de la page
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) setStrokes(list as Stroke[]);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, setStrokes]);

  // Messages reçus de l'autre personne
  useEffect(() => {
    const offs = [
      room.subscribe("draw", (p: DrawPayload) => {
        let s = mapRef.current.get(p.id);
        if (!s) {
          s = { id: p.id, tool: p.tool, color: p.color, width: p.width, pts: [] };
          mapRef.current.set(p.id, s);
          strokesRef.current.push(s);
        }
        const from = s.pts.length / 2;
        for (const v of p.pts) s.pts.push(v);
        const ctx = getCtx();
        if (ctx) drawStroke(ctx, s, from);
        persistSoon();
      }),
      room.subscribe("undo", (p: { id: string }) => {
        setStrokes(strokesRef.current.filter((s) => s.id !== p.id));
      }),
      room.subscribe("clear", () => setStrokes([])),
      room.subscribe("lock", (p: { locked: boolean }) => applyLocked(!!p.locked)),
      room.subscribe("sync-request", () => {
        if (strokesRef.current.length > 0 || lockedRef.current) {
          room.send("sync-state", {
            strokes: trimForSync(strokesRef.current),
            locked: lockedRef.current,
          });
        }
      }),
      room.subscribe("sync-state", (p: { strokes?: Stroke[]; locked?: boolean }) => {
        if (strokesRef.current.length === 0 && Array.isArray(p.strokes)) setStrokes(p.strokes);
        applyLocked(!!p.locked);
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [room.subscribe, room.send, getCtx, persistSoon, setStrokes, applyLocked]);

  // Un nouvel arrivant demande l'état courant du tableau
  useEffect(() => {
    if (room.status === "connected") room.send("sync-request");
  }, [room.status, room.send]);

  useEffect(() => {
    return () => {
      if (drawingRef.current) clearInterval(drawingRef.current.timer);
    };
  }, []);

  function pos(e: RPointerEvent<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) * W) / r.width;
    const y = ((e.clientY - r.top) * H) / r.height;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }

  /** Envoie les nouveaux points du trait en cours (groupés pour limiter les messages). */
  function flush() {
    const d = drawingRef.current;
    if (!d) return;
    const total = d.stroke.pts.length;
    if (total > d.sent) {
      room.send("draw", {
        id: d.stroke.id,
        tool: d.stroke.tool,
        color: d.stroke.color,
        width: d.stroke.width,
        pts: d.stroke.pts.slice(d.sent),
      } satisfies DrawPayload);
      d.sent = total;
    }
  }

  function onDown(e: RPointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (role === "eleve" && lockedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    const stroke: Stroke = {
      id: `${role[0]}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color,
      width: tool === "eraser" ? width * 4 : width,
      pts: [x, y],
    };
    strokesRef.current.push(stroke);
    mapRef.current.set(stroke.id, stroke);
    const ctx = getCtx();
    if (ctx) drawStroke(ctx, stroke, 0);
    drawingRef.current = { stroke, sent: 0, timer: setInterval(flush, 100) };
  }

  function onMove(e: RPointerEvent<HTMLCanvasElement>) {
    const d = drawingRef.current;
    if (!d) return;
    const [x, y] = pos(e);
    const pts = d.stroke.pts;
    const lx = pts[pts.length - 2];
    const ly = pts[pts.length - 1];
    if (Math.hypot(x - lx, y - ly) < 0.6) return;
    const from = pts.length / 2;
    pts.push(x, y);
    const ctx = getCtx();
    if (ctx) drawStroke(ctx, d.stroke, from);
  }

  function endStroke() {
    const d = drawingRef.current;
    if (!d) return;
    clearInterval(d.timer);
    flush();
    drawingRef.current = null;
    persistSoon();
  }

  /** Annule le dernier trait de la personne elle-même. */
  function undo() {
    const prefix = role[0];
    const list = strokesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].id.startsWith(prefix)) {
        const id = list[i].id;
        setStrokes(list.filter((_, j) => j !== i));
        room.send("undo", { id });
        return;
      }
    }
  }

  function clearAll() {
    if (role !== "prof") return;
    if (!confirm("Effacer tout le tableau ?")) return;
    setStrokes([]);
    room.send("clear");
  }

  function toggleLock() {
    const v = !lockedRef.current;
    applyLocked(v);
    room.send("lock", { locked: v });
  }

  function savePng() {
    const c = canvasRef.current;
    if (!c) return;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const o = out.getContext("2d");
    if (!o) return;
    o.fillStyle = "#fff";
    o.fillRect(0, 0, out.width, out.height);
    o.drawImage(c, 0, 0);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/png");
    a.download = "tableau.png";
    a.click();
  }

  return (
    <div className="board">
      <div className="board-toolbar">
        <button
          className={`tool ${tool === "pen" ? "selected" : ""}`}
          onClick={() => setTool("pen")}
          aria-pressed={tool === "pen"}
        >
          Stylo
        </button>
        <button
          className={`tool ${tool === "eraser" ? "selected" : ""}`}
          onClick={() => setTool("eraser")}
          aria-pressed={tool === "eraser"}
        >
          Gomme
        </button>

        {COLORS.map((c) => (
          <button
            key={c.v}
            className={`swatch ${color === c.v && tool === "pen" ? "selected" : ""}`}
            style={{ background: c.v }}
            aria-label={c.name}
            title={c.name}
            onClick={() => {
              setColor(c.v);
              setTool("pen");
            }}
          />
        ))}

        {WIDTHS.map((w) => (
          <button
            key={w.v}
            className={`tool ${width === w.v ? "selected" : ""}`}
            onClick={() => setWidth(w.v)}
            aria-pressed={width === w.v}
          >
            {w.name}
          </button>
        ))}

        <button className="tool" onClick={undo}>
          Annuler
        </button>
        <button className="tool" onClick={savePng}>
          PNG
        </button>
        {role === "prof" && (
          <>
            <button className="tool" onClick={clearAll}>
              Tout effacer
            </button>
            <button className={`tool ${locked ? "selected" : ""}`} onClick={toggleLock}>
              {locked ? "Déverrouiller l'élève" : "Verrouiller l'élève"}
            </button>
          </>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="board-canvas"
        width={W * SCALE}
        height={H * SCALE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      />

      {role === "eleve" && locked && (
        <div className="board-lock">Le prof a verrouillé le tableau pour le moment.</div>
      )}
      {role === "prof" && locked && (
        <div className="board-lock">L'élève ne peut pas écrire : tableau verrouillé.</div>
      )}
    </div>
  );
}
