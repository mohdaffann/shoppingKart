import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
interface Product {
    id: number,
    title: string,
    price: number
}

function ProductList({ setCartCount, items, setItems }: { setCartCount: any, items: any[], setItems: any }) {
    const [prod, setProd] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);




    async function fetchProducts() {
        try {
            setLoading(true);
            let res = await fetch('https://dummyjson.com/products?limit=10&skip=10&select=title,price');
            if (!res.ok) throw new Error('network error');
            let list = await res.json();
            let data: Product[] = list?.products;
            setProd(data);
            setLoading(false)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }

    }
    useEffect(() => {
        fetchProducts();
    }, [])

    return (
        <div className="flex flex-col items-center gap-2">
            {loading ? <div>Loading...</div> :
                prod.map((p) => (
                    <ProductCard id={p.id} price={p.price} title={p.title}
                        setCartCount={setCartCount} items={items} setItems={setItems}
                    />
                ))
            }
        </div>
    )
}

export default ProductList;
