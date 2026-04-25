import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Ingredient } from "./ingredients";
import IngredientLabel, { type IngredientLabelHandle } from "./IngredientLabel";
import scrollState from "./scrollState";

interface Props {
  ingredient: Ingredient;
  nodes: Record<string, any>;
}

export default function IngredientMesh({ ingredient, nodes }: Props) {
  const meshRef    = useRef<THREE.Mesh>(null!);
  const labelRef   = useRef<IngredientLabelHandle>(null);
  const wasVisible = useRef(false);

  const node = nodes[ingredient.meshName];

  const origin = useMemo(() => {
    if (!node) return new THREE.Vector3();
    return node.position.clone();
  }, [node]);

  const explodedPos = useMemo(() => new THREE.Vector3(
    origin.x + ingredient.explodedOffset[0],
    origin.y + ingredient.explodedOffset[1],
    origin.z + ingredient.explodedOffset[2],
  ), [origin, ingredient.explodedOffset]);

  const explodedRot = useMemo(
    () => new THREE.Euler(...ingredient.explodedRotation),
    [ingredient.explodedRotation]
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const p = scrollState.breakdownProgress;
    const exploding = p > 0.05;

    meshRef.current.position.lerp(exploding ? explodedPos : origin, 0.08);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      exploding ? explodedRot.x : 0,
      0.08
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      exploding ? explodedRot.z : 0,
      0.08
    );

    const targetScale = exploding ? ingredient.explodedScale : 1;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08)
    );

    const shouldShow = p > 0.35;
    if (shouldShow !== wasVisible.current) {
      wasVisible.current = shouldShow;
      labelRef.current?.setVisible(shouldShow);
    }
  });

  if (!node) {
    console.warn(`[IngredientMesh] "${ingredient.meshName}" not found in GLB`);
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={node.geometry}
      material={node.material}
      position={origin}
      castShadow
    >
      {/* 
        position[0] = how far right the label starts from the mesh center.
        Increase this number to push labels further right.
      */}
      <Html position={[14, ingredient.labelOffsetY, 0]} center={false} occlude={false} transform={false} style={{ pointerEvents: "none", transform: "translateY(-50%)" }}>
        <IngredientLabel ref={labelRef} ingredient={ingredient} lineLength={ingredient.lineLength} />
      </Html>
    </mesh>
  );
}