"use client";

import styles from "./Hero.module.scss";
import Header from "@/components/global/Header/Header";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// base words
const base = ["PICKLES", "SAUCE", "BEEF", "CHEESE", "ONIONS", "TOMATO", "LETTUCE"];

// generate rotated marquee lines automatically
const marqueeText = base.map((_, i) =>
  [...base.slice(i), ...base.slice(0, i)].join(" • ")
);

// burger model
const BurgerModel = () => {
  const { scene } = useGLTF("/3d-models/assembled-burger.glb");
  const ref = useRef<THREE.Group>(null);
  const clock = useRef(0);

  useFrame((_, delta) => {
    if (ref.current) {
      clock.current += delta;

      // rotate
      ref.current.rotation.y += 0.005;

      // float
      ref.current.position.y = -0.5 + Math.sin(clock.current) * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
};

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>

        {/* header */}
        <Header />

        {/* burger */}
        <div className={styles.burger}>
          <Canvas camera={{ position: [0, 3, 12], fov: 40 }}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <BurgerModel />
          </Canvas>
        </div>

        {/* marquee */}
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
};

useGLTF.preload("/3d-models/assembled-burger.glb");

export default Hero;