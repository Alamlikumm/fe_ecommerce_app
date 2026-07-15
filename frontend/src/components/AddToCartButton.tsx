"use client";

import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: { product: any }) {
    const addToCart = useCartStore((state) => state.addToCart);

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                e.preventDefault(); // Prevent link navigation
                addToCart(product);
                alert(`${product.name} Berhasil Ditambahkan ke Keranjang! 🛒`);
            }}
            className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            + Keranjang
        </motion.button>
    );
}