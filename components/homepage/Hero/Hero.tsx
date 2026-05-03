"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import styles from "./Hero.module.scss";
import Header from "@/components/global/Header/Header";

const base = ["PICKLES", "SAUCE", "BEEF", "CHEESE", "ONIONS", "TOMATO", "LETTUCE"];
const marqueeText = base.map((_, i) =>
  [...base.slice(i), ...base.slice(0, i)].join(" • ")
);

function BurgerModel() {
  const { scene } = useGLTF("/3d-models/assembled-burger.glb") as any;
  const floatRef = useRef<THREE.Group>(null);
  const spinRef  = useRef<THREE.Group>(null);
  const clock    = useRef(0);

  // Center the scene geometry on mount
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center); // shift scene so its center is at origin
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
    // tilting the burger
    <group ref={floatRef} rotation={[-0.05, 0, 0]}> 
      <group ref={spinRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>

        <Header />

        {/* Burger canvas */}
        <div className={styles.burger}>
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
    </section>
  );
}

useGLTF.preload("/3d-models/assembled-burger.glb");