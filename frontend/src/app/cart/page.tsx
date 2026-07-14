"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity } = useCartStore();
    const router = useRouter();

    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Simple */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">TokoKita</Link>
                    <Link href="/" className="text-gray-500 font-bold hover:text-blue-600">
                        &larr; Lanjut Belanja
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8 w-full flex-grow">
                <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Keranjang Belanja 🛒</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Keranjangmu masih kosong</h3>
                        <p className="text-gray-500 mb-6">Ayo cari barang impianmu sekarang!</p>
                        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Daftar Barang */}
                        <div className="lg:w-2/3 flex flex-col gap-4">
                            {items.map((item: any) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={`http://localhost:8000${item.image_url}`} alt={item.name} className="w-full h-full object-cover" onError={(e: any) => e.target.src = "https://via.placeholder.com/150"} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.name}</h3>
                                        <p className="text-orange-500 font-black mt-1">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md font-bold text-gray-600 hover:bg-gray-200 border border-gray-200"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-6 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md font-bold text-gray-600 hover:bg-gray-200 border border-gray-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 text-sm font-bold hover:underline"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ringkasan Belanja */}
                        <div className="lg:w-1/3">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Belanja</h3>
                                <div className="flex justify-between items-center mb-4 text-gray-600">
                                    <span>Total Barang</span>
                                    <span className="font-bold">{items.reduce((acc, i) => acc + i.quantity, 0)} pcs</span>
                                </div>
                                <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
                                    <span className="font-bold text-gray-800">Total Harga</span>
                                    <span className="text-2xl font-black text-orange-500">Rp {new Intl.NumberFormat('id-ID').format(totalPrice)}</span>
                                </div>
                                <button 
                                    onClick={() => router.push('/checkout')}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
