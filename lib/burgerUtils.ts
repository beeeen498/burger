/**
 * Shared burger stacking utility.
 *
 * Used by the burger builder, featured items, menu cards, and challenge
 * teaser to stack ingredients in 3D. Instead of duplicating the logic,
 * this utility handles it in one place.
 *
 * stackBurgerLayers(group, meshes, layers) — clones each mesh, measures
 * its real geometry height via bounding box, and stacks the layers flush
 * on top of each other using geometry bounding box measurements, and centers
 * the stack horizontally.
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
export const MAX_PATTIES = 5;
export const MAX_CHEESE = 5;
export const MAX_LETTUCE = 1;
export const MAX_TOMATO = 2;
export const MAX_PICKLES = 2;
export const MAX_ONIONS = 2;
export const MAX_BACON = 2;
export const MAX_NUGGETS = 2;
export const MAX_EGG = 1;
export const MAX_ONION_RINGS = 1;
export const MAX_FRIED_FISH = 3;
export const MAX_CHIPS = 1;

// How many units to subtract from each mesh's maxY to find the true visible top.
// Derived from geometry bounding box analysis of the burger.glb meshes.
// the order is - bottom_bun → sauce → lettuce → tomato → [patty + cheese] → [fried_fish + cheese] → pickles → onions → [nuggets + cheese] → bacon → onion_rings → fried_egg → potato_chips → top_bun
const HEADROOM_CORRECTION: { [key: string]: number } = {
  bottom_bun: 0,
  bottom_waffle: 0,
  bottom_toast: 0,
  sauce: 0,
  lettuce: 0,
  tomato: 0,
  patty: 4,
  nuggets: 3.5,
  cheese: 4,
  pickles: -1,
  onions: -2.5,
  bacon: -3,
  fried_egg: -13.5,
  onion_rings: 0,
  fried_fish: -12,
  potato_chips: 0,
  top_bun: 0,
  poppy_bun: -4,
  top_waffle: 0,
  top_toast: 0,
  bottom_donut: 0,
  top_donut: 0,
  shrimps: 0,
};

const PLACEMENT_NUDGE: { [key: string]: number } = {
  cheese: -4.5,
  nuggets: -2,
  pickles: 3,
  onions: 3,
  bacon: -0.5,
  fried_egg: 6,
  onion_rings: 0,
  fried_fish: 7.5,
  potato_chips: 0,
  top_bun: 0,
  poppy_bun: 0,
  top_waffle: 4,
  top_toast: 0,
  bottom_donut: 0,
  top_donut: 0,
  shrimps: 0,
};

interface StackResult {
  bottomBunClone: THREE.Object3D | null;
  topBunClone: THREE.Object3D | null;
  totalBox: THREE.Box3;
}

export interface BurgerIngredients {
  bunType?: "regular" | "poppy" | "waffle" | "toast" | "donut";
  sauce?: "none" | "regular" | "extra";
  lettuce?: number; // 0, 1
  tomato?: number; // 0, 1, or 2
  pattyCount?: number; // 0-5
  cheeseCount?: number; // 0 to pattyCount
  pickles?: number; // 0, 1, or 2
  onions?: number; // 0, 1, or 2
  bacon?: number; // 0, 1, or 2
  nuggets?: number; // 0, 1, or 2
  friedEgg?: number; // 0 or 1
  friedFish?: number; // 0, 1, 2, or 3
  onionRings?: number; // 0 or 1
  potatoChips?: number; // 0 or 1
  shrimps?: number; // 0 or 1
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
  layers: string[],
): StackResult {
  // Clear existing children
  while (group.children.length) {
    group.remove(group.children[0]);
  }

  let bottomBunClone: THREE.Object3D | null = null;
  let topBunClone: THREE.Object3D | null = null;
  let cursorY = 0;

  for (const name of layers) {
    // bottom donut — exported as multiple pieces (bottom_donut_1, bottom_donut_2 etc)
    if (name === "bottom_donut") {
      const pieces = Object.keys(meshes)
        .filter((k) => k.startsWith("bottom_donut_"))
        .map((k) => meshes[k]);

      const pieceGroup = new THREE.Group();
      pieces.forEach((piece) => pieceGroup.add(piece.clone(true)));

      const refGeo = meshes["bottom_donut_1"].geometry;
      refGeo.computeBoundingBox();
      const minY = refGeo.boundingBox!.min.y;
      const maxY = refGeo.boundingBox!.max.y;
      const correction = HEADROOM_CORRECTION["bottom_donut"] ?? 0;
      const nudge = PLACEMENT_NUDGE["bottom_donut"] ?? 0;

      pieceGroup.position.set(0, cursorY - minY + nudge, 0);
      group.add(pieceGroup);
      cursorY += maxY - minY - correction;
      bottomBunClone = pieceGroup;
      continue;
    }

    // top donut — exported as multiple pieces (top_donut_1, top_donut_2 etc)
    if (name === "top_donut") {
      const pieces = Object.keys(meshes)
        .filter((k) => k.startsWith("top_donut_"))
        .map((k) => meshes[k]);

      const pieceGroup = new THREE.Group();
      pieces.forEach((piece) => pieceGroup.add(piece.clone(true)));

      const refGeo = meshes["top_donut_1"].geometry;
      refGeo.computeBoundingBox();
      const minY = refGeo.boundingBox!.min.y;
      const maxY = refGeo.boundingBox!.max.y;
      const correction = HEADROOM_CORRECTION["top_donut"] ?? 0;
      const nudge = PLACEMENT_NUDGE["top_donut"] ?? 0;

      pieceGroup.position.set(0, cursorY - minY + nudge, 0);
      group.add(pieceGroup);
      cursorY += maxY - minY - correction;
      topBunClone = pieceGroup;
      continue;
    }

    // bacon — exported as multiple strips (bacon_1, bacon_2 etc)
    if (name === "bacon") {
      const baconStrips = Object.keys(meshes)
        .filter((k) => k.startsWith("bacon_"))
        .map((k) => meshes[k]);

      const baconGroup = new THREE.Group();
      baconStrips.forEach((strip) => {
        const stripClone = strip.clone(true);
        baconGroup.add(stripClone);
      });

      const baconGeo = meshes["bacon_1"].geometry;
      baconGeo.computeBoundingBox();
      const baconMinY = baconGeo.boundingBox!.min.y;
      const baconMaxY = baconGeo.boundingBox!.max.y;
      const baconCorrection = HEADROOM_CORRECTION["bacon"] ?? 0;
      const baconNudge = PLACEMENT_NUDGE["bacon"] ?? 0;

      baconGroup.position.set(0, cursorY - baconMinY + baconNudge, 0);
      group.add(baconGroup);
      cursorY += baconMaxY - baconMinY - baconCorrection;
      continue;
    }

    // nuggets — exported as multiple pieces (nuggets_1, nuggets_2 etc)
    // nuggets
    if (name === "nuggets") {
      const nuggetPieces = Object.keys(meshes)
        .filter((k) => k.startsWith("nuggets_"))
        .map((k) => meshes[k]);

      const nuggetGroup = new THREE.Group();
      nuggetPieces.forEach((piece) => {
        const pieceClone = piece.clone(true);
        nuggetGroup.add(pieceClone);
      });

      // ── Center nugget pieces within their group ──
      const nuggetWorldBox = new THREE.Box3().setFromObject(nuggetGroup);
      const nuggetWorldCenter = nuggetWorldBox.getCenter(new THREE.Vector3());
      nuggetGroup.children.forEach((child) => {
        child.position.x -= nuggetWorldCenter.x;
        child.position.z -= nuggetWorldCenter.z;
      });

      const nuggetGeo = meshes["nuggets_1"].geometry;
      nuggetGeo.computeBoundingBox();
      const nuggetMinY = nuggetGeo.boundingBox!.min.y;
      const nuggetMaxY = nuggetGeo.boundingBox!.max.y;
      const nuggetCorrection = HEADROOM_CORRECTION["nuggets"] ?? 0;
      const nuggetNudge = PLACEMENT_NUDGE["nuggets"] ?? 0;

      nuggetGroup.position.set(0, cursorY - nuggetMinY + nuggetNudge, 0);
      group.add(nuggetGroup);
      cursorY += nuggetMaxY - nuggetMinY - nuggetCorrection;
      continue;
    }

    // onion rings — exported as multiple pieces (onion_rings_1, onion_rings_2 etc)
    if (name === "onion_rings") {
      const pieces = Object.keys(meshes)
        .filter((k) => k.startsWith("onion_rings_"))
        .map((k) => meshes[k]);

      const pieceGroup = new THREE.Group();
      pieces.forEach((piece) => pieceGroup.add(piece.clone(true)));

      const refGeo = meshes["onion_rings_1"].geometry;
      refGeo.computeBoundingBox();
      const minY = refGeo.boundingBox!.min.y;
      const maxY = refGeo.boundingBox!.max.y;
      const correction = HEADROOM_CORRECTION["onion_rings"] ?? 0;
      const nudge = PLACEMENT_NUDGE["onion_rings"] ?? 0;

      pieceGroup.position.set(0, cursorY - minY + nudge, 0);
      group.add(pieceGroup);
      cursorY += maxY - minY - correction;
      continue;
    }

    // shrimps — exported as multiple pieces (shrimps_1, shrimps_2 etc)
    if (name === "shrimps") {
      const pieces = Object.keys(meshes)
        .filter((k) => k.startsWith("shrimps_"))
        .map((k) => meshes[k]);

      const pieceGroup = new THREE.Group();
      pieces.forEach((piece) => pieceGroup.add(piece.clone(true)));

      const refGeo = meshes["shrimps_1"].geometry;
      refGeo.computeBoundingBox();
      const minY = refGeo.boundingBox!.min.y;
      const maxY = refGeo.boundingBox!.max.y;
      const correction = HEADROOM_CORRECTION["shrimps"] ?? 0;
      const nudge = PLACEMENT_NUDGE["shrimps"] ?? 0;

      pieceGroup.position.set(0, cursorY - minY + nudge, 0);
      group.add(pieceGroup);
      cursorY += maxY - minY - correction;
      continue;
    }

    // potato chips — exported as multiple pieces (potato_chips_1, potato_chips_2 etc)
    if (name === "potato_chips") {
      const pieces = Object.keys(meshes)
        .filter((k) => k.startsWith("potato_chips_"))
        .map((k) => meshes[k]);

      const pieceGroup = new THREE.Group();
      pieces.forEach((piece) => pieceGroup.add(piece.clone(true)));

      const refGeo = meshes["potato_chips_1"].geometry;
      refGeo.computeBoundingBox();
      const minY = refGeo.boundingBox!.min.y;
      const maxY = refGeo.boundingBox!.max.y;
      const correction = HEADROOM_CORRECTION["potato_chips"] ?? 0;
      const nudge = PLACEMENT_NUDGE["potato_chips"] ?? 0;

      pieceGroup.position.set(0, cursorY - minY + nudge, 0);
      group.add(pieceGroup);
      cursorY += maxY - minY - correction;
      continue;
    }

    // all other meshes — single objects
    const sourceMesh = meshes[name];
    if (!sourceMesh) continue;

    const clone = sourceMesh.clone(true);
    clone.castShadow = true;
    clone.receiveShadow = true;

    const geo = (sourceMesh as THREE.Mesh).geometry;
    geo.computeBoundingBox();
    const geoBox = geo.boundingBox!;
    const geoMinY = geoBox.min.y;
    const geoMaxY = geoBox.max.y;
    const correction = HEADROOM_CORRECTION[name] ?? 0;
    const nudge = PLACEMENT_NUDGE[name] ?? 0;

    clone.position.set(0, cursorY - geoMinY + nudge, 0);
    group.add(clone);
    cursorY += geoMaxY - geoMinY - correction;

    if (
      name === "bottom_bun" ||
      name === "bottom_waffle" ||
      name === "bottom_toast"
    )
      bottomBunClone = clone;
    if (name === "top_bun" || name === "top_waffle" || name === "top_toast")
      topBunClone = clone;
  }

  // ── Center the stack based on the bottom bun — the foundation everything sits on ──
  if (bottomBunClone) {
    const bunBox = new THREE.Box3().setFromObject(bottomBunClone);
    const bunCenter = bunBox.getCenter(new THREE.Vector3());
    group.position.x = -bunCenter.x;
    group.position.z = -bunCenter.z;
  } else {
    const totalBox = new THREE.Box3().setFromObject(group);
    const center = totalBox.getCenter(new THREE.Vector3());
    group.position.x = -center.x;
    group.position.z = -center.z;
  }

  const totalBox = new THREE.Box3().setFromObject(group);

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
 * Always enforces a bottom bun as first and a top bun as last.
 * Bun type determines which meshes are used.
 * Cheese is split between patties, fish, and nuggets in that priority order.
 */
