"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FaChevronDown } from "react-icons/fa";
import * as THREE from "three";
import Header from "@/components/global/Header/Header";
import BurgerErrorBoundary from "./BurgerErrorBoundary";
import styles from "./Hero.module.scss";

// ── localStorage key ──────────────────────────────────
const LS_BURGER_CLICKED = "secretMenu_burgerClicked";

// ── Marquee text ──────────────────────────────────────
const base = [
  "PICKLES",
  "SAUCE",
  "BEEF",
  "CHEESE",
  "ONIONS",
  "TOMATO",
  "LETTUCE",
];
const marqueeText = base.map((_, i) =>
  [...base.slice(i), ...base.slice(0, i)].join(" • "),
);

// ── Burger model with click escalation ────────────────
function BurgerModel({ clickCount }: { clickCount: number }) {
  const { scene } = useGLTF("/3d-models/burger.glb") as any;
  const floatRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const clock = useRef(0);

  // ── Animation state refs ──
  const pulseScale = useRef(1); // temporary scale bump that decays
  const wobbleAmount = useRef(0); // wobble intensity (persists between clicks)
  const spinSpeed = useRef(0.005); // base spin speed
  const floatTarget = useRef(0); // target Y offset for click 5 float-up
  const prevClickCount = useRef(0); // track previous click to detect new clicks
  const targetSpinSpeed = useRef(0.005); // what spinSpeed lerps toward
  const tiltTarget = useRef(0); // what the tilt lerps toward

  // ── Responsive scale refs ──
  const baseScale = useRef(1); // controlled by viewport width
  const floatAmplitude = useRef(0.3); // shrinks on smaller screens

  const clonedScene = useMemo(() => {
    const clone = scene.clone();

    // hide extra meshes before centering
    clone.traverse((obj: THREE.Object3D) => {
      if (
        obj.name === "poppy_bun" ||
        obj.name.startsWith("nuggets_") ||
        obj.name.startsWith("top_donut") ||
        obj.name.startsWith("bottom_donut") ||
        obj.name === "onion_rings" ||
        obj.name === "bottom_waffle" ||
        obj.name === "top_waffle" ||
        obj.name === "bottom_toast" ||
        obj.name === "top_toast" ||
        obj.name === "fried_egg" ||
        obj.name === "potato_chips" ||
        obj.name === "fried_fish"
      ) {
        obj.visible = false;
      }
    });

    // center from visible meshes only — prevents spin drift
    const box = new THREE.Box3();
    clone.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.visible) {
        const meshBox = new THREE.Box3().setFromObject(mesh);
        box.union(meshBox);
      }
    });
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    return clone;
  }, [scene]);

  // ── Responsive — scale burger and float radius to screen size ──
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;

      if (width <= 850) {
        baseScale.current = 0.7;
        floatAmplitude.current = 0.15;
      } else if (width <= 1200) {
        // smooth transition between 850 and 1200
        const t = (width - 850) / (1200 - 850);
        baseScale.current = 0.5 + t * 0.5;
        floatAmplitude.current = 0.15 + t * 0.15;
      } else {
        baseScale.current = 1;
        floatAmplitude.current = 0.3;
      }
    }

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── React to new clicks — set animation targets ──
  useEffect(() => {
    if (clickCount === 0 || clickCount === prevClickCount.current) return;
    prevClickCount.current = clickCount;

    switch (clickCount) {
      case 1:
        pulseScale.current = 1.03; // very subtle
        break;
      case 2:
        pulseScale.current = 1.06; // slightly bigger
        break;
      case 3:
        pulseScale.current = 1.08;
        wobbleAmount.current = 0.04; // noticeable wobble
        break;
      case 4:
        pulseScale.current = 1.1;
        wobbleAmount.current = 0.06;
        spinSpeed.current = 0.03; // faster spin
        break;
      case 5:
        pulseScale.current = 1.15;
        wobbleAmount.current = 0;
        spinSpeed.current = 0.4; // instant fast spin
        targetSpinSpeed.current = 0.4; // hold it fast
        floatTarget.current = 4; // float up higher
        tiltTarget.current = 0.52; // 30 degrees forward tilt

        // ── After 2 seconds, ease everything back to normal ──
        setTimeout(() => {
          targetSpinSpeed.current = 0.005; // lerps down gradually
          tiltTarget.current = 0; // lerps back to original tilt
          floatTarget.current = 0;
        }, 2000);
        break;
    }
  }, [clickCount]);

  useFrame((_, delta) => {
    if (!floatRef.current || !spinRef.current) return;
    clock.current += delta;

    // ── Float — base sine wave + click 5 float-up ──
    const baseFloat = Math.sin(clock.current) * floatAmplitude.current;
    const currentY = floatRef.current.position.y;
    const targetY = baseFloat + floatTarget.current;
    floatRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 0.05);

    // ── Tilt — lerp toward target ──
    floatRef.current.rotation.x = THREE.MathUtils.lerp(
      floatRef.current.rotation.x,
      tiltTarget.current,
      0.03,
    );

    // ── Spin — lerp speed toward target for smooth slowdown ──
    spinSpeed.current = THREE.MathUtils.lerp(
      spinSpeed.current,
      targetSpinSpeed.current,
      0.02,
    );
    spinRef.current.rotation.y += spinSpeed.current;

    // ── Wobble — oscillate on x and z axes ──
    if (wobbleAmount.current > 0) {
      spinRef.current.rotation.x =
        Math.sin(clock.current * 3) * wobbleAmount.current;
      spinRef.current.rotation.z =
        Math.cos(clock.current * 2) * wobbleAmount.current;
    } else {
      // ── Lerp wobble back to zero ──
      spinRef.current.rotation.x = THREE.MathUtils.lerp(
        spinRef.current.rotation.x,
        -0.05,
        0.05,
      );
      spinRef.current.rotation.z = THREE.MathUtils.lerp(
        spinRef.current.rotation.z,
        0,
        0.05,
      );
    }

    // ── Pulse + responsive scale — decay back to 1, multiply by base ──
    pulseScale.current = THREE.MathUtils.lerp(pulseScale.current, 1, 0.05);
    const s = pulseScale.current * baseScale.current;
    spinRef.current.scale.set(s, s, s);
  });

  return (
    // tilting burger
    <group ref={floatRef}>
      <group ref={spinRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// ── Scroll indicator arrow ────────────────────────────
const ScrollIndicator = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`${styles.scrollIndicator} ${!visible ? styles.hidden : ""}`}
    >
      <FaChevronDown />
    </div>
  );
};

