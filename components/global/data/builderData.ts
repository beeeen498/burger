import { BurgerIngredients, MAX_PATTIES, MAX_CHEESE, MAX_LETTUCE, MAX_TOMATO, MAX_PICKLES, MAX_ONIONS, MAX_BACON, MAX_NUGGETS, MAX_EGG, MAX_ONION_RINGS, MAX_FRIED_FISH } from "@/lib/burgerUtils"

// ── Ingredient definitions for the burger builder ──────────────────
export type IngredientKey =
  | "bunType"
  | "pattyCount"
  | "cheeseCount"
  | "lettuce"
  | "tomato"
  | "pickles"
  | "onions"
  | "bacon"
  | "nuggets"
  | "sauce"
  | "friedEgg"
  | "friedFish"
  | "onionRings"

// counter ingredient — has quantity (patty, cheese, etc.)
export interface CounterIngredient {
  type: "counter"
  label: string
  key: IngredientKey
  max: number
  price: number
  emoji: string
}

// toggle ingredient — pick one from a group (bun, sauce)
export interface ToggleIngredient {
  type: "toggle"
  label: string
  key: IngredientKey
  value: string
  price: number
  emoji: string
}

export type Ingredient = CounterIngredient | ToggleIngredient

export interface Category {
  label: string
  ingredients: Ingredient[]
}

// ── Nutrition data per ingredient ──────────────────────────────────
// Source: USDA + real fast food chain nutrition info
// Values are per single unit (one patty, one slice, etc.)

export interface Nutrition {
  calories: number
  protein: number  // grams
  carbs: number    // grams
  fat: number      // grams
}

export const NUTRITION: Record<string, Nutrition> = {
  // ── Buns ────────────────────────────────────────────
  regular_bun: { calories: 120, protein: 4,  carbs: 22, fat: 2  },
  poppy_bun:   { calories: 130, protein: 4,  carbs: 23, fat: 3  },
  waffle_bun:  { calories: 200, protein: 5,  carbs: 30, fat: 8  },
  toast_bun:   { calories: 140, protein: 5,  carbs: 24, fat: 3  },

  // ── Proteins ────────────────────────────────────────
  patty:       { calories: 290, protein: 19, carbs: 0,  fat: 23 },
  nuggets:     { calories: 90,  protein: 6,  carbs: 5,  fat: 5  },
  bacon:       { calories: 70,  protein: 5,  carbs: 0,  fat: 5  },
  fried_fish:  { calories: 200, protein: 14, carbs: 12, fat: 10 },

  // ── Toppings ────────────────────────────────────────
  cheese:      { calories: 60,  protein: 3,  carbs: 1,  fat: 5  },
  lettuce:     { calories: 2,   protein: 0,  carbs: 0,  fat: 0  },
  tomato:      { calories: 5,   protein: 0,  carbs: 1,  fat: 0  },
  pickles:     { calories: 2,   protein: 0,  carbs: 0,  fat: 0  },
  onions:      { calories: 5,   protein: 0,  carbs: 1,  fat: 0  },
  fried_egg:   { calories: 90,  protein: 6,  carbs: 0,  fat: 7  },
  onion_rings: { calories: 150, protein: 2,  carbs: 18, fat: 8  },

  // ── Sauce ────────────────────────────────────────────
  sauce:       { calories: 80,  protein: 0,  carbs: 2,  fat: 8  },
  sauce_extra: { calories: 130, protein: 0,  carbs: 3,  fat: 13 },
}

// ── Categories ─────────────────────────────────────────────────────
export const CATEGORIES: Record<string, Category> = {
  bun: {
    label: "Bun",
    ingredients: [
      { type: "toggle", label: "Regular Bun", key: "bunType", value: "regular", price: 0,   emoji: "🍔" },
      { type: "toggle", label: "Poppy Bun",   key: "bunType", value: "poppy",   price: 0.5, emoji: "🌿" },
    ],
  },
  protein: {
    label: "Protein",
    ingredients: [
      { type: "counter", label: "Beef Patty",  key: "pattyCount", max: MAX_PATTIES,    price: 2.5, emoji: "🥩" },
      { type: "counter", label: "Nuggets",     key: "nuggets",    max: MAX_NUGGETS,    price: 1.5, emoji: "🍗" },
      { type: "counter", label: "Bacon",       key: "bacon",      max: MAX_BACON,      price: 1.5, emoji: "🥓" },
      { type: "counter", label: "Fried Fish",  key: "friedFish",  max: MAX_FRIED_FISH, price: 2.0, emoji: "🐟" },
    ],
  },
  toppings: {
    label: "Toppings",
    ingredients: [
      { type: "counter", label: "Cheese",      key: "cheeseCount", max: MAX_CHEESE,      price: 0.5, emoji: "🧀" },
      { type: "counter", label: "Lettuce",     key: "lettuce",     max: MAX_LETTUCE,     price: 0,   emoji: "🥬" },
      { type: "counter", label: "Tomato",      key: "tomato",      max: MAX_TOMATO,      price: 0,   emoji: "🍅" },
      { type: "counter", label: "Pickles",     key: "pickles",     max: MAX_PICKLES,     price: 0,   emoji: "🥒" },
      { type: "counter", label: "Onions",      key: "onions",      max: MAX_ONIONS,      price: 0,   emoji: "🧅" },
      { type: "counter", label: "Fried Egg",   key: "friedEgg",    max: MAX_EGG,         price: 1.0, emoji: "🍳" },
      { type: "counter", label: "Onion Rings", key: "onionRings",  max: MAX_ONION_RINGS, price: 1.0, emoji: "🧅" },
    ],
  },
  sauce: {
    label: "Sauce",
    ingredients: [
      { type: "toggle", label: "No Sauce", key: "sauce", value: "none",    price: 0,   emoji: "🚫" },
      { type: "toggle", label: "Regular",  key: "sauce", value: "regular", price: 0,   emoji: "🫙" },
      { type: "toggle", label: "Extra",    key: "sauce", value: "extra",   price: 0.5, emoji: "🫙" },
    ],
  },
}

