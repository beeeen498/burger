import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import INGREDIENTS from "./ingredients";
import IngredientMesh from "./IngredientMesh";
import scrollState from "./scrollState";

// The Y angle the burger settles at in the breakdown.
// Tune this so the burger faces the most flattering direction.
const BREAKDOWN_ROTATION_Y = 0.3;

export default function BurgerGroup() {
  const groupRef  = useRef<THREE.Group>(null!);
  const clock     = useRef(0);
  const prevZone  = useRef(scrollState.zone);

  const { nodes } = useGLTF("/3d-models/assembled-burger.glb") as any;
  const { viewport } = useThree();

  // Set the base X rotation once on mount (Blender orientation fix)
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -Math.PI / 2;
    }
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    clock.current += delta;

    const { zone } = scrollState;

    // When entering breakdown, normalize rotation.y to 0 → 2π
    // so we never lerp across a huge accumulated spin value
    if (zone === "breakdown" && prevZone.current !== "breakdown") {
      groupRef.current.rotation.y = groupRef.current.rotation.y % (Math.PI * 2);
    }

    prevZone.current = zone;

    if (zone === "hero") {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, 0, 0.07
      );
      groupRef.current.position.y = Math.sin(clock.current * 0.8) * 0.15;
      groupRef.current.rotation.y += 0.004;
    }

    if (zone === "breakdown") {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, viewport.width * 0.25, 0.07
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, 0, 0.07
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, BREAKDOWN_ROTATION_Y, 0.07
      );
    }
  });

  return (
    <group ref={groupRef} scale={0.02}>
      {INGREDIENTS.map((ingredient) => (
        <IngredientMesh
          key={ingredient.id}
          ingredient={ingredient}
          nodes={nodes}
        />
      ))}
    </group>
  );
}

useGLTF.preload("/3d-models/assembled-burger.glb");