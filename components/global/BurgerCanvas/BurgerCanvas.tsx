'use client'

import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { stackBurgerLayers, buildBurgerSequence, BurgerIngredients } from "@/lib/burgerUtils"
import styles from "./BurgerCanvas.module.scss";

// Props accepted by both the outer and inner components
interface BurgerCanvasProps {
  ingredients: BurgerIngredients,
}

// Inner component — must live inside <Canvas> to access the Three.js context.
// Responsible for loading the GLB, extracting meshes, and stacking the burger layers.
function BurgerScene({ ingredients }: BurgerCanvasProps) {
    // Ref to the Three.js group that holds the stacked burger layers
    const groupRef = useRef<THREE.Group>(null)

    // Ref to store extracted meshes by name — e.g. meshes.current["patty"]
    // useRef is used instead of useState because we don't need a re-render when meshes populate
    const meshes = useRef<{ [key: string]: THREE.Mesh }>({})

    // Load the shared GLB model that contains all ingredient meshes
    const { scene } = useGLTF("/3d-models/assembled-burger.glb") as any

    const { camera } = useThree()

    useEffect(() => {
        // Walk through every object in the GLB scene and extract the meshes by name
        scene.traverse((obj: THREE.Object3D) => {
            if ((obj as THREE.Mesh).isMesh) {
                meshes.current[obj.name] = obj as THREE.Mesh
            }
        })

        // Stack the layers and get the total bounding box of the assembled burger
        if (!groupRef.current) return
        const { totalBox } = stackBurgerLayers(groupRef.current, meshes.current, buildBurgerSequence(ingredients))

        // Point the camera at the bottom third of the burger stack
        // so the burger appears to rise from the bottom of the card
        const stackBottom = totalBox.min.y
        const stackTop = totalBox.max.y
        const focusY = stackBottom + (stackTop - stackBottom) * 0.3

        camera.position.set(0, focusY, 35)
        camera.lookAt(0, focusY, 0)
    }, [scene])
    
    return (
        // The group that stackBurgerLayers populates with cloned ingredient meshes
        <group ref={groupRef} scale={0.13} rotation={[0.05, 0, 0]}/>
    )
}

// Outer component — renders the Canvas wrapper and scene lighting.
// BurgerScene is mounted inside so it has access to the Three.js context.
// Accepts an ingredients prop — a BurgerIngredients object describing
// which ingredients to include. The fixed stacking order is enforced
// internally by buildBurgerSequence in burgerUtils.
export default function BurgerCanvas({ ingredients }: BurgerCanvasProps) {
  return (
    <div className={styles.canvasWrapper}>
      <Canvas
        camera={{ position: [0, 50, 180], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Ambient light for base illumination, directional for depth and shadow */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <BurgerScene ingredients={ingredients} />
      </Canvas>
    </div>
  )
}

// Preload the GLB so it's ready before the component mounts
useGLTF.preload("/3d-models/assembled-burger.glb")