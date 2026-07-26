import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CartContext, CartProvider } from './context/CartContext.tsx'
import { CartCountProvider } from './context/CartCountContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <CartCountProvider>
        <App />
      </CartCountProvider>

    </CartProvider>

  </StrictMode>,
)
