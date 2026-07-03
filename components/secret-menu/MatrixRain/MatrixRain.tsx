"use client";

import { useEffect, useRef } from "react";
import styles from "./MatrixRain.module.scss";

// ── Ingredient words — each column shows one complete word ──
const WORDS = [
  "SMASH", "SECRET", "PATTY", "CHEESE", "BACON",
  "SAUCE", "BURGER", "LETTUCE", "ONION", "TOMATO",
  "PICKLE", "BRIOCHE", "GRILL", "FLAME", "CRISPY",
  "SMOKY", "MELTED", "STACKED", "JUICY", "SIZZLE",
];

// ── Layer config for parallax depth ───────────────────
const LAYERS = [
  { speed: 0.3, fontSize: 10, opacity: 0.15, scrollFactor: 0.2 },  // far
  { speed: 0.6, fontSize: 14, opacity: 0.3,  scrollFactor: 0.5 },  // mid
  { speed: 1.0, fontSize: 18, opacity: 0.5,  scrollFactor: 1.0 },  // near
];

// ── Column type ───────────────────────────────────────
interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  trailLength: number;
}

// ── Create columns for a single layer ─────────────────
function createColumns(
  width: number,
  height: number,
  fontSize: number,
  speed: number,
): Column[] {
  const columns: Column[] = [];
  const colCount = Math.floor(width / (fontSize * 1.2));

  for (let i = 0; i < colCount; i++) {
    // ── Each column gets one complete word ──
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];

    columns.push({
      x: i * (fontSize * 1.2),
      y: Math.random() * height * -1,              // start above screen
      speed: speed * (0.5 + Math.random() * 0.5),  // slight speed variation
      chars: word.split(""),
      trailLength: word.length,
    });
  }

  return columns;
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollOffset = useRef(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Size canvas to window ──
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Track scroll for parallax ──
    const handleScroll = () => {
      scrollOffset.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    // ── Create column sets for each layer ──
    const layerData = LAYERS.map((layer) => ({
      ...layer,
      columns: createColumns(canvas.width, canvas.height, layer.fontSize, layer.speed),
    }));

    // ── Animation loop ──
    const animate = () => {

      // ── Fade trail — semi-transparent black over previous frame ──
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      layerData.forEach((layer) => {
        ctx.font = `bold ${layer.fontSize}px "Courier New", monospace`;

        // ── Parallax scroll offset for this layer ──
        const parallax = scrollOffset.current * layer.scrollFactor;

        layer.columns.forEach((col) => {

          // ── Draw each character in the trail ──
          for (let i = 0; i < col.trailLength; i++) {
            const charY = col.y - i * layer.fontSize + parallax;

            // ── Skip if off screen ──
            if (charY < -layer.fontSize || charY > canvas.height + layer.fontSize) continue;

            // ── Head character is brightest, trail fades ──
            const brightness = i === 0 ? 1 : Math.max(0, 1 - i / col.trailLength);
            const green = Math.floor(100 + brightness * 155);
            ctx.fillStyle = `rgba(${Math.floor(brightness * 50)}, ${green}, ${Math.floor(brightness * 30)}, ${layer.opacity * brightness})`;

            // ── Read characters top-to-bottom ──
            const char = col.chars[(col.trailLength - 1 - i) % col.chars.length];
            ctx.fillText(char, col.x, charY);
          }

          // ── Move column down ──
          col.y += col.speed;

          // ── Reset when trail fully leaves screen ──
          if (col.y - col.trailLength * layer.fontSize + parallax > canvas.height) {
            const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
            col.y = Math.random() * -300;
            col.chars = newWord.split("");
            col.trailLength = newWord.length;
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}