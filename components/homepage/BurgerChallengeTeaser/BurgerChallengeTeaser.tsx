"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { CiWarning } from "react-icons/ci";
import { stackBurgerLayers, buildChallengeSequence } from "@/lib/burgerUtils";
import Cta from "@/components/global/Cta/Cta";
import * as THREE from "three";
import styles from "./BurgerChallengeTeaser.module.scss";

// how many patties are displayed
const PATTY_COUNT = 20; 
const LAYER_SEQUENCE = buildChallengeSequence(PATTY_COUNT);

// control animation
const DESCEND_DURATION  = 5.5;
const PAUSE_DURATION    = 1.2;
const ASCEND_DURATION   = 0.6;
const RESTART_PAUSE     = 1.0;

// Keep these in sync with the Canvas camera props and group scale
const GROUP_SCALE = 0.13;
const CAM_Z       = 22;
const CAM_FOV     = 42;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeInCubic(t: number) {
  return t * t * t;
}

interface StackedBurgerProps {
  play: boolean;
}

function StackedBurger({ play }: StackedBurgerProps) {
  const { scene } = useGLTF("/3d-models/burger.glb") as any;
  const { camera } = useThree();

  const phase      = useRef<"idle" | "descend" | "pause" | "ascend" | "restart">("idle");
  const clock      = useRef(0);
  const camTopY    = useRef(0);
  const camBottomY = useRef(0);
  const meshes     = useRef<{ [key: string]: THREE.Mesh }>({});
  const groupRef   = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshes.current[obj.name] = obj as THREE.Mesh;
      }
    });
  }, [scene]);

  useEffect(() => {
  if (!groupRef.current) return;

  const { bottomBunClone, totalBox } = stackBurgerLayers(
    groupRef.current,
    meshes.current,
    LAYER_SEQUENCE
  );

  const stackTop = totalBox.max.y;
  camTopY.current = stackTop + 1;

  if (bottomBunClone) {
    const bunBox       = new THREE.Box3().setFromObject(bottomBunClone);
    const halfVhWorld  = Math.tan((CAM_FOV / 2) * (Math.PI / 180)) * CAM_Z;
    camBottomY.current = bunBox.max.y - halfVhWorld * 0.05;
  } else {
    camBottomY.current = totalBox.min.y - 1;
  }

  camera.position.set(0, camTopY.current, CAM_Z);
  camera.lookAt(0, camTopY.current, 0);
}, [scene, camera]);

useEffect(() => {
  if (play) {
    phase.current = "descend";
    clock.current = 0;
  } else {
    // Reset when section leaves view
    phase.current = "idle";
    clock.current = 0;
    camera.position.set(0, camTopY.current, CAM_Z);
    camera.lookAt(0, camTopY.current, 0);
  }
}, [play, camera]);

useFrame((_, delta) => {
    if (!play || phase.current === "idle") return;

    clock.current += delta;
    const top    = camTopY.current;
    const bottom = camBottomY.current;

    if (phase.current === "descend") {
      const t    = Math.min(clock.current / DESCEND_DURATION, 1);
      const camY = top + (bottom - top) * easeInOut(t);
      camera.position.y = camY;
      camera.lookAt(0, camY, 0);
      if (t >= 1) { phase.current = "pause"; clock.current = 0; }

    } else if (phase.current === "pause") {
      if (clock.current >= PAUSE_DURATION) { phase.current = "ascend"; clock.current = 0; }

    } else if (phase.current === "ascend") {
      const t    = Math.min(clock.current / ASCEND_DURATION, 1);
      const camY = bottom + (top - bottom) * easeInCubic(t);
      camera.position.y = camY;
      camera.lookAt(0, camY, 0);
      if (t >= 1) { phase.current = "restart"; clock.current = 0; }

    } else if (phase.current === "restart") {
      if (clock.current >= RESTART_PAUSE) { phase.current = "descend"; clock.current = 0; }
    }
  });

  return (
    <group ref={groupRef} scale={GROUP_SCALE} rotation={[0.4, 0, 0]} />
  );
}

export default function BurgerChallenge() {
  const sectionRef = useRef<HTMLElement>(null);
  const [play, setPlay]   = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPlay(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.challenge} ref={sectionRef}>
      <div className={styles.warningTape} />

      <div className={styles.viewport}>
        <Canvas
          camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 10, 6]}  intensity={1.4} color="#ff6b00" />
          <directionalLight position={[-4, 2, -4]} intensity={0.4} color="#ffcc00" />
          <StackedBurger play={play} />
        </Canvas>
        <div className={styles.vignette} />
      </div>

      <div className={styles.overlay}>
        <div className={styles.warningBadge}><CiWarning /> &nbsp; CHALLENGE</div>
        <h2 className={styles.heading}>
          THINK YOU CAN<br />
          <span className={styles.headingAccent}>HANDLE IT?</span>
        </h2>
        <p className={styles.subtext}>
          {PATTY_COUNT} patties. One hour. Your meal is free if you finish.
        </p>
        
        <Cta variant="pink" label="See the challenge" href="/menu#challenge"></Cta>
      </div>

      <div className={styles.warningTape} />
    </section>
  );
}

useGLTF.preload("/3d-models/burger.glb");