// ── Hero section ──────────────────────────────────────
export default function Hero() {
  const [clickCount, setClickCount] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // ── Check localStorage on mount ──
  useEffect(() => {
    if (localStorage.getItem(LS_BURGER_CLICKED) === "yes") {
      setAlreadyCompleted(true);
    }
  }, []);

  // ── Handle burger click ──
  const handleBurgerClick = useCallback(() => {
    if (alreadyCompleted) return;
    if (clickCount >= 5) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // ── After click 5, save to localStorage ──
    if (newCount === 5) {
      localStorage.setItem(LS_BURGER_CLICKED, "yes");
    }
  }, [clickCount, alreadyCompleted]);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <Header />

        {/* ── Burger canvas — clickable for secret menu ── */}
        <div className={styles.burger} onClick={handleBurgerClick}>
          <BurgerErrorBoundary>
            <Canvas
              camera={{ position: [0, 5.5, 250], fov: 35 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ gl, scene }) => {
                gl.setClearColor(0x000000, 0);
                scene.background = null;
              }}
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <BurgerModel clickCount={clickCount} />
            </Canvas>
          </BurgerErrorBoundary>
        </div>

        {/* ── CRT overlay ── */}
        <div className={styles.crtOverlay} />

        {/* ── Marquee ── */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.carouselTrack}>
            {[...marqueeText, ...marqueeText].map((text, i) => (
              <div className={styles.text} key={i}>
                <h1>{text}</h1>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Arrow indicator ── */}
      <ScrollIndicator />
    </section>
  );
}

useGLTF.preload("/3d-models/burger.glb");
