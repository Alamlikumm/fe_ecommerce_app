"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";

export default function AddToCartButton({ product, size = "md" }: { product: any; size?: "sm" | "md" | "lg" }) {
    const addToCart = useCartStore((state) => state.addToCart);
    const addToast = useToastStore((state) => state.addToast);
    const [added, setAdded] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (added) return; // prevent double click

        addToCart(product);
        setAdded(true);
        addToast({
            type: "success",
            title: "Ditambahkan ke Keranjang! 🛒",
            message: product.name,
        });

        setTimeout(() => setAdded(false), 2000);
    };

    const sizeClasses = {
        sm: "py-2 px-4 text-xs",
        md: "py-3 px-6 text-sm",
        lg: "py-4 px-8 text-base",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleClick}
            disabled={added}
            className={`w-full btn-primary ${sizeClasses[size]} flex items-center justify-center gap-2 group disabled:opacity-90 disabled:cursor-default`}
        >
            <AnimatePresence mode="wait">
                {added ? (
                    <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Berhasil Ditambahkan!
                    </motion.span>
                ) : (
                    <motion.span
                        key="cart"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        + Keranjang
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}