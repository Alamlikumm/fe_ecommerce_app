"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { CreditCard, ShoppingBag, ShieldCheck, Check, Package, MapPin, Truck, Lock, Tag, CheckCircle, Loader2, X, ChevronDown } from "lucide-react";

const steps = [
    { num: 1, label: "Ringkasan", icon: ShoppingBag },
    { num: 2, label: "Pengiriman", icon: Truck },
    { num: 3, label: "Pembayaran", icon: CreditCard },
];

interface Address {
    id: number;
    label: string;
    recipient_name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    is_primary: boolean;
}

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const addToast = useToastStore((s) => s.addToast);
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);

    const [shippingConfig, setShippingConfig] = useState({ free_shipping_threshold: 500000, default_shipping_cost: 15000 });

    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string; value: number } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [snapReady, setSnapReady] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const apiHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= shippingConfig.free_shipping_threshold ? 0 : shippingConfig.default_shipping_cost;
    const discount = appliedCoupon?.discount || 0;
    const totalPrice = Math.max(0, subtotal + shippingCost - discount);

    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ZT62-Lz_-u-wE7_3";
        const script = document.createElement("script");
        script.src = snapScript;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        script.onload = () => setSnapReady(true);
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipping-config`)
            .then((res) => res.json())
            .then((data) => setShippingConfig(data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, { headers: apiHeaders })
            .then((res) => res.json())
            .then((data: Address[]) => {
                setAddresses(data);
                const primary = data.find((a) => a.is_primary);
                if (primary) {
                    setSelectedAddressId(primary.id);
                    setShippingAddress(formatAddress(primary));
                }
            })
            .catch(() => {});
    }, [token]);

    const formatAddress = (addr: Address) =>
        `${addr.recipient_name} - ${addr.phone}\n${addr.address}\n${addr.city}, ${addr.province} ${addr.postal_code}`;

    const selectAddress = (addr: Address) => {
        setSelectedAddressId(addr.id);
        setShippingAddress(formatAddress(addr));
        setShowAddressDropdown(false);
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponInput.trim(), subtotal }),
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data.coupon);
                addToast({ type: "success", title: "Promo Diterapkan! 🎉", message: data.message });
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

    const handleCheckout = async () => {
        if (!token) {
            addToast({ type: "warning", title: "Login diperlukan", message: "Kamu harus login untuk checkout." });
            router.push("/login");
            return;
        }

        if (!shippingAddress.trim()) {
            addToast({ type: "warning", title: "Alamat diperlukan", message: "Isi alamat pengiriman." });
            return;
        }

        setIsProcessing(true);
        setCurrentStep(3);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
                method: "POST",
                headers: apiHeaders,
                body: JSON.stringify({
                    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                    coupon_code: appliedCoupon?.code || null,
                    shipping_address: shippingAddress,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (!snapReady && typeof (window as any).snap === "undefined") {
                    addToast({ type: "error", title: "Pembayaran Gagal", message: "Snap Midtrans belum siap. Silakan coba lagi." });
                    setIsProcessing(false);
                    return;
                }
                (window as any).snap.pay(data.snap_token, {
                    onSuccess: function () {
                        addToast({ type: "success", title: "Pembayaran Berhasil! 🎉", message: "Pesananmu sedang diproses." });
                        clearCart();
                        router.push("/profile");
                    },
                    onPending: function () {
                        addToast({ type: "info", title: "Menunggu Pembayaran ⏳", message: "Segera selesaikan pembayaranmu." });
                        clearCart();
                        router.push("/profile");
                    },
                    onError: function () {
                        addToast({ type: "error", title: "Pembayaran Gagal ❌", message: "Silakan coba lagi." });
                        setIsProcessing(false);
                    },
                    onClose: function () {
                        addToast({ type: "warning", title: "Pembayaran Dibatalkan", message: "Kamu menutup popup pembayaran." });
                        setIsProcessing(false);
                    },
                });
            } else {
                const errData = await res.json();
                addToast({ type: "error", title: "Gagal Checkout", message: errData.message });
                setIsProcessing(false);
            }
        } catch {
            addToast({ type: "error", title: "Kesalahan Jaringan", message: "Tidak bisa menghubungi server." });
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                <ShoppingBag className="w-20 h-20 text-gray-200 dark:text-gray-700 mb-6" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Keranjang Kosong</h2>
                <p className="text-gray-500 text-sm mb-8">Tambahkan produk dulu sebelum checkout.</p>
                <button onClick={() => router.push("/")} className="btn-primary py-3 px-8 text-sm">
                    Mulai Belanja
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
                {steps.map((step, i) => (
                    <div key={step.num} className="flex items-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                            currentStep >= step.num
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}>
                            <step.icon className="w-4 h-4" />
                            <span className="text-xs font-bold hidden sm:block">{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`w-8 md:w-16 h-0.5 mx-1 transition-colors ${
                                currentStep > step.num ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                            }`} />
                        )}
                    </div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="w-7 h-7 text-indigo-500" />
                        Checkout
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Periksa pesananmu sebelum melakukan pembayaran.</p>
                </div>

                {/* Items */}
                <div className="p-6 md:p-8 space-y-4">
                    {items.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                {item.image_url ? (
                                    <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</h3>
                                <p className="text-xs text-gray-500">{item.quantity}x Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                            </div>
                            <p className="font-black text-sm text-gray-900 dark:text-white">
                                Rp {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Shipping Address with saved addresses */}
                <div className="px-6 md:px-8 pb-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Alamat Pengiriman</span>
                        </div>

                        {/* Saved Addresses */}
                        {addresses.length > 0 && (
                            <div className="relative mb-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                >
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {selectedAddressId
                                            ? addresses.find((a) => a.id === selectedAddressId)?.label || "Pilih alamat"
                                            : "Pilih alamat tersimpan"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAddressDropdown ? "rotate-180" : ""}`} />
                                </button>

                                {showAddressDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                                    >
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => selectAddress(addr)}
                                                className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                    selectedAddressId === addr.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{addr.label}</span>
                                                    {addr.is_primary && <span className="badge badge-success text-[10px] py-0.5">Utama</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{addr.recipient_name} - {addr.phone}</p>
                                                <p className="text-xs text-gray-400 truncate">{addr.address}, {addr.city}</p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        <textarea
                            rows={2}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Atau masukkan alamat lengkap pengiriman manual..."
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Coupon */}
                <div className="px-6 md:px-8 pb-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kode Promo</span>
                        </div>

                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <div>
                                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</span>
                                        <p className="text-xs text-emerald-600">Hemat Rp {new Intl.NumberFormat("id-ID").format(appliedCoupon.discount)}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="p-1 hover:bg-emerald-100 rounded-lg">
                                    <X className="w-4 h-4 text-emerald-600" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Masukkan kode promo"
                                        value={couponInput}
                                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponInput.trim()}
                                        className="px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pakai"}
                                    </button>
                                </div>
                                {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}
                            </>
                        )}
                    </div>
                </div>

                {/* Total & CTA */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800/80 dark:to-gray-800/50 border-t border-indigo-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Pembayaran Aman & Terenkripsi</span>
                    </div>

                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">Rp {new Intl.NumberFormat("id-ID").format(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ongkos Kirim</span>
                            <span className="font-bold text-emerald-600">{shippingCost === 0 ? "GRATIS" : `Rp ${new Intl.NumberFormat("id-ID").format(shippingCost)}`}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Diskon Promo</span>
                                <span className="font-bold text-red-500">- Rp {new Intl.NumberFormat("id-ID").format(discount)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Total Pembayaran</p>
                            <p className="text-3xl md:text-4xl font-black gradient-text-primary">
                                Rp {new Intl.NumberFormat("id-ID").format(totalPrice)}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full sm:w-auto btn-primary px-10 py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Bayar Sekarang
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}