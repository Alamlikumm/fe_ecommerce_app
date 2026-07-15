"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const router = useRouter();

    // Hitung total harga otomatis
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. Panggil script khusus dari server Midtrans secara otomatis saat halaman Checkout ini dibuka
    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = " Mid-client-ZT62-Lz_-u-wE7_3";

        const script = document.createElement("script");
        script.src = snapScript;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script); // Bersihkan script jika user pindah halaman
        };
    }, []);

    const handleCheckout = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Ups! Kamu harus login dulu.");
            router.push("/login");
            return;
        }

        try {
            // 2. Minta tiket (Snap Token) dari Backend Laravel
            const res = await fetch("http://localhost:8000/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                const data = await res.json();

                // 3. Panggil Pop-Up Midtrans menggunakan tiket (Token) dari Laravel tadi!
                (window as any).snap.pay(data.snap_token, {
                    onSuccess: function (result: any) {
                        alert("🎉 Pembayaran Berhasil Dikonfirmasi!");
                        clearCart();
                        router.push("/");
                    },
                    onPending: function (result: any) {
                        alert("⏳ Menunggu pembayaranmu (Pending). Segera selesaikan di ATM/Kasir!");
                        clearCart();
                        router.push("/");
                    },
                    onError: function (result: any) {
                        alert("❌ Pembayaran Gagal!");
                    },
                    onClose: function () {
                        alert("Kamu menutup popup sebelum menyelesaikan pembayaran.");
                    }
                });

            } else {
                const errData = await res.json();
                alert("Error dari Server Laravel: " + errData.message);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan jaringan.");
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-24 h-24 text-gray-300 mb-6" />
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">Keranjang Masih Kosong</h2>
                <p className="text-gray-500 text-lg mb-8">Yuk, cari barang impianmu dulu!</p>
                <button onClick={() => router.push("/")} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors">
                    Mulai Belanja
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-8 text-black dark:text-white flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="max-w-2xl w-full glass p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/50 relative overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 text-gray-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="w-10 h-10 text-indigo-500" />
                        Checkout
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">Selesaikan pembayaranmu dengan aman dan cepat.</p>

                    <div className="space-y-6 mb-10">
                        {items.map((item, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={item.id} 
                                className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700/50 pb-6 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                                        {item.quantity}x
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{item.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Rp {new Intl.NumberFormat('id-ID').format(item.price)} / unit</p>
                                    </div>
                                </div>
                                <p className="font-black text-xl text-gray-900 dark:text-white">
                                    Rp {new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800/80 dark:to-gray-800/50 p-8 rounded-3xl border border-indigo-100 dark:border-gray-700 relative overflow-hidden">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/10 dark:text-white/5" />
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-wider text-sm">Total Pembayaran</p>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                    Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCheckout}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Bayar Sekarang
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}