# Smash'd — Full Project Brief

## Tech Stack
- Next.js (App Router, TypeScript)
- SCSS Modules (no Tailwind)
- Supabase (Postgres DB + Realtime subscriptions + Storage)
- Stripe test mode for payments
- React Three Fiber + Drei for 3D
- Framer Motion for animations
- GSAP ScrollTrigger for scroll animations
- Zod + React Hook Form for validation
- Upstash Redis for rate limiting
- Vercel for deployment
- Zustand or Jotai for global state management
- React Query or SWR for data fetching and caching

---

# PART 1 — PAGES & FEATURES

## Loading Screen
- 2D SVG flat burger that assembles itself ingredient by ingredient, bottom bun first, top bun last
- Each ingredient drops in with a bounce/squish on landing
- A thud sound plays each time an ingredient lands (respects mute toggle)
- Text below reads "Heating up the grill" followed by three flickering SVG flame icons in place of animated dots, alternating between `#f7e558` and `#df2c8b`
- Flames pulse out of sync with each other, slightly scaling and flickering in opacity to feel alive
- A random burger joke or fun fact appears below the flame icons during the wait — rotates from a list of 10-15 options
- Minimum display time of 1.5 seconds even on fast connections
- Exit animation — screen wipes upward with cinematic ease curve `[0.76, 0, 0.24, 1]`
- 2D burger stays in place as the panel slides away, revealing the 3D hero burger underneath in roughly the same position — creating a visual continuity illusion between the 2D loading burger and the 3D hero burger

---

## Navbar
- Shrinks slightly + gains backdrop blur on scroll down
- Logo is a mini low poly burger icon + brand name — logo has a subtle idle bounce animation
- Mobile hamburger menu icon replaced with an actual burger icon
- Pink (`#df2c8b`) CTA button for "Order Now"
- Cart replaced with a bag icon — more appropriate for a food ordering context
- Mute/unmute toggle — tooltip says "Shhh" when muted, "Let's get loud" when unmuted
- Nav item hover effect — slight tilt to the side, subtle scale up, background highlight stretches from center outward to both sides. Framer Motion or pure CSS with `transform-origin: center`
- A slim full-width weather banner just below the navbar — uses a free weather API to show contextual messages like "It's cold outside ☁️ — perfect burger weather" or "Hot day? Cool down with our milkshakes 🥤". Slides down smoothly on load, updates in real time if weather changes while user is on the site. Styled in neobrutalist aesthetic with palette colors. Behind feature flag `enableWeatherBanner`
- Navbar CTA button pulses gently when user has been idle for 30 seconds — subtle attention grabbing animation
- On mobile, a bottom fixed nav bar with Home, Menu, Cart, Order icons styled in palette colors with large tap targets

---

## Hero
**3D Burger**
- Low poly stylized burger built in Blender with each ingredient as a separate mesh — bun, patty, cheese, lettuce, tomato, sauce
- Flat shading / toon shading — geometric faceted look
- Burger colors: bun `#E8A020`, patty `#4A2810`, cheese `#F5C518`, lettuce `#4A7C3F`, tomato `#C0392B`
- Floating animation using Drei's `<Float>` component
- Slow Y-axis rotation in `useFrame` loop
- On scroll — burger animates to middle-left of screen and explodes into separated ingredients
- Each ingredient label appears in a chunky beveled neobrutalist panel, styled like a game UI tooltip, in heading font
- Loaded via dynamic import so it doesn't block initial page load
- Error boundary wrapping the 3D scene — if WebGL fails shows a fun illustrated 2D fallback