// ── Calculate total nutrition from current ingredients ──────────────
export function calculateNutrition(ingredients: BurgerIngredients): Nutrition {
  const totals: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }

  const add = (key: string, qty: number = 1) => {
    const n = NUTRITION[key]
    if (!n) return
    totals.calories += n.calories * qty
    totals.protein  += n.protein  * qty
    totals.carbs    += n.carbs    * qty
    totals.fat      += n.fat      * qty
  }

  // bun
  const bunKey =
    ingredients.bunType === "poppy"  ? "poppy_bun"  :
    ingredients.bunType === "waffle" ? "waffle_bun" :
    ingredients.bunType === "toast"  ? "toast_bun"  :
    "regular_bun"
  add(bunKey)

  // proteins
  add("patty",      ingredients.pattyCount  ?? 0)
  add("nuggets",    ingredients.nuggets     ?? 0)
  add("bacon",      ingredients.bacon       ?? 0)
  add("fried_fish", ingredients.friedFish   ?? 0)

  // toppings
  add("cheese",      ingredients.cheeseCount ?? 0)
  add("lettuce",     ingredients.lettuce     ?? 0)
  add("tomato",      ingredients.tomato      ?? 0)
  add("pickles",     ingredients.pickles     ?? 0)
  add("onions",      ingredients.onions      ?? 0)
  add("fried_egg",   ingredients.friedEgg    ?? 0)
  add("onion_rings", ingredients.onionRings  ?? 0)

  // sauce
  if (ingredients.sauce === "extra")        add("sauce_extra")
  else if (ingredients.sauce === "regular") add("sauce")

  return totals
}

// ── Calculate total price from current ingredients ──────────────────
export function calculatePrice(ingredients: BurgerIngredients): number {
  let total = 5.99 // base price — bun included

  // bun upgrades
  if (ingredients.bunType === "poppy")  total += 0.5
  if (ingredients.bunType === "waffle") total += 1.0
  if (ingredients.bunType === "toast")  total += 0.5

  // proteins
  total += (ingredients.pattyCount  ?? 0) * 2.5
  total += (ingredients.nuggets     ?? 0) * 1.5
  total += (ingredients.bacon       ?? 0) * 1.5
  total += (ingredients.friedFish   ?? 0) * 2.0

  // toppings
  total += (ingredients.cheeseCount ?? 0) * 0.5
  total += (ingredients.friedEgg    ?? 0) * 1.0
  total += (ingredients.onionRings  ?? 0) * 1.0

  // sauce
  if (ingredients.sauce === "extra") total += 0.5

  return Math.round(total * 100) / 100
}

// ── Randomize ingredients with realistic constraints ────────────────
export function randomizeIngredients(): BurgerIngredients {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  // ── Step 1: Pick one main protein ──
  const proteinType = pick(["patty", "nuggets", "friedFish"])
  let pattyCount = 0
  let nuggets = 0
  let friedFish = 0

  if (proteinType === "patty") {
    pattyCount = pick([1, 1, 1, 2, 2, 3]) // weighted — 1-2 more common
  } else if (proteinType === "nuggets") {
    nuggets = pick([1, 1, 2])
  } else {
    friedFish = pick([1, 1, 2])
  }

  // ── Step 2: Optionally add 1 bacon (only if main protein is 1-2) ──
  const mainCount = pattyCount || nuggets || friedFish
  const bacon = mainCount <= 2 && Math.random() > 0.5 ? 1 : 0

  // ── Step 3: Cheese matches patty count (50% chance of cheese) ──
  const cheeseCount = pattyCount > 0 && Math.random() > 0.4 ? pattyCount : 0

  // ── Step 4: Pick 1-3 random toppings ──
  const toppingOptions = ["lettuce", "tomato", "pickles", "onions"]
  const shuffled = toppingOptions.sort(() => Math.random() - 0.5)
  const toppingCount = pick([1, 2, 2, 3])
  const activeToppings = shuffled.slice(0, toppingCount)

  const lettuce = activeToppings.includes("lettuce") ? pick([1, 1, 2]) : 0
  const tomato = activeToppings.includes("tomato") ? pick([1, 1, 2]) : 0
  const pickles = activeToppings.includes("pickles") ? pick([1, 1, 2]) : 0
  const onions = activeToppings.includes("onions") ? pick([1, 1, 2]) : 0

  // ── Step 5: Rare extras — low chance ──
  const friedEgg = Math.random() > 0.8 ? 1 : 0
  const onionRings = Math.random() > 0.85 ? 1 : 0

  // ── Step 6: Always a sauce ──
  const sauce = pick(["regular", "regular", "extra"]) as "regular" | "extra"

  // ── Step 7: Bun ──
  const bunType = pick(["regular", "regular", "poppy"]) as "regular" | "poppy"

  return {
    bunType,
    sauce,
    pattyCount,
    cheeseCount,
    lettuce,
    tomato,
    pickles,
    onions,
    bacon,
    nuggets,
    friedEgg,
    friedFish,
    onionRings,
    potatoChips: 0,
  }
}