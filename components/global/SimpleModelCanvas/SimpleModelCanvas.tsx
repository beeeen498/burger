"use client"

import { Canvas } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useMemo, useState, useEffect } from "react"
import styles from "./SimpleModelCanvas.module.scss"

interface SimpleModelCanvasProps {
  modelPath: string
  scale?: number
}

function Model({ modelPath, scale = 1 }: SimpleModelCanvasProps) {
  const { scene } = useGLTF(modelPath) as any
  const clonedScene = useMemo(() => scene.clone(), [scene])

  return <primitive object={clonedScene} scale={scale} />
}

export default function SimpleModelCanvas({ modelPath, scale = 1 }: SimpleModelCanvasProps) {
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
        <Model modelPath={modelPath} scale={scale} />
      </Canvas>
    </div>
  )
}