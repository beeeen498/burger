"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#f7e558", "#df2c8b", "#efefef", "#c2ff8b"];
const STROKE = "#1a1a1a";
const SHAPE_TYPES = ["circle", "donut", "halfCircle", "triangle", "star", "squiggle"] as const;
type ShapeType = typeof SHAPE_TYPES[number];

interface Shape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotSpeed: number;
  size: number;
  opacity: number;
  color: string;
  type: ShapeType;
}

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeShape(w: number, h: number): Shape {
  const depth = rnd(0, 1);
  const size = rnd(18, 42) * (0.5 + depth * 0.5);
  const speed = 0.08 + depth * 0.25;
  return {
    x: rnd(0, w),
    y: rnd(0, h),
    vx: rnd(-speed, speed) || speed,
    vy: rnd(-speed, speed) || speed,
    angle: rnd(0, Math.PI * 2),
    rotSpeed: rnd(-0.005, 0.005) * (0.3 + depth * 0.7),
    size,
    opacity: 0.4 + depth * 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const inner = r * 0.45;
  const points = 5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    i === 0
      ? ctx.moveTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius)
      : ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
  }
  ctx.closePath();
}

function drawSquiggle(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.bezierCurveTo(-size * 0.5, -size * 0.8, 0, size * 0.8, size * 0.5, -size * 0.4);
  ctx.bezierCurveTo(size * 0.8, -size, size * 1.2, size * 0.5, size, 0);
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.save();
  ctx.globalAlpha = s.opacity;
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = s.color;

  switch (s.type) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case "donut":
      ctx.beginPath();
      ctx.arc(0, 0, s.size, 0, Math.PI * 2);
      ctx.arc(0, 0, s.size * 0.45, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, s.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, s.size * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "halfCircle":
      ctx.beginPath();
      ctx.arc(0, 0, s.size, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case "triangle":
      const h = s.size * Math.sqrt(3) / 2;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.67);
      ctx.lineTo(s.size, h * 0.33);
      ctx.lineTo(-s.size, h * 0.33);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case "star":
      drawStar(ctx, 0, 0, s.size);
      ctx.fill();
      ctx.stroke();
      break;

    case "squiggle":
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = s.color;
      drawSquiggle(ctx, s.size);
      ctx.stroke();
      ctx.strokeStyle = STROKE;
      ctx.lineWidth = 2;
      drawSquiggle(ctx, s.size);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

const BackgroundCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let shapes: Shape[] = [];
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // setting the number of shapes
      shapes = Array.from({ length: 60 }, () => makeShape(canvas.width, canvas.height));
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of shapes) {
        s.x += s.vx;
        s.y += s.vy;
        s.angle += s.rotSpeed;
        if (s.x < -s.size * 2) s.x = canvas.width + s.size;
        if (s.x > canvas.width + s.size * 2) s.x = -s.size;
        if (s.y < -s.size * 2) s.y = canvas.height + s.size;
        if (s.y > canvas.height + s.size) s.y = -s.size;
        drawShape(ctx, s);
      }
      animId = requestAnimationFrame(tick);
    };

    resize();
    tick();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default BackgroundCanvas;