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
    const { scene } = useGLTF("/3d-models/burger.glb") as any

    const { camera } = useThree()

    useEffect(() => {
        // Walk through every object in the GLB scene and extract the meshes by name
        scene.traverse((obj: THREE.Object3D) => {
            if ((obj as THREE.Mesh).isMesh) {
              console.log(obj.name)
                if (obj.name.startsWith("bacon_")) {
                    // store each bacon strip under a numbered key
                    // we'll handle combining them in stackBurgerLayers
                    meshes.current[obj.name] = obj as THREE.Mesh
                    // also store the first strip as "bacon" for the stacking cursor
                    if (obj.name === "bacon_1") {
                        meshes.current["bacon"] = obj as THREE.Mesh
                    }
                } else {
                    meshes.current[obj.name] = obj as THREE.Mesh
                }
            }
        })

        // Stack the layers and get the total bounding box of the assembled burger
        if (!groupRef.current) return
        const { totalBox } = stackBurgerLayers(groupRef.current, meshes.current, buildBurgerSequence(ingredients))

        // moving the burgers on the x axis
        const burgerWidth = totalBox.max.x - totalBox.min.x
        if (groupRef.current) {
            groupRef.current.position.x = burgerWidth * 0 // centered
        }

        // Point the camera at the bottom third of the burger stack
        // so the burger appears to rise from the bottom of the card
        const stackBottom = totalBox.min.y
        const stackTop = totalBox.max.y
        
        const focusY = stackBottom + (stackTop - stackBottom) * 0.3
        const lookAtY = stackBottom

        // moving burgers on y axis
        camera.position.set(0, stackBottom + 14.5, 120) // at the bottom

        ;(camera as THREE.PerspectiveCamera).fov = 15
        ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()

    }, [scene, ingredients])
    
    
    return (
        /**
         * The group that stackBurgerLayers populates with cloned ingredient meshes
         * Rotation controls the tilt of the burger
         */ 
        <group ref={groupRef} scale={0.13} rotation={[0.1, 0, 0]}/>
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
useGLTF.preload("/3d-models/burger.glb")