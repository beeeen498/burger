"use client";

// ----- Menu Item Drawer -----
// Slide-in panel for adding or editing a menu item.
// Includes meal toggle with side item selection.

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BurgerIngredients } from "@/lib/burgerUtils";
import styles from "./MenuDrawer.module.scss";

// -- Menu item shape for the drawer --
export interface MenuItemData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  meal_price: number | null;
  calories: number;
  side_items: string[] | null;
  is_available: boolean;
  is_sold_out: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_spicy: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  ingredients: BurgerIngredients | null;
}

// -- Empty item template --
const EMPTY_ITEM: MenuItemData = {
  name: "",
  slug: "",
  description: "",
  category: "burgers",
  price: 0,
  meal_price: null,
  calories: 0,
  side_items: null,
  is_available: true,
  is_sold_out: false,
  is_new: false,
  is_trending: false,
  is_spicy: false,
  is_vegan: false,
  is_vegetarian: false,
  is_gluten_free: false,
  ingredients: null,
};

// -- Category options --
const CATEGORIES = ["burgers", "specials", "sides", "desserts", "breakfast"];

// -- Available side items --
const SIDE_OPTIONS = [
  { key: "french_fries", label: "Fries 🍟" },
  { key: "onion_rings_extra", label: "Onion Rings 🧅" },
  { key: "nuggets_extra", label: "Nuggets 🍗" },
  { key: "vanilla_milkshake", label: "Milkshake 🥤" },
];

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editItem: MenuItemData | null;
  onSaved: () => void;
}

