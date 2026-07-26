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

## v2 — Context API Version
 
### Component Tree & Data Flow
```
main.tsx
└── CartProvider          (owns: cart, setCart)
    └── CartCountProvider (owns: cartCount, setCartCount)
        └── App
            ├── Header       (consumes: CartCountContext)
            ├── ProductList
            │   └── ProductCard  (consumes: CartContext, CartCountContext)
            └── Cart          (consumes: CartContext)
```
 
The prop-drilling chain is gone: `ProductList` no longer forwards
`items`/`setItems`/`setCartCount` to `ProductCard` — it doesn't even know
those props exist anymore. `Header` and `Cart` pull what they need directly
via `useContext`, regardless of how deep they sit in the tree. This is the
concrete payoff of the refactor — go compare `ProductList` here to the v1
version and notice it now only needs `setPage` (or nothing cart-related at
all).
 
### Two providers, not one
The state was split into **two separate contexts**:
- `CartContext` → `{ cart, setCart }`
- `CartCountContext` → `{ cartCount, setCartCount }`
nested in `main.tsx` as `CartProvider > CartCountProvider > App`.
 
### Key snippet — provider shape
```tsx
export const CartContext = createContext<any>(null);
 
export function CartProvider({ children }: any) {
    const [cart, setCart] = useState([]);
    return (
        <CartContext.Provider value={{ cart, setCart }}>
            {children}
        </CartContext.Provider>
    )
}
```
Same pattern repeated for `CartCountContext` / `CartCountProvider`.
 
### Key snippet — consuming context
```tsx
const { cart, setCart } = useContext(CartContext)
const { setCartCount } = useContext(CartCountContext)
```
Any component, at any depth, that's inside both providers can pull exactly
the slice of state it needs — no forwarding required.
 
### Still carried over from v1 (unchanged by this refactor)
Context API solves *where state lives / how it's accessed* — it does not
automatically fix *what* the state is. These v1 issues are still here,
just now living inside providers instead of `App`:
 
1. **`cart` and `cartCount` are still two separate, manually-synced pieces
   of state** — now in two *separate contexts* instead of two props. This
   is arguably a bit riskier than v1: it's easier to update `setCart` in one
   place and forget to touch `setCartCount` in another, because they're no
   longer sitting next to each other in the same component's state. This is
   the same "derive `cartCount` from `cart`" fix as before — just now it'd
   most naturally live as a `useMemo` inside `CartProvider`, and you could
   likely delete `CartCountContext` entirely.
2. **`key={id}` inside `ProductCard`'s own return** is still not the same
   as `key` on the `<ProductCard />` element in `ProductList`'s `.map()`.
3. **`Cart`'s mapped `<div>` still has no `key`.**
### Worth asking yourself as a learning exercise
- Why two providers instead of one `CartContext` holding `{ cart, setCart,
  cartCount, setCartCount }`? (Both are valid designs — the tradeoff is
  re-render scope: components subscribed only to `CartCountContext`, like
  `Header`, won't re-render when `cart` changes if they're separate. That's
  a real reason to split contexts, not just extra boilerplate — but it only
  pays off if `cart` updates frequently without `cartCount` needing to
  reflect it, which isn't really true here since they change together.)
- What breaks if a component calls `useContext(CartContext)` *outside* of
  `CartProvider`? (Currently silently returns `null` since the default is
  `createContext<any>(null)` — worth trying, then worth learning the
  "throw if context is null" guard pattern for a future pass.)