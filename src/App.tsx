import ProductList from "./ProductList"
import Header from "./Header"
import HomePage from "./HomePage"
import { useState } from "react"
import Cart from "./Cart"
function App() {

  const [page, setpage] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [items, setItems] = useState([]);

  return (
    <>
      <Header setPage={setpage} cartCount={cartCount} />
      {page === 'products' && <ProductList items={items} setItems={setItems} setCartCount={setCartCount} />}
      {page === '' && <HomePage />}
      {page === 'cart' && <Cart items={items} />}
    </>
  )
}

export default App
