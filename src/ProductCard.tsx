import React from "react";

function ProductCard({ id, price, title, setCartCount, items, setItems }: { id: number, price: number, title: string, setCartCount: any, items: any[], setItems: any }) {
    function addItems() {
        const existing = items.find(p => p.id === id)
        if (existing) {
            setItems(
                items.map(item =>
                    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                )
            )
        } else {
            setItems(
                [
                    ...items,
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
