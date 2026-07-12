"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
    const cartItems = useCartStore((state) => state.items);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="bg-white shadow-sm border-b p-4 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
                    Toko<span className="text-orange-500">Kita</span>
                </Link>
                {/* Menu Kanan */}
                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 transition">
                        Login
                    </Link>

                    {/* Ikon Keranjang */}
                    <Link href="/checkout">
                        <span className="text-2xl">🛒</span>

                        {/* Lencana Angka (Hanya muncul kalau ada barang) */}
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                </div>
            </div>
        </nav>
    );
}