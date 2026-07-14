"use client";

// ----- Admin Menu Management -----
// Table of all menu items with toggles and inline price editing.
// Burger of the Day picker at the top.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./AdminMenu.module.scss";

// -- Menu item type --
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  is_sold_out: boolean;
  is_chef_pick: boolean;
  is_new: boolean;
  is_trending: boolean;
}

// -- BOTD settings --
interface BotdSettings {
  burger_of_the_day_type: string | null;
  burger_of_the_day_item_id: string | null;
  burger_of_the_day_has_discount: boolean;
  burger_of_the_day_discount_price: number | null;
}

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // -- BOTD state --
  const [botdItemId, setBotdItemId] = useState<string | null>(null);
  const [botdHasDiscount, setBotdHasDiscount] = useState(false);
  const [botdDiscountPrice, setBotdDiscountPrice] = useState<string>("");

  // -- Tracks which item's price is being edited --
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  // -- Fetch menu items + BOTD settings on mount --
  useEffect(() => {
    const fetchData = async () => {
      // -- Fetch menu items --
      const { data: menuData } = await supabase
        .from("menu_items")
        .select("id, name, category, price, is_sold_out, is_chef_pick, is_new, is_trending")
        .order("category")
        .order("name");

      if (menuData) setItems(menuData);

      // -- Fetch BOTD settings --
      const { data: settings } = await supabase
        .from("restaurant_settings")
        .select("burger_of_the_day_type, burger_of_the_day_item_id, burger_of_the_day_has_discount, burger_of_the_day_discount_price")
        .single();

      if (settings) {
        setBotdItemId(settings.burger_of_the_day_item_id);
        setBotdHasDiscount(settings.burger_of_the_day_has_discount ?? false);
        setBotdDiscountPrice(
          settings.burger_of_the_day_discount_price?.toString() ?? ""
        );
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // -- Toggle a boolean field on a menu item --
  const toggleField = async (
    itemId: string,
    field: keyof MenuItem,
    currentValue: boolean
  ) => {
    // -- If toggling chef_pick ON, turn off the current one first --
    if (field === "is_chef_pick" && !currentValue) {
      const currentPick = items.find((i) => i.is_chef_pick);
      if (currentPick) {
        await supabase
          .from("menu_items")
          .update({ is_chef_pick: false })
          .eq("id", currentPick.id);

        setItems((prev) =>
          prev.map((i) =>
            i.id === currentPick.id ? { ...i, is_chef_pick: false } : i
          )
        );
      }
    }

    // -- Update the item --
    await supabase
      .from("menu_items")
      .update({ [field]: !currentValue })
      .eq("id", itemId);

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, [field]: !currentValue } : i
      )
    );

    toast.success("Updated!");
  };

  // -- Save edited price --
  const savePrice = async (itemId: string) => {
    const newPrice = parseFloat(editingPriceValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Invalid price");
      return;
    }

    await supabase
      .from("menu_items")
      .update({ price: newPrice })
      .eq("id", itemId);

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, price: newPrice } : i
      )
    );

    setEditingPriceId(null);
    toast.success("Price updated!");
  };

  // -- Save BOTD selection --
  const saveBotd = async () => {
    const discountPrice = parseFloat(botdDiscountPrice);

    await supabase
      .from("restaurant_settings")
      .update({
        burger_of_the_day_type: botdItemId ? "menu_item" : null,
        burger_of_the_day_item_id: botdItemId,
        burger_of_the_day_has_discount: botdHasDiscount,
        burger_of_the_day_discount_price:
          botdHasDiscount && !isNaN(discountPrice) ? discountPrice : null,
      })
      .eq("id", (await supabase.from("restaurant_settings").select("id").single()).data?.id);

    toast.success("Burger of the Day updated! 🍔");
  };

  if (loading) return <p>Loading menu...</p>;

  return (
    <div className={styles.menuPage}>
      <h2 className={styles.pageTitle}>Menu Management</h2>

      {/* ----- Burger of the Day Picker ----- */}
      <div className={styles.botdSection}>
        <h3 className={styles.sectionTitle}>Burger of the Day 🌟</h3>

        <div className={styles.botdControls}>
          {/* -- Item selector -- */}
          <select
            className={styles.botdSelect}
            value={botdItemId ?? ""}
            onChange={(e) => setBotdItemId(e.target.value || null)}
          >
            <option value="">None selected</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* -- Discount toggle -- */}
          <label className={styles.discountToggle}>
            <input
              type="checkbox"
              checked={botdHasDiscount}
              onChange={(e) => setBotdHasDiscount(e.target.checked)}
            />
            Discount price
          </label>

          {/* -- Discount price input -- */}
          {botdHasDiscount && (
            <input
              className={styles.discountInput}
              type="number"
              placeholder="Discount price"
              value={botdDiscountPrice}
              onChange={(e) => setBotdDiscountPrice(e.target.value)}
            />
          )}

          {/* -- Save button -- */}
          <button className={styles.botdSaveBtn} onClick={saveBotd}>
            Save BOTD
          </button>
        </div>
      </div>

      {/* ----- Menu Items Table ----- */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sold Out</th>
              <th>Chef&apos;s Pick</th>
              <th>New</th>
              <th>Trending</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={item.is_sold_out ? styles.soldOut : ""}
              >
                {/* -- Name -- */}
                <td className={styles.nameCell}>
                  {item.name}
                  {botdItemId === item.id && (
                    <span className={styles.botdBadge}>⭐ BOTD</span>
                  )}
                </td>

                {/* -- Category -- */}
                <td className={styles.categoryCell}>{item.category}</td>

                {/* -- Price (click to edit) -- */}
                <td className={styles.priceCell}>
                  {editingPriceId === item.id ? (
                    <input
                      className={styles.priceInput}
                      type="number"
                      value={editingPriceValue}
                      onChange={(e) => setEditingPriceValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") savePrice(item.id);
                        if (e.key === "Escape") setEditingPriceId(null);
                      }}
                      onBlur={() => savePrice(item.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={styles.priceValue}
                      onClick={() => {
                        setEditingPriceId(item.id);
                        setEditingPriceValue(item.price.toString());
                      }}
                    >
                      ${Number(item.price).toFixed(2)}
                    </span>
                  )}
                </td>

                {/* -- Toggle columns -- */}
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_sold_out ? styles.on : ""}`}
                    onClick={() => toggleField(item.id, "is_sold_out", item.is_sold_out)}
                  >
                    {item.is_sold_out ? "●" : "○"}
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_chef_pick ? styles.on : ""}`}
                    onClick={() => toggleField(item.id, "is_chef_pick", item.is_chef_pick)}
                  >
                    {item.is_chef_pick ? "●" : "○"}
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_new ? styles.on : ""}`}
                    onClick={() => toggleField(item.id, "is_new", item.is_new)}
                  >
                    {item.is_new ? "●" : "○"}
                  </button>
                </td>
                <td>
                  <button
                    className={`${styles.toggle} ${item.is_trending ? styles.on : ""}`}
                    onClick={() => toggleField(item.id, "is_trending", item.is_trending)}
                  >
                    {item.is_trending ? "●" : "○"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}