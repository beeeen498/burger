"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { BurgerIngredients } from "@/lib/burgerUtils"
import { useRouter } from "next/navigation"
import Header from "@/components/global/Header/Header"
import MenuFilters from "../MenuFilters/MenuFilters"
import MenuCard from "../MenuCard/MenuCard"
import SmallCard from "../SmallCard/SmallCard"
import styles from "./MenuPage.module.scss"

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

const CATEGORY_LABELS: Record<string, string> = {
  single:    "Singles",
  meal:      "Meal Items",
  breakfast: "Breakfast",
  extras:    "Extras",
  sauces:    "Sauces",
  drinks:    "Drinks",
  desserts:  "Desserts",
}

// ── Category order ──────────────────────────────────
const CATEGORIES = ["single", "meal", "breakfast", "extras", "sauces", "drinks", "desserts"]

// ── Categories that use the small card layout ──
const SMALL_CARD_CATEGORIES = ["extras", "sauces", "drinks", "desserts"]

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ── Active category for the filter ──
  const [activeCategory, setActiveCategory] = useState("single")

  // ── Categories that actually have items ──
  const availableCategories = CATEGORIES.filter(cat =>
    items.some(item => item.category === cat)
  )

  // ── Fetch menu items from Supabase ──────────────────
  useEffect(() => {
    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchMenuItems()
  }, [])

  // ── Scrollspy — update active category as user scrolls ──
  useEffect(() => {
    if (items.length === 0) return

    const observers: IntersectionObserver[] = []

    CATEGORIES.forEach(category => {
      const section = document.getElementById(`section-${category}`)
      if (!section) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCategory(category)
          }
        },
        {
          rootMargin: "-30% 0px -60% 0px", // triggers when section is in the middle of viewport
        }
      )

      observer.observe(section)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [items])

  // ── Scroll to section when filter is clicked ──
  const handleFilterSelect = (category: string) => {
    setActiveCategory(category)
    const section = document.getElementById(`section-${category}`)
    if (section) {
      const headerOffset = 120 // adjust this to match your sticky header height
      const top = section.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // ── Update URL when active category changes ──
  useEffect(() => {
    router.replace(`?category=${activeCategory}`, { scroll: false })
  }, [activeCategory])

  // ── Loading and error states ────────────────────────
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main className={styles.page}>

      {/* ── Static header ── */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      {/* ── Page layout — filters + cards ── */}
      <div className={styles.layout}>

        {/* ── Filters ── */}
        <MenuFilters
          categories={availableCategories}
          activeCategory={activeCategory}
          onSelect={handleFilterSelect}
        />

        {/* ── Cards ── */}
        <div className={styles.content}>
          {CATEGORIES.map(category => {
            const categoryItems = items.filter(item => item.category === category)
            if (categoryItems.length === 0) return null

            return (
              <section key={category} id={`section-${category}`} className={styles.section}>
                <h2 className={styles.sectionLabel}>
                  {CATEGORY_LABELS[category] ?? category}
                </h2>
                
                <div className={SMALL_CARD_CATEGORIES.includes(category) ? styles.smallCardGrid : styles.cardList}>
                  {categoryItems.map(item => (
                    SMALL_CARD_CATEGORIES.includes(category)
                      ? <SmallCard key={item.id} item={item} />
                      : <MenuCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

      </div>
    </main>
  )
}