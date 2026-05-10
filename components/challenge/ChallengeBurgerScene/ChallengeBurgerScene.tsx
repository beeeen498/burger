"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { stackBurgerLayers, buildChallengeSequence } from "@/lib/burgerUtils";
import styles from "./ChallengeBurgerScene.module.scss";



const PATTY_COUNT    = 20;
const LAYER_SEQUENCE = buildChallengeSequence(PATTY_COUNT);
const GROUP_SCALE    = 0.13;
const CAM_Z          = 30;
const CAM_FOV        = 40;

// Change this one line to swap material style across all clouds
const CLOUD_MATERIAL_TYPE = "toon"; // "toon" | "lambert"

interface CloudProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  opacity: number;
  drift: boolean;
}

// creating the clouds
function Cloud({ position, scale, speed, opacity, drift }: CloudProps) {
  const groupRef = useRef<THREE.Group>(null);
  const offset   = useRef(Math.random() * 100);

  const material = CLOUD_MATERIAL_TYPE === "toon"
    ? new THREE.MeshToonMaterial({ color: 0xefefef, transparent: true, opacity })
    : new THREE.MeshLambertMaterial({ color: 0xefefef, transparent: true, opacity });

  const geometry = new THREE.SphereGeometry(1, 5, 4);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    offset.current += delta * speed;

    // subtle horizontal bob on all clouds
    groupRef.current.position.x = position[0] + Math.sin(offset.current * 0.3) * 2;

    if (drift) {
      // slowly move upward, wrap back to start when off screen
      groupRef.current.position.y += delta * speed * 0.5;
      if (groupRef.current.position.y > position[1] + 30) {
        groupRef.current.position.y = position[1];
      }
    } else {
      // just bob in place
      groupRef.current.position.y = position[1] + Math.sin(offset.current * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh geometry={geometry} material={material} position={[0, 0, 0]} />
      <mesh geometry={geometry} material={material} position={[1.4, 0.3, 0]} scale={0.8} />
      <mesh geometry={geometry} material={material} position={[-1.3, 0.2, 0]} scale={0.75} />
      <mesh geometry={geometry} material={material} position={[0.6, 0.9, 0]} scale={0.6} />
    </group>
  );
}

// challenge burger model
function ChallengeBurger() {
  const { scene }  = useGLTF("/3d-models/burger.glb") as any;
  const { camera } = useThree();

  const groupRef = useRef<THREE.Group>(null);
  const meshes   = useRef<{ [key: string]: THREE.Mesh }>({});
  const clock    = useRef(0);

  // extract meshes from the GLB
  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        meshes.current[obj.name] = obj as THREE.Mesh;
      }
    });
  }, [scene]);

  // stack layers and position camera
  useEffect(() => {
    if (!groupRef.current) return;

    stackBurgerLayers(
      groupRef.current,
      meshes.current,
      LAYER_SEQUENCE
    );

    // log world space bounds after scale is applied
    const box = new THREE.Box3().setFromObject(groupRef.current);
    console.log("world min Y:", box.min.y);
    console.log("world max Y:", box.max.y);
    console.log("world center:", box.getCenter(new THREE.Vector3()));

    camera.position.set(0, 2, 45);
    (camera as THREE.PerspectiveCamera).fov = 40;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(0, 45, 0);
  }, [scene, camera]);

  // wobble the whole burger like a tower in wind
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    clock.current += delta;
    groupRef.current.rotation.z = Math.sin(clock.current * 0.5) * 0.04;
    groupRef.current.rotation.x = Math.sin(clock.current * 0.5) * 0.02 + 0.15;
  });

  return (
    <group ref={groupRef} scale={GROUP_SCALE} />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// building the scene of the burger
export default function ChallengeBurgerScene() {
  return (
    <div className={styles.sceneWrapper}>
      <Canvas
        camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* split warm/cool lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]}  intensity={1.6} color="#ff6b00" /> {/* warm orange, right */}
        <directionalLight position={[-5, 5, 5]}  intensity={1.0} color="#6bbbe8" /> {/* cool blue, left */}
        <pointLight       position={[0, -5, 8]}  intensity={0.6} color="#df2c8b" /> {/* pink under-glow */}

        <ChallengeBurger />

        {/* clouds — mix of drifting and bobbing at different heights */}
        <Cloud position={[ 4,  6, -5]} scale={0.9} speed={0.4} opacity={0.55} drift={false} />
        <Cloud position={[-5,  9, -8]} scale={1.1} speed={0.3} opacity={0.45} drift={true}  />
        <Cloud position={[ 3, 13, -6]} scale={0.7} speed={0.5} opacity={0.5}  drift={false} />
        <Cloud position={[-4, 17, -7]} scale={1.0} speed={0.35} opacity={0.4} drift={true}  />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/3d-models/burger.glb");