# ShopKart — Prop Drilling Cart (Pre-Context API)

## Purpose
This project fetches products from a JSON API and implements a shopping cart
using **prop drilling + state lifting only** — no Context API, no external
state library. Goal: feel the pain points firsthand before refactoring to
Context API, so the "why" actually sticks.

---

## Component Tree & Data Flow

```
App  (assumed: owns cartCount, items, setItems, setCartCount, page)
├── Header       (needs: cartCount, setPage)
├── ProductList  (needs: setCartCount, items, setItems)
│   └── ProductCard  (needs: id, price, title, setCartCount, items, setItems)
└── Cart         (needs: items)
```

> Note: `App.tsx` wasn't in the snippets you pasted — I'm assuming that's
> where `cartCount`, `items`, `setItems`, `setCartCount`, and `page` actually
> live, since every child expects them as props. Fill that in below once you
> paste it, or let me know and I'll add it.

### The prop-drilling chain in action
- `items` + `setItems` are lifted in `App` → passed to `ProductList` (which
  doesn't use them directly) → passed again to `ProductCard` (which actually
  uses them). **Two hops for one consumer.**
- `cartCount` is only *read* in `Header`, but `setCartCount` has to travel
  `App → ProductList → ProductCard` even though `ProductList` never touches
  it. This is the textbook prop-drilling symptom: **intermediate components
  become pass-through pipes for state they don't care about.**
- `Cart` is the only place `items` is read for rendering, but it's the only
  prop it needs — smallest surface area of the three.

This is exactly the shape of problem Context API solves: components in the
*middle* of the tree (like `ProductList`) shouldn't need to know about state
they don't use, just because their children need it.

---

## Key Snippets

### Add-to-cart logic (lives in `ProductCard`)
```tsx
function addItems() {
    const existing = items.find(p => p.id === id)
    if (existing) {
        setItems(
            items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        )
    } else {
        setItems([...items, { id, price, title, quantity: 1 }])
    }
}
```
Pattern: **immutable update** — never mutate `items` directly, always
`.map()` / spread into a new array so React detects the state change.

### Fetch pattern (lives in `ProductList`)
```tsx
async function fetchProducts() {
    try {
        setLoading(true);
        let res = await fetch('https://dummyjson.com/products?limit=10&skip=10&select=title,price');
        if (!res.ok) throw new Error('network error');
        let list = await res.json();
        setProd(list?.products);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
}
useEffect(() => { fetchProducts(); }, []);
```
Standard fetch-in-`useEffect` pattern: `try/catch/finally`, loading flag set
in `finally` so it resolves whether the request succeeds or fails.

---

## Things To Fix / Watch Before (or while) Adding Context API

These aren't blockers, but worth cleaning up since they'll get more visible
once state moves into a Context provider:

1. **`cartCount` is derived state pretending to be source-of-truth state.**
   You're manually incrementing it (`setCartCount(p => p + 1)`) *separately*
   from updating `items`. These two can drift out of sync (e.g. if you ever
   add "remove from cart," you'd need to remember to decrement `cartCount`
   too). Better: derive it —
   ```tsx
   const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
   ```
   One source of truth (`items`), zero risk of desync. Good candidate for a
   `useMemo` once this moves into Context.

2. **Missing `key` prop where it's actually needed.**
   - In `ProductList`, you map over `prod` but `key={id}` is set *inside*
     `ProductCard`'s returned JSX, not on the `<ProductCard />` element
     itself in the `.map()`. React needs the `key` on the element returned
     by `.map()`, not on a node nested inside it.
   - In `Cart`, the mapped `<div>` per item has no `key` at all.
   ```tsx
   // ProductList.tsx
   prod.map((p) => (
       <ProductCard key={p.id} id={p.id} ... />
   ))

   // Cart.tsx
   items.map((p) => (
       <div key={p.id} className="...">
   ))
   ```

3. **`any` typing everywhere defeats the purpose of TypeScript here.**
   `setPage: any`, `items: any[]`, `setItems: any`. Once you introduce
   Context, this is a good moment to define real shared types, e.g.:
   ```ts
   interface CartItem {
       id: number;
       title: string;
       price: number;
       quantity: number;
   }
   type SetItems = React.Dispatch<React.SetStateAction<CartItem[]>>;
   ```
   These types will become your Context's type definition anyway — no
   wasted work.

4. **`setPage: any` in `Header`** — same story, likely `'' | 'products' | 'cart'`
   as a union type would be more honest and give you autocomplete + safety.

---

## Why This Setup Motivates Context API

Concrete pain points you already hit in this codebase:
- `ProductList` receives `setCartCount` and forwards it, never using it —
  a pure middleman.
- Adding a 4th level of nesting under `ProductCard` (e.g. a `PriceTag`
  subcomponent) would mean drilling `items`/`setItems` one level deeper
  for no functional reason.
- Any new cart-consuming component anywhere in the tree (e.g. a
  `CartSummaryBadge` in a sidebar) means re-threading props through
  whatever sits between it and `App`.

Context API removes the "middleman must forward props it doesn't use"
requirement — components subscribe directly to the state they need,
regardless of tree depth.

---

## Next Steps (Context API Migration Plan)

- [ ] Create `CartContext.tsx` with `createContext` + a `CartProvider`
      wrapping `items`, `setItems`, and derived `cartCount`
- [ ] Wrap `App` (or the relevant subtree) in `<CartProvider>`
- [ ] Replace prop drilling in `Header` with `useContext(CartContext)` for
      `cartCount`
- [ ] Replace prop drilling in `ProductCard` with `useContext(CartContext)`
      for `items`/`setItems` — remove pass-through props from `ProductList`
- [ ] Replace prop drilling in `Cart` with `useContext(CartContext)` for
      `items`
- [ ] Fix the `any` types → shared `CartItem` interface, reused in Context
- [ ] Fix missing/misplaced `key` props while touching these files anyway
- [ ] Consider deriving `cartCount` from `items` instead of tracking it as
      separate state
