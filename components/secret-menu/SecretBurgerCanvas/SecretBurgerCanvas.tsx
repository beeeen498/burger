"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import styles from "./SecretBurgerCanvas.module.scss"

// ── Inner component — must be inside Canvas ───────────
function SecretBurgerModel({ visibleMeshes }: { visibleMeshes: string[] }) {
  const { scene } = useGLTF("/3d-models/burger.glb") as any
  const floatRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Group>(null)
  const clock = useRef(0)

  const clonedScene = useMemo(() => {
    const clone = scene.clone()

    // ── Hide everything first ──
    clone.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.visible = false
      }
    })

    // ── Show only the meshes we want (supports prefix matching for multi-piece meshes) ──
    clone.traverse((obj: THREE.Object3D) => {
      if (visibleMeshes.some(name => obj.name === name || obj.name.startsWith(name + "_"))) {
        obj.visible = true
      }
    })

    // ── Center from visible meshes only ──
    const box = new THREE.Box3()
    clone.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh && mesh.visible) {
        const meshBox = new THREE.Box3().setFromObject(mesh)
        box.union(meshBox)
      }
    })
    const center = box.getCenter(new THREE.Vector3())
    clone.position.sub(center)

    return clone
  }, [scene, visibleMeshes])

  // ── Slow spin + gentle float ──
  useFrame((_, delta) => {
    if (!floatRef.current || !spinRef.current) return
    clock.current += delta

    floatRef.current.position.y = Math.sin(clock.current * 0.8) * 0.2
    spinRef.current.rotation.y += 0.008
  })

  return (
    <group ref={floatRef} rotation={[0.15, 0, 0]}>
      <group ref={spinRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  )
}

// ── Outer component — renders the Canvas wrapper ──────
interface SecretBurgerCanvasProps {
  visibleMeshes: string[]
}

export default function SecretBurgerCanvas({ visibleMeshes }: SecretBurgerCanvasProps) {
  return (
    <div className={styles.canvas}>
      <Canvas
        camera={{ position: [0, 5.5, 250], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <SecretBurgerModel visibleMeshes={visibleMeshes} />
      </Canvas>
    </div>
  )
}

useGLTF.preload("/3d-models/burger.glb")