**CRT / Retro TV Effect**
- The hero container is styled to look like a retro CRT television — chunky rounded corners, a bezel, fake speaker grills on the sides rendered in CSS, decorative SVG antenna on top
- Fisheye / barrel distortion effect on the hero using an SVG `feDisplacementMap` filter — subtle, makes it feel like a curved glass screen
- Scanline overlay — repeating `linear-gradient` with thin semi-transparent horizontal lines
- Subtle screen flicker — `opacity` cycling between 1 and 0.98 on a fast loop
- Occasional glitch burst on the hero headline — text shifts a few pixels using `transform: translateX()`, `::before` and `::after` pseudo elements appear in red and blue offsets mimicking RGB color separation, triggers randomly every 4-8 seconds via `setInterval` adding and removing a CSS class
- CRT effects contained to the hero only — disappear once user scrolls past

**Layout & Copy**
- Hero headline is big, chunky, all caps with a slight text stroke
- Hero sub-headline cycles through different phrases — "Burgers so good they're illegal", "No lettuce left behind", "Engineered for maximum deliciousness" — fades in and out every few seconds
- A rotating marquee text strip — "NOW SERVING • FRESH BURGERS • ORDER NOW • BEST IN TOWN •" scrolling horizontally
- Floating background elements — retro 90s style vector art drifting slowly around the hero background — small stars, lightning bolts, tiny burger icons, flames, sparkles — all in palette colors. Moves independently of the burger
- Parallax effect on hero text — headline moves slightly slower than background on scroll, adding depth
- A chunky animated "scroll down" indicator at the bottom of the hero, fades out once user starts scrolling
- A countdown timer — "Today's special ends in 02:14:33" — fake but adds urgency, styled as chunky digital clock digits
- A morphing blob shape behind the hero burger — soft organic shape in one of your palette colors that slowly shifts and morphs, adds depth without competing with the burger

---

## Home Page Sections
**Why Us**
- Three or four chunky cards with bold icons and short punchy copy — "Fresh daily", "No frozen patties", "Secret sauce since 1987"
- Each card has thick border, offset shadow, slight hover tilt

**By The Numbers**
- Animated counters for fake stats — "2,847 burgers served this week", "4.9 star average rating", "3 secret ingredients"
- Numbers count up from zero when scrolled into view
- Styled as chunky neobrutalist stat cards in palette colors

**Burger Of The Day**
- A featured burger that changes daily with a countdown showing how long until the next one
- Stored in Supabase, manageable from admin
- Shows dynamic content thinking beyond just the menu

**Opening Hours Widget**
- Styled as a chunky retro diner sign
- Shows today's hours highlighted
- Connected to `restaurant_settings` table in Supabase
- Updates in real time if admin changes hours

**Testimonials**
- Fake customer reviews styled as retro speech bubbles with customer avatar, name, and star rating
- Cards have a slight random tilt like handwritten notes pinned to a corkboard
- Auto scrolling carousel that pauses on hover

**Fresh Ingredients Strip**
- Horizontal scrolling strip of ingredient cards
- Each card has a big illustrated icon, ingredient name, and a short fun fact
- Scrolls automatically and pauses on hover, like a conveyor belt

---

## Menu
**Kitchen Status Banner**
- A `restaurant_settings` table in Supabase — stores `opening_time`, `closing_time`, `is_manually_closed`
- Three states — Open, Closed (scheduled), Closed (manual override)
- When closed — a banner appears at the top of the menu page — "We're currently closed 🌙 — but you can preorder for when we open at 11am"
- Banner disappears automatically when opening time is reached via Supabase realtime
- When open — banner is hidden, normal ordering proceeds

**Filters**
- Category filter buttons — Burgers, Sides, Drinks
- Sticky category filter buttons — stick below navbar as you scroll
- URL state for menu filters — `/menu?category=burgers` — shareable and bookmarkable
- Dietary filter badges — Vegetarian, Vegan, Gluten Free — items that match get a small colored icon badge
- Spicy items get a chili icon badge
- Smooth layout animation when filtering using Framer Motion `layout` prop
- A calories slider toggle — switches between "I'm being healthy" and "I don't care" mode, re-sorts cards by caloric value in healthy mode

