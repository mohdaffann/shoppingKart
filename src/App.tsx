import ProductList from "./ProductList"
import Header from "./Header"
import HomePage from "./HomePage"
import { useState } from "react"
import Cart from "./Cart"
function App() {

  const [page, setpage] = useState('');
  const [items, setItems] = useState([]);

  return (
    <>
      <Header setPage={setpage} />
      {page === 'products' && <ProductList />}
      {page === '' && <HomePage />}
      {page === 'cart' && <Cart />}
    </>
  )
}

export default App
