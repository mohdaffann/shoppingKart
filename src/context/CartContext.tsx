import React, { createContext, useState } from "react";

export const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {
    const [cart, setCart] = useState([]);

    return (
        <CartContext.Provider
            value={{ cart, setCart }}
        >
            {children}
        </CartContext.Provider>
    )
}