**Menu Cards**
- Calorie badge on each card — small, always visible, toggleable via calories slider
- "Chef's Pick" retro sticker badge on one featured item — wiggles on a loop
- "Most Popular" badge on another item — different color and style, also wiggles
- "New" badge on recently added items — styled as a retro sticker, wiggles
- "Low Stock" warning on certain items — "Only 3 left today!" adds urgency
- "Limited Time Only" countdown timer on one item — when it hits zero the item gets the sold out treatment with a dramatic animation
- A "Sold Out" state on one item — greyed out with a stamp-style "SOLD OUT" overlay. Randomly becomes available again after 60 seconds for demo purposes with a celebration animation
- Hovering the "Sold Out" item shows a tooltip — "You snooze you lose 😤 check back tomorrow"
- Card hover flips to show ingredients list on the back — CSS 3D flip
- 3D perspective tilt on card hover following mouse position
- Menu card images zoom slightly on hover — image scales to 105% while card stays the same size
- Image loading blur placeholder — images start blurred and sharpen as full image loads
- "Add to Cart" button label changes to "Feed Me 🍔" on hover
- Subtle steam animation on burger images — CSS wiggly lines rising up
- A menu item popularity bar — thin colored bar under each card showing relative popularity
- Skeleton loaders in yellow shimmer instead of typical grey while menu loads

**Menu Page Features**
- A "Surprise Me" roulette wheel — shake to spin on mobile, button click on desktop. Drumroll sound when spinning, fanfare when it lands. Behind feature flag `enableShakeToRandomize`
- A "Trending This Week" section at the top — three items in a special strip above the regular menu grid, different background color, slightly larger cards. Rotates weekly, managed from admin
- A "recently viewed" strip at the bottom — last 3-4 items persisted to localStorage
- A "meal deal" upsell — when a burger is added to cart a subtle popup suggests adding a side and drink as a bundle
- A menu item detail page at `/menu/[slug]` — full page with larger image, full ingredient list, nutrition info, reviews, and add to cart

**Burger Challenge**
- A dedicated section on the menu page or its own `/challenge` route
- Dark dramatic background — red and yellow accents, big chunky WARNING style typography
- Details the challenge — finish a giant burger, fries and shake in under one hour to get the meal free and get on the hall of fame
- A separate 3D model — comically tall burger with 6+ patties alongside giant fries and a shake, built in Blender, loaded with React Three Fiber, with its own slow rotation and floating animation
- Challenge details — record holder name, weight of the meal, number of patties, time to beat, number of attempts — all stored in a `challenge` table in Supabase
- Updates instantly via Supabase realtime when admin changes data
- A hall of fame — previous record holders in retro arcade leaderboard style, chunky pixel font, numbered rankings

---

## Build Your Own Burger
- User picks each ingredient from a categorized list
- 3D burger model updates in real time to reflect current ingredient selection — loaded via dynamic import
- Adding/removing an ingredient triggers a pop sound effect
- A spice/heat level selector — "Mild", "Medium", "Hot", "Insane" — changes the sauce and adds chili icons. The 3D model gets a subtle red tint as heat level increases
- A live price counter that updates as you add/remove ingredients — total animates up and down slot machine style with each change
- A full nutrition facts panel that updates in real time — protein, carbs, fat, calories all change with each ingredient. Styled exactly like a real nutrition label
- A burger compatibility score — fun fake percentage rating how well your ingredient choices go together. Goes up with classic combos, drops with weird ones — with a funny reaction
- A "calories remaining" bar — starts full and depletes as you add ingredients, goes red when you add too much
- An ingredient compatibility warning — funny warning toast for weird combinations — "Pineapple on a burger? Bold choice 🍍"
- A running commentary as you add ingredients — "Now we're talking 💪", "A true architect 🏗️"
- An undo/redo system — small arrow buttons stepping back and forward through ingredient choices
- A "most popular build" button — loads the most commonly ordered custom burger with ingredients snapping into place one by one
- A burger review step before adding to cart — full summary with the 3D model doing a slow 360 rotation
- A "share your creation" button — generates a fake shareable URL encoding ingredients in the query string
- A burger name generator — funny procedurally generated name like "The Mighty Cheddar Destroyer". Displayed on the receipt
- A "build history" panel — last 3 burgers built, persisted to localStorage. Each has a name, mini ingredient list, and "rebuild this" button
- Ingredient list is a horizontal scrollable strip on mobile
- Drag and drop ingredient list using `@dnd-kit` — **maybe, revisit after core features are done**
- Behind feature flag `enable3DBurgerBuilder`

