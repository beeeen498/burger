"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FaChevronDown } from "react-icons/fa";
import * as THREE from "three";
import Header from "@/components/global/Header/Header";
import BurgerErrorBoundary from "./BurgerErrorBoundary";
import styles from "./Hero.module.scss";

const base = ["PICKLES", "SAUCE", "BEEF", "CHEESE", "ONIONS", "TOMATO", "LETTUCE"];
const marqueeText = base.map((_, i) =>
  [...base.slice(i), ...base.slice(0, i)].join(" • ")
);

function BurgerModel() {
  const { scene } = useGLTF("/3d-models/burger.glb") as any;
  const floatRef = useRef<THREE.Group>(null);
  const spinRef  = useRef<THREE.Group>(null);
  const clock    = useRef(0);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // center the geometry
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    // hide extra meshes before first render
    clone.traverse((obj: THREE.Object3D) => {
      if (
        obj.name === "poppy_bun" ||
        obj.name.startsWith("nuggets_") ||
        obj.name.startsWith("top_donut") ||
        obj.name.startsWith("bottom_donut")
      ) {
        obj.visible = false;
      }
    });

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (!floatRef.current || !spinRef.current) return;
    clock.current += delta;
    // Float on the outer group
    floatRef.current.position.y = Math.sin(clock.current) * 0.3;
    // Spin on the inner group
    spinRef.current.rotation.y += 0.005;
  });

  return (
    // tilting burger
    <group ref={floatRef} rotation={[-0.05, 0, 0]}> 
      <group ref={spinRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// scroll down arrow indicator
const ScrollIndicator = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.scrollIndicator} ${!visible ? styles.hidden : ""}`}>
      <FaChevronDown />
    </div>
  );
};

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>

        <Header />

        {/* Burger canvas */}
        <div className={styles.burger}>
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
              <BurgerModel />
            </Canvas>
          </BurgerErrorBoundary>
        </div>

        {/* CRT overlay */}
        <div className={styles.crtOverlay} />

        {/* Marquee */}
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

      {/* arrow indicator */}
      <ScrollIndicator />
    </section>
  );
}

useGLTF.preload("/3d-models/burger.glb");