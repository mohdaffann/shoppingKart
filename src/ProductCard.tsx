import React, { useContext } from "react";
import { CartCountContext } from "./context/CartCountContext";
import { CartContext } from "./context/CartContext";
function ProductCard({ id, price, title }: { id: number, price: number, title: string }) {
    const { cart, setCart } = useContext(CartContext)
    const { setCartCount } = useContext(CartCountContext)
    function addItems() {
        const existing = cart.find((p: any) => p.id === id)
        if (existing) {
            setCart(
                cart.map((item: any) =>
                    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                )
            )
        } else {
            setCart(
                [
                    ...cart,
                    { id: id, price: price, title: title, quantity: 1 }
                ]
            )

        }
    }
    return (
        <div key={id} className="flex w-[500px] flex-col gap-1">
            <h1 className="font-bold">{title}</h1>
            <span>{price}</span>
            <button
                onClick={() => {
                    setCartCount((p: number) => p + 1)
                    addItems();
                }}
                className="cursor-pointer px-2 py-1 border rounded hover:bg-yellow-400 bg-yellow-300 text-gray-600">+ Add to cart</button>
        </div >
    )
}

export default ProductCard;
