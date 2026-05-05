/**
 * Shared burger stacking utility.
 *
 * Used by the burger builder, featured items, menu cards, and challenge
 * teaser to stack ingredients in 3D. Instead of duplicating the logic,
 * this utility handles it in one place.
 *
 * stackBurgerLayers(group, meshes, layers) — clones each mesh, measures
 * its real geometry height via bounding box, and stacks the layers flush
 * on top of each other inside the provided Three.js group.
 *
 * buildChallengeSequence(pattyCount) — returns an ordered array of mesh
 * names for the challenge teaser, with [patty, cheese] repeated
 * pattyCount times between the buns.
 *
 * buildBurgerSequence(ingredients) — returns an ordered array of mesh
 * names for a custom burger. Always enforces bottom_bun as first and
 * top_bun as last. The caller passes only the middle ingredients in
 * their desired order.
 *
 * headroomCorrection and placementNudge values were derived by logging
 * the actual geometry bounds of each mesh in assembled-burger.glb during
 * development. Adjust if the model changes.
 */

import * as THREE from "three";

// Maximum ingredients allowed in a custom burger build
// Does not apply to the challenge burger — see buildChallengeSequence
export const MAX_PATTIES = 5
export const MAX_CHEESE = 5

// How many units to subtract from each mesh's maxY to find the true visible top.
// Derived from geometry bounding box analysis of the assembled-burger.glb meshes.
const HEADROOM_CORRECTION: { [key: string]: number } = {
  bottom_bun: 0,
  sauce:      0,
  pickles:    1,
  patty:      13.3,
  cheese:     14.3,
  onions:     4,
  tomato:     0,
  lettuce:    7.5,
  top_bun:    0,
};

const PLACEMENT_NUDGE: { [key: string]: number } = {
  top_bun: 20.5,
  lettuce: 13,
  onions: 15,
  pickles: -1,
  sauce: -2,
};

interface StackResult {
  bottomBunClone: THREE.Object3D | null;
  topBunClone:    THREE.Object3D | null;
  totalBox:       THREE.Box3;
}

export interface BurgerIngredients {
  sauce?: boolean
  lettuce?: boolean
  tomato?: boolean
  pattyCount: number
  cheeseCount?: number
  pickles?: boolean
  onions?: boolean
  bacon?: boolean
}

/**
 * Procedurally stacks burger layer meshes inside a Three.js group.
 * Clones each mesh from the provided map, positions them flush on top
 * of each other using geometry bounding box measurements, and centers
 * the stack horizontally.
 *
 * @param group   - The THREE.Group to stack layers into (cleared first)
 * @param meshes  - Map of mesh name → THREE.Mesh from the GLB scene
 * @param layers  - Ordered array of mesh names from bottom to top
 * @returns       - References to key clones and the total bounding box
 */
export function stackBurgerLayers(
  group: THREE.Group,
  meshes: { [key: string]: THREE.Mesh },
  layers: string[]
): StackResult {
  // Clear existing children
  while (group.children.length) {
    group.remove(group.children[0]);
  }

  let bottomBunClone: THREE.Object3D | null = null;
  let topBunClone:    THREE.Object3D | null = null;
  let cursorY = 0;

  for (const name of layers) {
    const sourceMesh = meshes[name];
    if (!sourceMesh) continue;

    const clone = sourceMesh.clone(true);
    clone.castShadow    = true;
    clone.receiveShadow = true;

    const geo     = (sourceMesh as THREE.Mesh).geometry;
    geo.computeBoundingBox();
    const geoBox     = geo.boundingBox!;
    const geoMinY    = geoBox.min.y;
    const geoMaxY    = geoBox.max.y;
    const correction = HEADROOM_CORRECTION[name] ?? 0;
    const nudge      = PLACEMENT_NUDGE[name]      ?? 0;

    clone.position.set(0, cursorY - geoMinY + nudge, 0);
    group.add(clone);
    cursorY += (geoMaxY - geoMinY) - correction;

    if (name === "bottom_bun") bottomBunClone = clone;
    if (name === "top_bun")    topBunClone    = clone;
  }

  // Center the stack horizontally
  const totalBox = new THREE.Box3().setFromObject(group);
  const center   = totalBox.getCenter(new THREE.Vector3());
  group.position.x = -center.x;
  group.position.z = -center.z;

  return { bottomBunClone, topBunClone, totalBox };
}

/**
 * Builds the layer sequence for a burger stack.
 * Pattern: bottom_bun → [patty, cheese] × pattyCount → top_bun
 */
export function buildChallengeSequence(pattyCount: number): string[] {
  return [
    "bottom_bun",
    ...Array.from({ length: pattyCount }, () => ["patty", "cheese"]).flat(),
    "top_bun",
  ];
}

/**
 * Builds the layer sequence for a custom burger.
 * Always enforces bottom_bun as first and top_bun as last.
 * The caller passes only the middle ingredients in their desired order.
 * Buns are never included in the ingredients array.
 */
export function buildBurgerSequence(ingredients: BurgerIngredients): string[] {
  const layers: string[] = []

  // always start with bottom bun
  layers.push("bottom_bun")

  // add sauce if present
  if (ingredients.sauce) layers.push("sauce")

  // add lettuce if present
  if (ingredients.lettuce) layers.push("lettuce")

  // add tomato if present
  if (ingredients.tomato) layers.push("tomato")

  // add patties and cheese
  const pattyCount = Math.min(Math.max(ingredients.pattyCount, 1), MAX_PATTIES)
  let cheeseRemaining = Math.min(ingredients.cheeseCount ?? 0, pattyCount)
  
  for (let i = 0; i < pattyCount; i++) {
    layers.push("patty")
    if (cheeseRemaining > 0) {
      layers.push("cheese")
      cheeseRemaining--
    }
  }

  // add pickles if present
  if (ingredients.pickles) layers.push("pickles")

  // add onions if present
  if (ingredients.onions) layers.push("onions")

  // always end with top bun
  layers.push("top_bun")

  return layers
}