---

## Cart
- Cart icon replaced with a bag icon throughout
- When item is added, a mini version flies in an arc animation from the card to the bag icon in the navbar
- Bag icon wobbles/bounces on each addition or removal
- Cart persists to `localStorage` — survives page refresh
- Mobile — slide-in drawer
- Desktop — sidebar
- Toast notifications for cart actions (Sonner library)
- Swipe to dismiss on toast notifications on mobile
- Debounced quantity updates
- Optimistic UI on cart updates
- Empty cart state — sad little burger illustration and "Your cart is lonely 🍔"
- Quantity stepper has personality — clicking minus down to zero shows a sad face emoji briefly before item is removed
- A minimum order amount indicator — "Add $5 more to qualify for free delivery" with a progress bar
- A "you might also like" section at the bottom — suggests complementary items
- A cart item limit warning — adding more than 10 of the same item triggers a funny toast
- A clear cart button with confirmation — "Are you sure? Your burgers will be very sad 🥺"
- An upsell prompt — "Add fries for $2?" styled as a cheeky popup
- Haptic feedback when adding an item on mobile — Vibration API. Behind feature flag
- A "new customer" welcome toast on first visit — "Welcome to Burger Joint 👋 First time here? Try the Double Smash" — detected via localStorage

---

## Checkout
**Flow**
- Smooth multi-step flow — cart summary → delivery options → guest info → payment → confirmation
- Progress bar at the top — gradient blending between `#f7e558` → `#6bbbe8` → `#df2c8b` as you advance. Chunky, thick, neobrutalist border
- An order summary accordion on mobile — collapses by default, expands to show full order details
- A full order total breakdown — subtotal, delivery fee, tip, discount applied, final total. Each line item animates in separately
- A "save my details" checkbox — saves name, email, and address to localStorage for returning users
- A promo code field — enter `BURGERLORD50` (unlocked via Konami code) and it applies a real 50% discount validated against Supabase `coupons` table via `/api/validate-coupon`
- A gift wrapping option — silly toggle that adds "premium burger gift wrapping 🎁" for $0.00
- A "fastest checkout ever" timer — shows how many seconds the checkout took, displayed on the receipt
- Abandoned cart recovery — "Your burger is getting cold 🥶 — finish your order" banner if user navigates away

**Delivery Options**
- Delivery vs pickup toggle at the start of checkout
- Address autocomplete on delivery form — using Nominatim API
- A "Deliver now" vs "Schedule for later" toggle — available during both open and closed kitchen states
- When scheduling — chunky selectable time slot buttons in 15-30 minute intervals. Slots outside opening hours automatically hidden
- When kitchen is closed — "Deliver now" is greyed out, "Schedule for later" auto selected, time slots start from next opening time
- Estimated delivery time shown before payment — calculated from current active order volume in Supabase. Fewer than 5 orders: "20-25 minutes", 5-10 orders: "30-40 minutes", 10+ orders: "45-60 minutes — kitchen is busy 🔥"
- If kitchen is force closed after a scheduled order is placed — a notification informs the user their scheduled order is still confirmed
- Scheduled orders saved with `scheduled_for` timestamp and `is_preorder` flag

