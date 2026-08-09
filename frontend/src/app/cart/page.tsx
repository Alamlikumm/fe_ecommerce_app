/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Tag, Package, X, CheckCircle, Loader2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity } = useCartStore();
    const addToast = useToastStore((s) => s.addToast);
    const router = useRouter();

    // Shipping config dari API
    const [shippingConfig, setShippingConfig] = useState({ free_shipping_threshold: 500000, default_shipping_cost: 15000 });

    // Coupon state
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string; value: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const freeShippingThreshold = shippingConfig.free_shipping_threshold;
    const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
    const remaining = freeShippingThreshold - totalPrice;
    const shippingCost = remaining > 0 ? shippingConfig.default_shipping_cost : 0;
    const discount = appliedCoupon?.discount || 0;
    const grandTotal = Math.max(0, totalPrice + shippingCost - discount);

    // Fetch shipping config
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipping-config`)
            .then((res) => res.json())
            .then((data) => setShippingConfig(data))
            .catch(() => {});
    }, []);

    // Apply coupon
    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        setCouponError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponInput.trim(), subtotal: totalPrice }),
            });

            const data = await res.json();

            if (res.ok) {
                setAppliedCoupon(data.coupon);
                addToast({ type: "success", title: "Promo Diterapkan! 🎉", message: data.message });
                setCouponError("");
            } else {
                setCouponError(data.message);
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError("Tidak bisa menghubungi server.");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput("");
        setCouponError("");
        addToast({ type: "info", title: "Promo Dihapus", message: "Kode promo telah dihapus." });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Keranjang Belanja</h1>
                    <p className="text-sm text-gray-500 mt-1">{totalItems} barang di keranjangmu</p>
                </div>
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Lanjut Belanja
                </Link>
            </div>

            {items.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
                >
                    <ShoppingBag className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Keranjangmu masih kosong</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Ayo temukan produk impianmu dan tambahkan ke keranjang!
                    </p>
                    <Link href="/" className="inline-flex btn-primary py-3 px-8 text-sm">
                        Mulai Belanja
                    </Link>
                </motion.div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="lg:w-2/3 space-y-4">
                        <AnimatePresence>
                            {items.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, height: 0 }}
                                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-5 flex items-center gap-4 md:gap-6"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e: any) => (e.target.style.display = "none")}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">{item.name}</h3>
                                        <p className="text-sm font-black gradient-text-warm mt-1">
                                            Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Subtotal: Rp {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                                        </p>
                                    </div>

                                    {/* Quantity & Delete */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-xl transition-colors"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-bold transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Hapus
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24 space-y-6">
                            {/* Free Shipping Progress */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        {remaining > 0
                                            ? `Belanja Rp ${new Intl.NumberFormat("id-ID").format(remaining)} lagi untuk Gratis Ongkir!`
                                            : "🎉 Kamu dapat Gratis Ongkir!"}
                                    </span>
                                </div>
                                <div className="h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${shippingProgress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full bg-emerald-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block uppercase tracking-wider">Kode Promo</label>
                                
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            <div>
                                                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</span>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                                    Hemat Rp {new Intl.NumberFormat("id-ID").format(appliedCoupon.discount)}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded-lg transition-colors">
                                            <X className="w-4 h-4 text-emerald-600" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Masukkan kode"
                                                    value={couponInput}
                                                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponInput.trim()}
                                                className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pakai"}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal ({totalItems} pcs)</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                        Rp {new Intl.NumberFormat("id-ID").format(totalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ongkos Kirim</span>
                                    <span className="font-bold text-emerald-600">
                                        {shippingCost === 0 ? "GRATIS" : `Rp ${new Intl.NumberFormat("id-ID").format(shippingCost)}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Diskon Promo</span>
                                        <span className="font-bold text-red-500">
                                            - Rp {new Intl.NumberFormat("id-ID").format(discount)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900 dark:text-white">Total Pembayaran</span>
                                    <span className="text-2xl font-black gradient-text-warm">
                                        Rp {new Intl.NumberFormat("id-ID").format(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => router.push("/checkout")}
                                className="w-full btn-primary py-4 text-base font-black"
                            >
                                Lanjut ke Pembayaran
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
