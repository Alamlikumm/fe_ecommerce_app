"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
    const cartItems = useCartStore((state) => state.items);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    return (
        <nav className="bg-white shadow-sm border-b p-4 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
                    Toko<span className="text-orange-500">Kita</span>
                </Link>
                {/* Menu Kanan */}
                <div className="flex items-center gap-6">
                    {isLoggedIn ? (
                        <Link href="/profile" className="text-gray-700 font-bold hover:text-blue-600 flex items-center gap-2">
                            👤 Profil Saya
                        </Link>
                    ) : (
                        <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 transition">
                            Login
                        </Link>
                    )}

                    {/* Ikon Keranjang */}
                    <Link href="/cart" className="relative flex items-center text-gray-700 hover:text-blue-600 transition font-bold gap-2">
                        <span className="text-2xl">🛒</span>
                        <span className="hidden sm:block">Keranjang</span>

                        {/* Lencana Angka (Hanya muncul kalau ada barang) */}
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -left-2 sm:-left-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                </div>
            </div>
        </nav>
    );
}