**Payment**
- Guest checkout — name and email only, no real auth
- Stripe test mode — card form, Google Pay, Apple Pay, PayPal buttons
- Real time card type detector — card brand icon animates in as user types
- Zod + React Hook Form validation
- Custom styled input fields — colored border on focus, no default browser outline
- Custom styled checkboxes and radio inputs
- Branded form validation error messages — "Hey! We need your name to make your burger 🍔" — in heading font, in pink
- Live "kitchen status" banner — "🔥 Kitchen is busy — 15 min wait" or "✅ Kitchen is open — taking orders now"
- An order notes field — "Any special requests?" with a character counter
- Tip selection step — 10%, 15%, 20%, custom amount. Styled as chunky toggle buttons

---

## Order Confirmation
- Confetti explosion on confirm (`canvas-confetti` library)
- A digital scratch card — reveals discount code, free item, or "better luck next time". Uses canvas for scratch effect
- Receipt UI — monospace font, dashed borders, torn paper SVG wave edge at bottom
- A "signature burger" name on the receipt if a custom burger was ordered — "The John Special"
- A "fastest checkout ever" time on the receipt
- Scheduled delivery time shown on receipt instead of estimated time for preorders
- Fake estimated time countdown for immediate orders
- A "reorder" button — one click adds same items back to cart
- A "refer a friend" section — fake referral link to copy and share. "Give a friend 10% off, get 10% off your next order"
- A "share your order" moment — generates a fake social media card showing what was ordered, styled like an Instagram story. User can screenshot and share
- A loyalty card stamp — new stamp added with a rubber stamp press animation and stamp sound effect
- Confetti burst also triggers when hitting a loyalty milestone

---

## Order Tracking
- Supabase realtime subscriptions listening to order row changes
- Customer tracking page at `/order/[id]`
- Status stepper UI — Received → Preparing → Ready for Pickup → Delivered
- Animated checkmarks that draw themselves in when a step completes
- Animated transitions between steps
- A map view — fake animated delivery route on a styled map with a custom burger icon marker. Uses Mapbox or Leaflet
- An estimated time countdown that changes color from blue to yellow to pink as it approaches zero, triggers confetti when it hits zero
- Push notification prompt — asks user if they want a browser notification when order is ready. Uses Web Notifications API. Fires even if tab is in the background
- An "add to order" window — for 5 minutes after placing the order the user can add items without a new order. Countdown shows how long the window is open
- A "rate your experience" prompt once order is marked delivered — five chunky star buttons and a text area
- A "reorder" button — one click adds same items back to cart
- A "share your order status" button — generates a fake shareable link to the tracking page

---

## Admin Dashboard
- Protected route at `/admin`
- A live order counter — big chunky number showing total orders today, animates up with each new order
- A revenue tracker — fake total revenue for the day, updates in real time via Supabase realtime
- A simple analytics chart — orders per hour as a bar chart using Recharts
- A "rush hour" indicator — if more than 5 orders in 10 minutes a flashing "RUSH HOUR 🔥" banner appears
- A sound alert when a new order comes in — distinct kitchen bell ding
- Incoming orders list with buttons to advance order status
- A separate "Upcoming Orders" section for scheduled/preorders — sorted by scheduled time
- An order history table — sortable by date, status, price
- A menu management section — toggle items as sold out, change Chef's Pick badge, update prices. All persisted to Supabase
- A challenge management panel — update record holder name, number of patties, weight, time to beat. Updates reflect instantly via Supabase realtime
- Kitchen status controls — force open or force close the kitchen instantly, overrides the schedule. Toggle also controls the preorder flow
- Opening hours management — update opening and closing times, reflected instantly on the menu page banner and checkout time slots
- Burger of the day management — change the featured burger from admin
- A fun greeting based on time of day — "Good morning Chef 👨‍🍳 you have 3 new orders"
- A motivational message that changes throughout the day — "Morning rush incoming ☕", "Lunch peak 🔥 stay focused"
- Admin dashboard shows different emoji based on pending order count — "😴 Quiet day Chef", "🔥 It's getting spicy in here"
- Demo moment — two browser windows side by side showing live order status update

---

