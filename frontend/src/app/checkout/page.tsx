"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

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
        return <div className="p-8 text-center mt-32 text-2xl font-bold text-gray-500">Keranjangmu masih kosong 🛒</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8 text-black">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border">
                <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Ringkasan Pesanan</h1>

                <div className="space-y-4 mb-8">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                <p className="text-gray-500">{item.quantity} x Rp {new Intl.NumberFormat('id-ID').format(item.price)}</p>
                            </div>
                            <p className="font-extrabold text-lg text-gray-800">
                                Rp {new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div>
                        <p className="text-gray-600 font-bold mb-1">Total Pembayaran</p>
                        <p className="text-3xl font-black text-blue-600">
                            Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}
                        </p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        Bayar Sekarang
                    </button>
                </div>
            </div>
        </main>
    );
}