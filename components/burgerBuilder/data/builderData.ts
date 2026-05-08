import { BurgerIngredients, MAX_PATTIES, MAX_CHEESE, MAX_LETTUCE, MAX_TOMATO, MAX_PICKLES, MAX_ONIONS, MAX_BACON, MAX_NUGGETS } from "@/lib/burgerUtils"

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

  // ── Proteins ────────────────────────────────────────
  patty: { calories: 290, protein: 19, carbs: 0, fat: 23 },

  nuggets:     { calories: 90,  protein: 6,  carbs: 5,  fat: 5  },
  bacon:       { calories: 70,  protein: 5,  carbs: 0,  fat: 5  },

  // ── Toppings ────────────────────────────────────────
  cheese:      { calories: 60,  protein: 3,  carbs: 1,  fat: 5  },
  lettuce:     { calories: 2,   protein: 0,  carbs: 0,  fat: 0  },
  tomato:      { calories: 5,   protein: 0,  carbs: 1,  fat: 0  },
  pickles:     { calories: 2,   protein: 0,  carbs: 0,  fat: 0  },
  onions:      { calories: 5,   protein: 0,  carbs: 1,  fat: 0  },

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
      { type: "counter", label: "Beef Patty", key: "pattyCount", max: 5, price: 2.5, emoji: "🥩" },
      { type: "counter", label: "Nuggets",    key: "nuggets",    max: 2, price: 1.5, emoji: "🍗" },
      { type: "counter", label: "Bacon",      key: "bacon",      max: 2, price: 1.5, emoji: "🥓" },
    ],
  },
  toppings: {
    label: "Toppings",
    ingredients: [
      { type: "counter", label: "Cheese",  key: "cheeseCount", max: 5, price: 0.5, emoji: "🧀" },
      { type: "counter", label: "Lettuce", key: "lettuce",     max: 2, price: 0,   emoji: "🥬" },
      { type: "counter", label: "Tomato",  key: "tomato",      max: 2, price: 0,   emoji: "🍅" },
      { type: "counter", label: "Pickles", key: "pickles",     max: 2, price: 0,   emoji: "🥒" },
      { type: "counter", label: "Onions",  key: "onions",      max: 2, price: 0,   emoji: "🧅" },
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

  // ── Bun ───────────────────────────────────────────
  add(ingredients.bunType === "poppy" ? "poppy_bun" : "regular_bun")

  // ── Proteins ──────────────────────────────────────
  add("patty",   ingredients.pattyCount  ?? 0)
  add("nuggets", ingredients.nuggets     ?? 0)
  add("bacon",   ingredients.bacon       ?? 0)

  // ── Toppings ──────────────────────────────────────
  add("cheese",  ingredients.cheeseCount ?? 0)
  add("lettuce", ingredients.lettuce     ?? 0)
  add("tomato",  ingredients.tomato      ?? 0)
  add("pickles", ingredients.pickles     ?? 0)
  add("onions",  ingredients.onions      ?? 0)

  // ── Sauce ─────────────────────────────────────────
  if (ingredients.sauce === "extra")   add("sauce_extra")
  else if (ingredients.sauce === "regular") add("sauce")

  return totals
}

// ── Calculate total price from current ingredients ──────────────────
export function calculatePrice(ingredients: BurgerIngredients): number {
  let total = 5.99 // base price — bun included

  // extra for poppy bun
  if (ingredients.bunType === "poppy") total += 0.5

  // proteins
  total += (ingredients.pattyCount  ?? 0) * 2.5
  total += (ingredients.nuggets     ?? 0) * 1.5
  total += (ingredients.bacon       ?? 0) * 1.5

  // toppings
  total += (ingredients.cheeseCount ?? 0) * 0.5

  // sauce
  if (ingredients.sauce === "extra") total += 0.5

  return Math.round(total * 100) / 100 // avoid floating point weirdness
}

// ── Randomize ingredients within their max limits ───────────────────
export function randomizeIngredients(): BurgerIngredients {
  const rand = (max: number) => Math.floor(Math.random() * (max + 1))

  return {
    bunType:     Math.random() > 0.5 ? "poppy" : "regular",
    sauce:       ["none", "regular", "extra"][Math.floor(Math.random() * 3)] as "none" | "regular" | "extra",
    pattyCount:  rand(MAX_PATTIES),
    cheeseCount: rand(MAX_CHEESE),
    lettuce:     rand(MAX_LETTUCE),
    tomato:      rand(MAX_TOMATO),
    pickles:     rand(MAX_PICKLES),
    onions:      rand(MAX_ONIONS),
    bacon:       rand(MAX_BACON),
    nuggets:     rand(MAX_NUGGETS),
  }
}