## Loyalty System
- A digital stamp card on the confirmation page — "Buy 9 burgers get 1 free", each order stamps one slot
- Stamp added with a rubber stamp press animation and stamp sound effect
- Stamps persisted using hybrid approach — guest checkout email used as lightweight identifier, stamp count stored in Supabase `loyalty` table
- No full auth needed, works across devices
- A "Burger Points" counter in the navbar with a satisfying fill/progress bar animation
- A level system — "Burger Apprentice" → "Grill Master" → "Burger Legend" based on points. Shown as a chunky retro badge
- Confetti burst when hitting a loyalty milestone
- Behind feature flag `enableLoyaltySystem`

---

## 404 Page
- A burger that falls apart / drops its ingredients when you land on it
- Text says "Looks like this page got eaten"
- A countdown — "Redirecting you to safety in 10... 9... 8..." that auto redirects to home
- A button to go back home immediately
- Custom favicon on the 404 page — broken burger or question mark
- Matches full site aesthetic

---

## Footer
- Big chunky brand name in the background, very faded, like a watermark
- Social media icons styled as neobrutalist square buttons with offset shadows
- A fake address, phone number, opening hours — connected to `restaurant_settings` table
- A "Back to top" button with a burger or rocket icon
- SVG wave or zigzag edge at the top separating footer from last section
- Background in contrasting palette color — `#1a1a1a` or `#df2c8b`
- "Made with love and too much cheese" credit line
- A "As seen on TV ⭐" retro starburst badge
- A fun fact ticker — slowly rotating strip of burger fun facts
- A "report a problem" button — opens a modal with a text area. Shows you think about feedback loops
- Cookie consent banner — styled in neobrutalist aesthetic with chunky button and thick border

---

# PART 2 — GLOBAL / CROSS-CUTTING

## Aesthetic & Design System
- Neobrutalist / retro early 2000s / saturated cartoon
- Color palette: `#f7e558` (yellow), `#6bbbe8` (blue), `#df2c8b` (pink), `#efefef` (off-white), `#1a1a1a` (near-black)
- Thick black borders, offset box shadows (`4px 4px 0px #1a1a1a`)
- Chunky rounded font for headings (Fredoka One / Boogaloo / Righteous), clean sans-serif for body (DM Sans / Inter)
- Fluid typography throughout using CSS `clamp()` — headings scale smoothly between mobile and desktop
- Each section has a different background texture — dot grid, diagonal stripes, noise texture, halftone pattern
- Subtle grain/noise texture overlay on entire site
- SVG wave or zigzag dividers between sections in different palette colors
- Buttons have a press-down effect — offset box shadow shrinks on click, springs back on release
- All focused elements have `3px solid #df2c8b` outline instead of default browser focus ring
- Consistent icon library — Lucide, Phosphor, or Radix Icons. Pick one and stick to it
- Custom text selection color — `#df2c8b` background instead of default blue
- Hover underline animation on text links — grows left to right on hover, shrinks right to left on mouse out
- Branded error messages — personality-filled copy in heading font in pink
- Browser tab title changes per page — "🍔 Menu — Burger Joint", "🛒 Your Cart — Burger Joint", "✅ Order Confirmed — Burger Joint"
- Browser tab title shows item name on detail page — "🍔 Double Smash Burger — Burger Joint"
- Browser tab changes to "Come back! 🍔 Your burger misses you" when tab is inactive
- Custom favicon — the low poly burger icon
- Open Graph meta tags for social sharing

---

## Sound Design
- Thud sounds on loading screen as each ingredient lands
- TV power-on sound when loading screen wipes away and hero is revealed
- Sizzle sound on "Order Now" button hover
- Cha-ching on order confirmation
- Pop sound when adding/removing ingredients in burger builder
- Drumroll when roulette wheel spins, fanfare when it lands
- Whoosh sound when filtering menu items
- Keyboard typing sound in burger builder — subtle, retro computer feel
- Stamp sound when loyalty card stamp is added
- Coin sound when burger points are awarded
- Kitchen bell ding in admin when new order comes in
- Static/white noise on page transitions
- Mute/unmute toggle in navbar — no autoplay ever
- Behind feature flag `enableSoundDesign`

