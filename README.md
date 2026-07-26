# 🍔 Smash'd — Neobrutalist Burger Restaurant

A full-stack burger restaurant web app built as a portfolio project. Features real-time 3D burger building, a live admin dashboard, customer auth, a multi-step checkout flow, and a hidden secret menu with its own discovery storyline.

> **Live demo:** [smashd-beta.vercel.app](https://smashd-beta.vercel.app)
---

## What Makes This Different

This isn't a template or a tutorial follow-along. Every feature, design decision, and interaction was built from scratch.

- **3D burger builder** — pick ingredients and watch your burger stack in real time using React Three Fiber. Every patty, cheese slice, and bun type is a separate mesh inside a single GLB file
- **Full admin dashboard** — manage orders, edit menu items and prices, toggle kitchen status, set promo codes, update challenge records — all persisted to Supabase with live updates
- **Real-time order flow** — place an order as a customer, advance it as admin, and watch the status stepper update live via Supabase Realtime
- **Secret menu** — a multi-step discovery flow: a mysterious popup, a hidden interaction on the hero burger, a ransom-note styled password reveal, a lock icon on the menu page, and a 24-hour access timer
- **Neobrutalist design system** — thick borders, offset shadows, chunky fonts, bold palette. No Tailwind — hand-written SCSS Modules with CSS variables throughout

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | SCSS Modules |
| Database & Auth | Supabase (Postgres, Auth, Realtime, RLS) |
| 3D | React Three Fiber, Three.js, Drei |
| State | Zustand (cart, orders, loading) |
| Animations | GSAP + ScrollTrigger |
| Charts | Recharts |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Features

### Customer-Facing

- **Menu page** — filterable grid of items with 3D models, badges (Chef's Pick, Most Popular, New, Sold Out), and inline add-to-cart
- **Build Your Own Burger** — category-based ingredient selector with live 3D preview, nutrition panel, calorie tracking, surprise randomizer, and shareable URLs
- **Item detail pages** — topping customization, side item selector with 3D model swapping
- **Burger of the Day** — admin-controlled featured item with its own 3D display
- **Secret menu** — daily password, 24-hour access timer, unique burger cards with themed variants (classified dossier, corrupted glitch, retro diner)
- **Burger Challenge** — leaderboard with record holder, patty count, and time to beat — all fetched from Supabase
- **Multi-step checkout** — delivery/pickup toggle, address form, tip selection, promo codes validated against Supabase, card form with brand detection
- **Order confirmation** — receipt UI with order details, status stepper, referral code
- **Customer auth** — signup, login, order history page
- **Kitchen status** — live open/closing soon/closed banner. When closed, checkout shows "orders will be delivered tomorrow"

### Admin Dashboard

- **Orders** — live feed via Supabase Realtime, status advancement (received → preparing → ready → delivered), cancel/delete, customer details with address and phone
- **Menu Management** — toggle sold out/chef's pick/new, inline price editing, burger of the day picker, slide-in add/edit drawer
- **Settings** — kitchen open/close toggle, opening hours, secret menu password, promo code and discount percentage
- **Challenge Management** — update record holder, patty count, time to beat, hall of fame
- **Dashboard** — order count, revenue, orders-per-hour bar chart, busy status indicator, greeting based on time of day
- **Auth** — SSR cookie-based sessions, proxy-based route protection

---

## Architecture Decisions

- **Thin route files** — each `app/[page]/page.tsx` imports a single page component. All logic lives in `components/`
- **Component grouping** — `components/[group]/ComponentName/ComponentName.tsx` with co-located SCSS modules
- **SCSS Modules over Tailwind** — full control over the neobrutalist design system. Nesting mirrors JSX structure with block-separating comments
- **Zustand stores** — `useCartStore` (localStorage), `useOrderStore` (sessionStorage), `useLoadingStore` for global state
- **WebGL context management** — bidirectional IntersectionObserver with 100ms debounce to mount/unmount 3D canvases and prevent context crashes
- **Secret menu utilities** — centralized `isSecretMenuActive()` with custom events and interval checks for timer expiry
- **`.maybeSingle()` over `.single()`** — properly distinguishes "not found" from real Supabase errors
- **Supabase SSR auth** — `createBrowserClient` for client, cookie-based sessions, proxy route protection (Next.js 16 replaced `middleware.ts`)

---

## Screenshots

<!-- Add your own screenshots here -->

| Feature | Screenshot |
|---------|------------|
| Homepage Hero | `./docs/hero.png` |
| Menu Page | `./docs/menu.png` |
| Burger Builder | `./docs/builder.png` |
| Secret Menu | `./docs/secret-menu.png` |
| Admin Dashboard | `./docs/admin.png` |
| Admin Orders | `./docs/admin-orders.png` |
| Checkout | `./docs/checkout.png` |
| Order Confirmation | `./docs/confirmation.png` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Setup

```bash
# Clone the repo
git clone https://github.com/beeeen498/burger.git
cd burger

# Install dependencies
pnpm install

# Add environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# Run development server
pnpm dev
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Database

The project uses Supabase with the following tables:

- `menu_items` — all regular menu items with prices, categories, ingredients, badges
- `secret_menu_items` — secret menu burgers, never appear in regular menu
- `orders` — customer orders with items, totals, status, customer info, scheduled delivery
- `restaurant_settings` — kitchen status, hours, secret menu password, promo code, burger of the day
- `challenge` — burger challenge record holder and stats

Row Level Security is enabled on all tables with policies for admin access and customer data isolation.

---

## Known Limitations

- Payment is demo-only — no real Stripe integration (card form validates format but doesn't charge)
- Delivery map/GPS tracking is not implemented
- Order status Realtime subscription has intermittent issues with Supabase channel lifecycle in React Strict Mode
- 3D models are low-poly and authored in Blender — not production-grade assets

---

## Lessons Learned

- `useGLTF` caches aggressively — rename the GLB file to bust the cache when meshes change
- `overflow-x: hidden` on a parent breaks `position: sticky` on children
- Too many WebGL contexts crash the browser — use IntersectionObserver to unmount offscreen canvases
- Next.js 16 async params — `params` must be awaited; synchronous access returns `undefined`
- Zustand hydration timing — gate redirects on `persist.hasHydrated()` to avoid premature state reads
- React Strict Mode double-invocation can prematurely clear data — snapshot into a `useRef`
- Never compress GLB files in place without a backup — Draco compression can corrupt models irreversibly

---

## Built By

**Ben** — [GitHub](https://github.com/beeeen498)