"use client";

import { useCartStore } from "@/store/cartStore";

export default function AddToCartButton({ product }) {
    const addToCart = useCartStore((state) => state.addToCart);

    return (
        <button
            onClick={() => {
                addToCart(product);
                alert(`${product.name} Berhasil Ditambahkan ke Keranjang! 🛒`);
            }}
            className="w-full mt-5 bg-gray-900 text-white py-2.5 rounded-xl font-bold hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
        >
            + Keranjang
        </button>
    );
}