"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const cartItems = useCartStore((state) => state.items);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'}`}
        >
            <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter flex items-center gap-1 group">
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }}>Toko</motion.div>
                    <span className="text-orange-500">Kita</span>
                </Link>

                {/* Menu Kanan */}
                <div className="flex items-center gap-6">
                    {isLoggedIn ? (
                        <Link href="/profile" className="text-gray-700 dark:text-gray-200 font-bold hover:text-blue-600 flex items-center gap-2 group transition-colors">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <User className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
                            </motion.div>
                            <span className="hidden sm:block">Profil Saya</span>
                        </Link>
                    ) : (
                        <Link href="/login" className="text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 flex items-center gap-2 transition-colors">
                            <LogIn className="w-5 h-5" />
                            <span>Login</span>
                        </Link>
                    )}

                    {/* Ikon Keranjang */}
                    <Link href="/cart" className="relative flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors font-bold gap-2 group">
                        <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                            <ShoppingCart className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                        </motion.div>
                        <span className="hidden sm:block">Keranjang</span>

                        {/* Lencana Angka */}
                        <AnimatePresence>
                            {totalItems > 0 && (
                                <motion.span 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    key={totalItems}
                                    className="absolute -top-2 -left-2 sm:-left-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}