export function buildBurgerSequence(ingredients: BurgerIngredients): string[] {
  const layers: string[] = [];

  // always start with bottom bun (type-dependent)
  const bottomBun =
    ingredients.bunType === "waffle"
      ? "bottom_waffle"
      : ingredients.bunType === "toast"
        ? "bottom_toast"
        : ingredients.bunType === "donut"
          ? "bottom_donut"
          : "bottom_bun";
  layers.push(bottomBun);

  // sauce
  if (ingredients.sauce === "regular" || ingredients.sauce === "extra")
    layers.push("sauce");

  // lettuce
  const lettuceCount = Math.min(ingredients.lettuce ?? 0, MAX_LETTUCE);
  for (let i = 0; i < lettuceCount; i++) layers.push("lettuce");

  // tomato
  const tomatoCount = Math.min(ingredients.tomato ?? 0, MAX_TOMATO);
  for (let i = 0; i < tomatoCount; i++) layers.push("tomato");

  // pre-calculate all protein counts so cheese can be split correctly
  const pattyCount = Math.min(
    Math.max(ingredients.pattyCount ?? 0, 0),
    MAX_PATTIES,
  );
  const friedFishCount = Math.min(ingredients.friedFish ?? 0, MAX_FRIED_FISH);
  const nuggetCount = Math.min(ingredients.nuggets ?? 0, MAX_NUGGETS);
  const baconCount = Math.min(ingredients.bacon ?? 0, MAX_BACON);
  const totalCheese = Math.min(ingredients.cheeseCount ?? 0, MAX_CHEESE);

  // split cheese — patties get first pick, fish get second, nuggets get the rest
  let cheeseForPatties = totalCheese; // all cheese goes to patties first, extras pile on top
  let cheeseForFish = Math.min(
    totalCheese - Math.min(totalCheese, pattyCount),
    friedFishCount,
  );
  let cheeseForNuggets = Math.min(
    totalCheese - Math.min(totalCheese, pattyCount) - cheeseForFish,
    nuggetCount,
  );

  // patties + cheese (one per patty)
  for (let i = 0; i < pattyCount; i++) {
    layers.push("patty");
    if (cheeseForPatties > 0) {
      layers.push("cheese");
      cheeseForPatties--;
    }
  }

  // extra cheese piles on top of the last patty
  while (cheeseForPatties > 0) {
    layers.push("cheese");
    cheeseForPatties--;
  }

  // fried fish + cheese
  for (let i = 0; i < friedFishCount; i++) {
    layers.push("fried_fish");
    if (cheeseForFish > 0) {
      layers.push("cheese");
      cheeseForFish--;
    }
  }

  // pickles
  const picklesCount = Math.min(ingredients.pickles ?? 0, MAX_PICKLES);
  for (let i = 0; i < picklesCount; i++) layers.push("pickles");

  // onions
  const onionsCount = Math.min(ingredients.onions ?? 0, MAX_ONIONS);
  for (let i = 0; i < onionsCount; i++) layers.push("onions");

  // nuggets + cheese
  for (let i = 0; i < nuggetCount; i++) {
    layers.push("nuggets");
    if (cheeseForNuggets > 0) {
      layers.push("cheese");
      cheeseForNuggets--;
    }
  }

  // bacon
  for (let i = 0; i < baconCount; i++) layers.push("bacon");

  // onion rings — on top of bacon
  const onionRingsCount = Math.min(
    ingredients.onionRings ?? 0,
    MAX_ONION_RINGS,
  );
  for (let i = 0; i < onionRingsCount; i++) layers.push("onion_rings");

  // fried egg — at the top
  const eggCount = Math.min(ingredients.friedEgg ?? 0, MAX_EGG);
  for (let i = 0; i < eggCount; i++) layers.push("fried_egg");

  // potato chips — right before the top bun
  const chipsCount = Math.min(ingredients.potatoChips ?? 0, MAX_CHIPS);
  for (let i = 0; i < chipsCount; i++) layers.push("potato_chips");

  // shrimps — near the top
  const shrimpsCount = Math.min(ingredients.shrimps ?? 0, 1);
  for (let i = 0; i < shrimpsCount; i++) layers.push("shrimps");

  // top bun (type-dependent)
  const topBun =
    ingredients.bunType === "poppy"
      ? "poppy_bun"
      : ingredients.bunType === "waffle"
        ? "top_waffle"
        : ingredients.bunType === "toast"
          ? "top_toast"
          : ingredients.bunType === "donut"
            ? "top_donut"
            : "top_bun";
  layers.push(topBun);

  return layers;
}
