"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useMemo, useState, useEffect, useRef } from "react"
import styles from "./SimpleModelCanvas.module.scss"

interface SimpleModelCanvasProps {
  modelPath: string
  scale?: number
  rotation?: [number, number, number]  // optional fixed tilt — used by sauces so they're not flat-on
}

// ── Inner component — must live inside <Canvas> to access the Three.js context ──
// Auto-frames the camera based on the model's real bounding box, instead of
// assuming every GLB is the same scale/position/rotation. This is what makes
// models of any size (small sauces, large sides) show up correctly without
// per-model tweaking.
function Model({ modelPath, scale = 1, rotation = [0, 0, 0] }: SimpleModelCanvasProps) {
  const { scene } = useGLTF(modelPath) as any
  const clonedScene = useMemo(() => scene.clone(), [scene])
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (!groupRef.current) return

    // ── Measure the model's real-world bounding box ──
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // ── Re-center the model so it sits at the origin ──
    // Compensates for models that weren't authored centered at (0,0,0)
    groupRef.current.position.sub(center)

    // ── Position the camera based on the model's largest dimension ──
    // so models of any scale fit comfortably in frame
    const maxDimension = Math.max(size.x, size.y, size.z)
    const distance = maxDimension * 1.8 || 5 // fallback to 5 if box is degenerate

    camera.position.set(0, 0, distance)
    camera.lookAt(0, 0, 0)
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  }, [clonedScene, camera])

  return (
    <group ref={groupRef} scale={scale} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  )
}

export default function SimpleModelCanvas({ modelPath, scale = 1, rotation }: SimpleModelCanvasProps) {
  const [modelExists, setModelExists] = useState<boolean | null>(null)

  // ── Check if the model file actually exists before trying to load it ──
  useEffect(() => {
    fetch(modelPath, { method: "HEAD" })
      .then(res => setModelExists(res.ok))
      .catch(() => setModelExists(false))
  }, [modelPath])

  // ── Still checking, or model doesn't exist — render nothing ──
  if (!modelExists) return null

  return (
    <div className={styles.canvasWrapper}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        camera={{ position: [0, 0, 5], fov: 35 }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Model modelPath={modelPath} scale={scale} rotation={rotation} />
      </Canvas>
    </div>
  )
}