"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ShoppingCart, User, LogIn, Search, Menu, X, ChevronDown, Package, Heart, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const cartItems = useCartStore((state) => state.items);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const wishlistIds = useWishlistStore((s) => s.ids);
    const setWishlistIds = useWishlistStore((s) => s.setIds);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.name) setUserName(data.name);
                })
                .catch(() => {});

            // Sync wishlist IDs dari server
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/ids`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            })
                .then((res) => res.json())
                .then((ids) => {
                    if (Array.isArray(ids)) setWishlistIds(ids);
                })
                .catch(() => {});
        }

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close cart preview on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
                setCartPreviewOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`sticky top-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? "glass-strong py-2 shadow-lg"
                        : "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-3 border-b border-gray-100 dark:border-gray-800"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-0.5 flex-shrink-0">
                        <span className="text-indigo-600">Toko</span>
                        <span className="text-orange-500">Kita</span>
                    </Link>

                    {/* Search (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-6">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari produk impianmu..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        // Could redirect to homepage with search param
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            className="hidden md:flex relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Heart className={`w-5 h-5 transition-colors ${wishlistIds.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                            <AnimatePresence>
                                {wishlistIds.length > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg"
                                    >
                                        {wishlistIds.length > 99 ? '99+' : wishlistIds.length}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* Notifications */}
                        <button className="hidden md:flex relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>

                        {/* User */}
                        {isLoggedIn ? (
                            <Link
                                href="/profile"
                                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs font-black">
                                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="text-sm font-bold max-w-[80px] truncate">{userName || "Profil"}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Masuk
                            </Link>
                        )}

                        {/* Cart */}
                        <div className="relative" ref={cartRef}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCartPreviewOpen(!cartPreviewOpen)}
                                className="relative flex items-center gap-2 p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="hidden md:block text-sm font-bold">Keranjang</span>
                                <AnimatePresence>
                                    {totalItems > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            key={totalItems}
                                            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg"
                                        >
                                            {totalItems > 99 ? "99+" : totalItems}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Cart Preview Dropdown */}
                            <AnimatePresence>
                                {cartPreviewOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                                                Keranjang ({totalItems})
                                            </h3>
                                        </div>

                                        {cartItems.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Keranjang masih kosong</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                                    {cartItems.slice(0, 4).map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.image_url}`}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                                                <p className="text-xs text-gray-500">{item.quantity}x Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {cartItems.length > 4 && (
                                                        <div className="p-3 text-center text-xs text-gray-400 font-medium">
                                                            +{cartItems.length - 4} produk lainnya
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xs text-gray-500 font-medium">Total</span>
                                                        <span className="text-sm font-black text-orange-500">
                                                            Rp {new Intl.NumberFormat("id-ID").format(totalPrice)}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href="/cart"
                                                        onClick={() => setCartPreviewOpen(false)}
                                                        className="block w-full text-center btn-primary py-2.5 text-sm rounded-xl"
                                                    >
                                                        Lihat Keranjang
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {/* Mobile Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Cari produk..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                {isLoggedIn ? (
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-bold text-sm">Profil Saya</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-600 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Masuk / Daftar
                                    </Link>
                                )}

                                <Link
                                    href="/wishlist"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                                        <span className="font-bold text-sm">Wishlist</span>
                                    </span>
                                    {wishlistIds.length > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {wishlistIds.length}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <ShoppingCart className="w-5 h-5" />
                                        <span className="font-bold text-sm">Keranjang</span>
                                    </span>
                                    {totalItems > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
}