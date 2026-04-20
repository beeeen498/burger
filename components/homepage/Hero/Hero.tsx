"use client";

import styles from "./Hero.module.scss";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const BurgerModel = () => {
  // loading the 3D mode
  const { scene } = useGLTF("/3d-models/assembled-burger.glb");

  // Referencing the group to animate
  const ref = useRef<THREE.Group>(null);

  // Clock to keep track of time for smooth sine animation
  const clock = useRef(0);

  useFrame((_, delta) => {
    if (ref.current) {
      // making animation frame-rate independent
      clock.current += delta;

      // rotating the burger
      ref.current.rotation.y += 0.005;

      // moving the burger up/down 
      ref.current.position.y = -0.5 + Math.sin(clock.current) * 0.3;
    }
  });

  return (
    // Group acts as a pivot for rotation + animation
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
};

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <Canvas camera={{ position: [0, 3, 12], fov: 40 }}>

          {/* lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          {/* burger model */}
          <BurgerModel />
        </Canvas>
      </div>
    </section>
  );
};

// preloading the model
useGLTF.preload("/3d-models/assembled-burger.glb");

export default Hero;