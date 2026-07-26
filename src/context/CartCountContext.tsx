import { createContext, useState } from "react";


export const CartCountContext = createContext<any>(null);

export function CartCountProvider({ children }: any) {
    const [cartCount, setCartCount] = useState(0);

    return (
        <CartCountContext.Provider
            value={{
                cartCount, setCartCount
            }}
        >
            {children}
        </CartCountContext.Provider>
    )
}