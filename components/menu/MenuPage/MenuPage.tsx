"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { BurgerIngredients } from "@/lib/burgerUtils"
import MenuCard from "../MenuCard/MenuCard"

export interface MenuItem {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  meal_price: number | null        // null for items that have no meal option
  calories: number | null
  ingredients: BurgerIngredients | null  // JSON object — used for burger 3D rendering
  side_items: string[] | null            // e.g. ["french_fries", "milkshake"] for 3D scene
  model_path: string | null              // path to GLB file — used for non-burger items
  available_from: string | null          // e.g. "07:00" — for time-gated items like breakfast
  available_until: string | null         // e.g. "11:00"
  is_available: boolean
  is_sold_out: boolean
  is_chef_pick: boolean
  is_most_popular: boolean
  is_new: boolean
  is_trending: boolean
  is_spicy: boolean
  is_vegan: boolean
  is_vegetarian: boolean
  is_gluten_free: boolean
  created_at: string
}

// ── Category order ──────────────────────────────────
const CATEGORIES = ["single", "meal", "breakfast", "extras", "sauces", "drinks", "desserts"]

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch menu items from Supabase ──────────────────
  useEffect(() => {
    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")                              // fetch all columns
        .order("created_at", { ascending: true }) // oldest first — preserves seed order

      if (error) {
        setError(error.message)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchMenuItems()
  }, []) 

  // ── Loading and error states ────────────────────────
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main>
      {/* ── Loop through categories in order ── */}
      {CATEGORIES.map(category => {
        const categoryItems = items.filter(item => item.category === category)

        // If no items exist for this category, skip rendering the section entirely
        if (categoryItems.length === 0) return null

        return (
          <section key={category}>

            {/* Section heading */}
            <h2>{category}</h2>

            {/* Card */}
            {categoryItems.map(item => (
                <MenuCard key={item.id} item={item} />
            ))}

          </section>
        )
      })}
    </main>
  )
}