export default function MenuDrawer({
  isOpen,
  onClose,
  editItem,
  onSaved,
}: MenuDrawerProps) {
  const [item, setItem] = useState<MenuItemData>(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [isMeal, setIsMeal] = useState(false);

  // -- Populate form when editing or reset when adding --
  useEffect(() => {
    if (editItem) {
      setItem(editItem);
      setIsMeal(!!(editItem.side_items && editItem.side_items.length > 0));
    } else {
      setItem(EMPTY_ITEM);
      setIsMeal(false);
    }
  }, [editItem, isOpen]);

  // -- Auto-generate slug from name --
  const updateName = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setItem((prev) => ({ ...prev, name, slug }));
  };

  // -- Update a field --
  const updateField = (field: keyof MenuItemData, value: unknown) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  // -- Toggle meal on/off --
  const handleMealToggle = (checked: boolean) => {
    setIsMeal(checked);
    if (checked) {
      // -- Default sides: fries + milkshake --
      setItem((prev) => ({
        ...prev,
        side_items: ["french_fries", "vanilla_milkshake"],
        meal_price: prev.meal_price ?? prev.price + 5,
      }));
    } else {
      setItem((prev) => ({
        ...prev,
        side_items: null,
        meal_price: null,
      }));
    }
  };

  // -- Toggle a side item on/off --
  const toggleSideItem = (key: string) => {
    setItem((prev) => {
      const current = prev.side_items ?? [];
      const updated = current.includes(key)
        ? current.filter((s) => s !== key)
        : [...current, key];
      return { ...prev, side_items: updated.length > 0 ? updated : null };
    });
  };

  // -- Save item --
  const handleSave = async () => {
    if (!item.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (item.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setSaving(true);

    if (item.id) {
      const { id, ...updateData } = item;
      await supabase.from("menu_items").update(updateData).eq("id", id);
      toast.success("Item updated! 🍔");
    } else {
      await supabase.from("menu_items").insert(item);
      toast.success("Item added! 🍔");
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  // -- Delete item --
  const handleDelete = async () => {
    if (!item.id) return;

    await supabase.from("menu_items").delete().eq("id", item.id);
    toast.success("Item deleted");
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* -- Overlay -- */}
      <div className={styles.overlay} onClick={onClose} />

      {/* -- Drawer panel -- */}
      <div className={styles.drawer}>
        {/* -- Header -- */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {item.id ? "Edit Item" : "Add New Item"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* -- Form -- */}
        <div className={styles.form}>
          {/* -- Name -- */}
          <label className={styles.field}>
            Name
            <input
              className={styles.input}
              type="text"
              placeholder="Classic Smash"
              value={item.name}
              onChange={(e) => updateName(e.target.value)}
            />
          </label>

          {/* -- Slug (auto-generated, editable) -- */}
          <label className={styles.field}>
            Slug
            <input
              className={styles.input}
              type="text"
              placeholder="classic-smash"
              value={item.slug}
              onChange={(e) => updateField("slug", e.target.value)}
            />
          </label>

          {/* -- Description -- */}
          <label className={styles.field}>
            Description
            <textarea
              className={styles.textarea}
              placeholder="A juicy smashed patty with..."
              value={item.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
          </label>

          {/* -- Category -- */}
          <label className={styles.field}>
            Category
            <select
              className={styles.select}
              value={item.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </label>

          {/* -- Price + Calories row -- */}
          <div className={styles.priceRow}>
            <label className={styles.field}>
              Price
              <input
                className={styles.input}
                type="number"
                step="0.01"
                value={item.price || ""}
                onChange={(e) =>
                  updateField("price", parseFloat(e.target.value) || 0)
                }
              />
            </label>

            <label className={styles.field}>
              Calories
              <input
                className={styles.input}
                type="number"
                value={item.calories || ""}
                onChange={(e) =>
                  updateField("calories", parseInt(e.target.value) || 0)
                }
              />
            </label>
          </div>

          {/* ----- Ingredients (burgers/specials only) ----- */}
          {(item.category === "burgers" || item.category === "specials") && (
            <div className={styles.ingredientsSection}>
              <h3 className={styles.badgeTitle}>Ingredients</h3>

              {/* -- Bun type -- */}
              <label className={styles.field}>
                Bun Type
                <select
                  className={styles.select}
                  value={item.ingredients?.bunType ?? "regular"}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      ingredients: {
                        ...prev.ingredients,
                        bunType: e.target.value as BurgerIngredients["bunType"],
                      },
                    }))
                  }
                >
                  {["regular", "poppy", "waffle", "toast", "donut"].map((b) => (
                    <option key={b} value={b}>
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              {/* -- Sauce -- */}
              <label className={styles.field}>
                Sauce
                <select
                  className={styles.select}
                  value={item.ingredients?.sauce ?? "regular"}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      ingredients: {
                        ...prev.ingredients,
                        sauce: e.target.value as BurgerIngredients["sauce"],
                      },
                    }))
                  }
                >
                  {["none", "regular", "extra"].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              {/* -- Counter ingredients -- */}
              <div className={styles.ingredientGrid}>
                {[
                  { key: "pattyCount", label: "Patties", max: 5 },
                  { key: "cheeseCount", label: "Cheese", max: 5 },
                  { key: "lettuce", label: "Lettuce", max: 1 },
                  { key: "tomato", label: "Tomato", max: 2 },
                  { key: "pickles", label: "Pickles", max: 2 },
                  { key: "onions", label: "Onions", max: 2 },
                  { key: "bacon", label: "Bacon", max: 2 },
                  { key: "nuggets", label: "Nuggets", max: 2 },
                  { key: "friedEgg", label: "Fried Egg", max: 1 },
                  { key: "friedFish", label: "Fried Fish", max: 3 },
                  { key: "onionRings", label: "Onion Rings", max: 1 },
                  { key: "potatoChips", label: "Potato Chips", max: 1 },
                  { key: "shrimps", label: "Shrimps", max: 1 },
                  { key: "giantNugget", label: "Giant Nugget", max: 1 },
                ].map((ing) => (
                  <div key={ing.key} className={styles.ingredientRow}>
                    <span className={styles.ingredientLabel}>{ing.label}</span>
                    <div className={styles.counterControls}>
                      <button
                        className={styles.counterBtn}
                        onClick={() =>
                          setItem((prev) => ({
                            ...prev,
                            ingredients: {
                              ...prev.ingredients,
                              [ing.key]: Math.max(
                                0,
                                ((prev.ingredients?.[
                                  ing.key as keyof BurgerIngredients
                                ] as number) ?? 0) - 1,
                              ),
                            },
                          }))
                        }
                      >
                        −
                      </button>
                      <span className={styles.counterValue}>
                        {(item.ingredients?.[
                          ing.key as keyof BurgerIngredients
                        ] as number) ?? 0}
                      </span>
                      <button
                        className={styles.counterBtn}
                        onClick={() =>
                          setItem((prev) => ({
                            ...prev,
                            ingredients: {
                              ...prev.ingredients,
                              [ing.key]: Math.min(
                                ing.max,
                                ((prev.ingredients?.[
                                  ing.key as keyof BurgerIngredients
                                ] as number) ?? 0) + 1,
                              ),
                            },
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----- Meal Toggle ----- */}
          <div className={styles.mealSection}>
            <label className={styles.mealToggle}>
              <input
                type="checkbox"
                checked={isMeal}
                onChange={(e) => handleMealToggle(e.target.checked)}
              />
              This is a meal 🍽️
            </label>

            {/* -- Meal options (visible when toggled on) -- */}
            {isMeal && (
              <div className={styles.mealOptions}>
                {/* -- Meal price -- */}
                <label className={styles.field}>
                  Meal Price
                  <input
                    className={styles.input}
                    type="number"
                    step="0.01"
                    value={item.meal_price ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField("meal_price", val ? parseFloat(val) : null);
                    }}
                  />
                </label>

                {/* -- Side items checkboxes -- */}
                <div className={styles.sidesGrid}>
                  {SIDE_OPTIONS.map((side) => (
                    <label key={side.key} className={styles.sideToggle}>
                      <input
                        type="checkbox"
                        checked={item.side_items?.includes(side.key) ?? false}
                        onChange={() => toggleSideItem(side.key)}
                      />
                      {side.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* -- Badges -- */}
          <div className={styles.badgeSection}>
            <h3 className={styles.badgeTitle}>Badges</h3>
            <div className={styles.badgeGrid}>
              {[
                { key: "is_new", label: "New" },
                { key: "is_trending", label: "Trending" },
                { key: "is_spicy", label: "Spicy 🌶️" },
                { key: "is_vegan", label: "Vegan 🌱" },
                { key: "is_vegetarian", label: "Vegetarian" },
                { key: "is_gluten_free", label: "Gluten Free" },
              ].map((badge) => (
                <label key={badge.key} className={styles.badgeToggle}>
                  <input
                    type="checkbox"
                    checked={item[badge.key as keyof MenuItemData] as boolean}
                    onChange={(e) =>
                      updateField(
                        badge.key as keyof MenuItemData,
                        e.target.checked,
                      )
                    }
                  />
                  {badge.label}
                </label>
              ))}
            </div>
          </div>

          {/* -- Status -- */}
          <div className={styles.badgeSection}>
            <h3 className={styles.badgeTitle}>Status</h3>
            <div className={styles.badgeGrid}>
              <label className={styles.badgeToggle}>
                <input
                  type="checkbox"
                  checked={item.is_available}
                  onChange={(e) =>
                    updateField("is_available", e.target.checked)
                  }
                />
                Available
              </label>
              <label className={styles.badgeToggle}>
                <input
                  type="checkbox"
                  checked={item.is_sold_out}
                  onChange={(e) => updateField("is_sold_out", e.target.checked)}
                />
                Sold Out
              </label>
            </div>
          </div>
        </div>

        {/* -- Footer actions -- */}
        <div className={styles.footer}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : item.id ? "Update Item" : "Add Item"}
          </button>

          {item.id && (
            <button className={styles.deleteBtn} onClick={handleDelete}>
              Delete Item
            </button>
          )}
        </div>
      </div>
    </>
  );
}