---

## Custom Cursor
- Hides default browser cursor (`cursor: none` on body)
- Custom div following mouse with lerp smoothing via `requestAnimationFrame`
- Burger or flame SVG icon styled to match the palette
- Scales up on hoverable elements (`data-hoverable` attribute)
- Scales down on `mousedown`, bounces back on `mouseup`
- Fades out when mouse leaves the window
- Only active on pointer/mouse devices — disabled on touch screens via `matchMedia('(pointer: fine)')`

---

## Page Transitions
- A burger curtain wipe between routes — wave of small burger icons slides right to left in a staggered sweep at different sizes, rotations, and speeds
- A whoosh sound on page transitions
- Each page has a unique entry animation — menu cards fly in from bottom, checkout slides in from right, confirmation bursts in with confetti

---

## Easter Eggs
- Konami code (↑↑↓↓←→←→BA) generates coupon code `BURGERLORD50` — validated against Supabase `coupons` table
- Clicking the logo 5 times rapidly triggers a hidden animation
- Secret menu item appears after 60 seconds on the order page
- Shake to randomize on mobile triggers the roulette wheel — DeviceMotion API. Behind feature flag `enableShakeToRandomize`
- Behind feature flag `enableEasterEggs`

---

## Technical & Performance
- SCSS Modules throughout — no Tailwind
- Fluid typography with CSS `clamp()` on all headings and text
- `prefers-reduced-motion` check — disables heavy animations for accessibility
- Lighthouse score 90+ — mention in README
- Lazy loading on all images, `font-display: swap` on custom fonts
- All menu photos served as WebP with JPEG fallback
- Image loading blur placeholder — images start blurred and sharpen as full image loads
- Dynamic imports on heavy components — 3D burger scene, roulette wheel, map
- Rate limiting on API routes with Upstash Redis
- Skeleton loaders throughout
- Optimistic UI on cart updates
- API response caching with React Query or SWR
- Stale while revalidate pattern on menu data
- Global loading state managed with Zustand or Jotai
- Error boundary on every major section — fun illustrated fallback instead of white screen
- Intersection observer on every section — fade and slide in on scroll, once only
- Service worker for offline support — "No wifi, no burgers 😢". Behind feature flag `enableOfflinePage`
- URL state for menu filters — `/menu?category=burgers`
- Row level security on Supabase tables
- Proper database schema with foreign keys
- Database seed script — one command populates entire database
- Soft deletes on orders — `deleted_at` timestamp column
- Input sanitization on all form fields — mentioned in README
- Environment variables properly handled — all API keys in `.env.local`
- CSRF protection on API routes — mentioned in README
- `robots.txt` and `sitemap.xml`
- README with GIF/screen recording, architecture diagram, design decisions, known limitations, lessons learned, Lighthouse screenshot, live demo link, and single command local setup

---

## Feature Flags
- `enableWeatherBanner` — toggles weather API banner
- `enableSoundDesign` — disables all sound effects
- `enableLoyaltySystem` — toggles burger points and stamp card
- `enableEasterEggs` — hides all easter eggs
- `enableRealtimeTracking` — toggles Supabase realtime
- `enableShakeToRandomize` — toggles DeviceMotion API
- `enableOfflinePage` — toggles service worker
- `enable3DBurgerBuilder` — toggles real time 3D updates, falls back to 2D ingredient list if WebGL unsupported

---

## Accessibility
- `prefers-reduced-motion` check — disables heavy animations
- Skip to content button — appears only on keyboard focus
- Focus trap in cart drawer and mobile menu
- Aria-live region for cart updates — screen readers announce additions
- ARIA labels on all interactive elements
- Fully keyboard navigable menu — Tab through items, Enter to add to cart
- Color contrast checked across all palette combinations — mentioned in README
