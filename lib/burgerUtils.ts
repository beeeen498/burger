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
 * the actual geometry bounds of each mesh in burger.glb during
 * development. Adjust if the model changes.
 */

import * as THREE from "three";

// Maximum ingredients allowed in a custom burger build
// Does not apply to the challenge burger — see buildChallengeSequence
export const MAX_PATTIES = 5
export const MAX_CHEESE = 5
export const MAX_LETTUCE = 2
export const MAX_TOMATO = 2
export const MAX_PICKLES = 2
export const MAX_ONIONS = 2
export const MAX_BACON = 2

// How many units to subtract from each mesh's maxY to find the true visible top.
// Derived from geometry bounding box analysis of the burger.glb meshes.
// the order is - bottom_bun → sauce → lettuce → tomato → patty → cheese → pickles → onions → bacon → top_bun
const HEADROOM_CORRECTION: { [key: string]: number } = {
  bottom_bun: 0,
  sauce:      0,
  lettuce:    0,
  tomato:     0,
  patty:      0,
  cheese:     0,
  pickles:    0,
  onions:     0,
  bacon:      1.5,
  top_bun:    0,
};

const PLACEMENT_NUDGE: { [key: string]: number } = {
  cheese: -4,
  pickles: -7,
  onions: -7,
  bacon: -12,
  top_bun: -4,
};

interface StackResult {
  bottomBunClone: THREE.Object3D | null;
  topBunClone:    THREE.Object3D | null;
  totalBox:       THREE.Box3;
}

export interface BurgerIngredients {
  sauce?: "none" | "regular" | "extra"
  lettuce?: number     // 0, 1, or 2
  tomato?: number      // 0, 1, or 2
  pattyCount: number   // 1-5
  cheeseCount?: number // 0 to pattyCount
  pickles?: number     // 0, 1, or 2
  onions?: number      // 0, 1, or 2
  bacon?: number       // 0, 1, 2, or 3
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
    if (name === "bacon") {
      
      const baconStrips = Object.keys(meshes)
        .filter(k => k.startsWith("bacon_"))
        .map(k => meshes[k])

      const baconGroup = new THREE.Group()
      baconStrips.forEach(strip => {
        const stripClone = strip.clone(true)
        baconGroup.add(stripClone)
      })

      const baconGeo = meshes["bacon_1"].geometry
      baconGeo.computeBoundingBox()
      const baconMinY = baconGeo.boundingBox!.min.y
      const baconMaxY = baconGeo.boundingBox!.max.y
      const baconCorrection = HEADROOM_CORRECTION["bacon"] ?? 0
      const baconNudge = PLACEMENT_NUDGE["bacon"] ?? 0

      baconGroup.position.set(0, cursorY - baconMinY + baconNudge, 0)
      group.add(baconGroup)
      cursorY += (baconMaxY - baconMinY) - baconCorrection

      baconGroup.position.set(0, cursorY - baconMinY + baconNudge, 0)
      group.add(baconGroup)
      continue
    }

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
  if (ingredients.sauce === "regular" || ingredients.sauce === "extra") layers.push("sauce")

  // add lettuce if present
  const lettuceCount = Math.min(ingredients.lettuce ?? 0, MAX_LETTUCE)
  for (let i = 0; i < lettuceCount; i++) layers.push("lettuce")

  // add tomato if present
  const tomatoCount = Math.min(ingredients.tomato ?? 0, MAX_TOMATO)
  for (let i = 0; i < tomatoCount; i++) layers.push("tomato")

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
  const picklesCount = Math.min(ingredients.pickles ?? 0, MAX_PICKLES)
  for (let i = 0; i < picklesCount; i++) layers.push("pickles")

  // add onions if present
  const onionsCount = Math.min(ingredients.onions ?? 0, MAX_ONIONS)
  for (let i = 0; i < onionsCount; i++) layers.push("onions")

  // add bacon if present
  const baconCount = Math.min(ingredients.bacon ?? 0, MAX_BACON)
  for (let i = 0; i < baconCount; i++) layers.push("bacon")

  // always end with top bun
  layers.push("top_bun")

  return layers
}