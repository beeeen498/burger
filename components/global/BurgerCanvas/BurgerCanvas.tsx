"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import {
  stackBurgerLayers,
  buildBurgerSequence,
  BurgerIngredients,
} from "@/lib/burgerUtils";
import styles from "./BurgerCanvas.module.scss";

// Props accepted by both the outer and inner components
interface BurgerCanvasProps {
  ingredients: BurgerIngredients;
  sideItems?: string[];
  cameraOffset?: number;
  scale?: number;
  spin?: boolean;
}

// Props for SideItem
interface SideItemProps {
  model: string;
  position: [number, number, number];
  scale: number;
}

// Inner component — loads and renders a single side item (fries, milkshake etc)
// Must live inside <Canvas> to access the Three.js context
function SideItem({ model, position, scale }: SideItemProps) {
  const { scene } = useGLTF(model) as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} position={position} scale={scale} />;
}

// positioning the side items
const SIDE_ITEM_CONFIG: {
  [key: string]: { position: [number, number, number]; scale: number };
} = {
  french_fries: { position: [-2, 6, -10], scale: 0.1 },
  milkshake: { position: [-9, 6, -10], scale: 0.13 },
};

// Inner component — must live inside <Canvas> to access the Three.js context.
// Responsible for loading the GLB, extracting meshes, and stacking the burger layers.
function BurgerScene({
  ingredients,
  cameraOffset = 14.5,
  scale = 0.13,
  spin = false,
}: BurgerCanvasProps) {
  // Ref to the Three.js group that holds the stacked burger layers
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  // Ref to store extracted meshes by name — e.g. meshes.current["patty"]
  // useRef is used instead of useState because we don't need a re-render when meshes populate
  const meshes = useRef<{ [key: string]: THREE.Mesh }>({});

  // Load the shared GLB model that contains all ingredient meshes
  const { scene } = useGLTF("/3d-models/burger1.glb") as any;
  const { camera } = useThree();

  useEffect(() => {
    // Walk through every object in the GLB scene and extract the meshes by name
    scene.traverse((obj: THREE.Object3D) => {
      console.log("Object:", obj.name, obj.type);

      if ((obj as THREE.Mesh).isMesh) {
        // bacon is exported as multiple strips (bacon_1, bacon_2 etc)
        // store each strip individually and also map bacon_1 as "bacon"
        // for stackBurgerLayers to use as the reference mesh
        if (obj.name.startsWith("bacon_")) {
          meshes.current[obj.name] = obj as THREE.Mesh;
          if (obj.name === "bacon_1") {
            meshes.current["bacon"] = obj as THREE.Mesh;
          }
          // nuggets are exported as multiple pieces (nuggets_1, nuggets_2 etc)
          // same pattern as bacon — store individually and map nuggets_1 as "nuggets"
        } else if (obj.name.startsWith("nuggets_")) {
          meshes.current[obj.name] = obj as THREE.Mesh;
          if (obj.name === "nuggets_1") {
            meshes.current["nuggets"] = obj as THREE.Mesh;
          }
          // shrimps are exported as multiple pieces (shrimps_1, shrimps_2 etc)
          // same pattern as bacon/nuggets — store individually and map shrimps_1 as "shrimps"
        } else if (obj.name.startsWith("shrimps_")) {
          meshes.current[obj.name] = obj as THREE.Mesh;
          if (obj.name === "shrimps_1") {
            meshes.current["shrimps"] = obj as THREE.Mesh;
          }

          // all other meshes are single objects — store directly by name

          // all other meshes are single objects — store directly by name
        } else {
          meshes.current[obj.name] = obj as THREE.Mesh;
        }
      }
    });

    console.log("All meshes:", Object.keys(meshes.current));

    // Stack the layers and get the total bounding box of the assembled burger
    if (!groupRef.current) return;
    const { totalBox } = stackBurgerLayers(
      groupRef.current,
      meshes.current,
      buildBurgerSequence(ingredients),
    );

    // ── Re-center the burger for clean spinning ──
    if (spinRef.current) {
      const box = new THREE.Box3().setFromObject(spinRef.current);
      const center = box.getCenter(new THREE.Vector3());
      groupRef.current.position.x -= center.x;
      groupRef.current.position.z -= center.z;
    }

    // Point the camera at the bottom third of the burger stack
    // so the burger appears to rise from the bottom of the card
    const stackBottom = totalBox.min.y;
    const stackTop = totalBox.max.y;

    const focusY = stackBottom + (stackTop - stackBottom) * 0.3;
    const lookAtY = stackBottom;

    // moving burgers on y axis
    camera.position.set(0, stackBottom + cameraOffset, 120); // at the bottom
    (camera as THREE.PerspectiveCamera).fov = 15;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [scene, ingredients]);

  // ── Slow spin when enabled ──
  useFrame(() => {
    if (spin && spinRef.current) {
      spinRef.current.rotation.y += 0.008;
    }
  });

  return (
    <group ref={spinRef}>
      <group ref={groupRef} scale={scale} rotation={[0.1, 0, 0]} />
    </group>
  );
}

// Outer component — renders the Canvas wrapper and scene lighting.
// BurgerScene is mounted inside so it has access to the Three.js context.
// Accepts an ingredients prop — a BurgerIngredients object describing
// which ingredients to include. The fixed stacking order is enforced
// internally by buildBurgerSequence in burgerUtils.
export default function BurgerCanvas({
  ingredients,
  sideItems,
  cameraOffset,
  scale,
  spin,
}: BurgerCanvasProps) {
  return (
    <div className={styles.canvasWrapper}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <BurgerScene
          ingredients={ingredients}
          cameraOffset={cameraOffset}
          scale={scale}
          spin={spin}
        />
        {sideItems?.map((item) => {
          const config = SIDE_ITEM_CONFIG[item];
          if (!config) return null;
          return (
            <SideItem
              key={item}
              model={`/3d-models/${item}.glb`}
              position={config.position}
              scale={config.scale}
            />
          );
        })}
      </Canvas>
    </div>
  );
}

// Preload the GLB so it's ready before the component mounts
useGLTF.preload("/3d-models/burger1.glb");
useGLTF.preload("/3d-models/french_fries.glb");
useGLTF.preload("/3d-models/milkshake.glb");
