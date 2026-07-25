import React from "react";

function Cart({ items }: { items: any[] }) {
    return (

        <div className="flex items-center flex-col gap-2 justify-center ">
            <h1 className="text-center text-xl font-bold">Checkout</h1>
            {items.map(p => (
                <div className="flex w-[500px] flex-col gap-1 border ">
                    <h1 className="font-bold">{p.title}</h1>
                    <span>{p.price}</span>
                    <div className="flex gap-1">
                        <span>Quantity :</span>
                        <span>{p.quantity}</span>
                    </div>
                    <div className="flex gap-1">
                        <p>Total price</p>
                        <span>{p.quantity * p.price}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Cart;

