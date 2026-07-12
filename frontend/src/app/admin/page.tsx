"use client"; // Client Component karena butuh akses localStorage untuk mengecek token

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");

            // Tendang ke login jika tidak ada token sama sekali
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                // Tembak API khusus Admin yang kita buat di Lesson 12
                const res = await fetch("http://localhost:8000/api/admin/orders", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                // Jika responsenya 403 (Forbidden), berarti dia cuma pembeli biasa (bukan admin)
                if (res.status === 403) {
                    setError("Akses Ditolak! Halaman Ini Khusus Admin 👮‍♂️");
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (err) {
                setError("Gagal Terhubung ke Server.");
            }
        };

        fetchOrders();
    }, []);

    // Jika kena tendang oleh Middleware Laravel, tampilkan pesan error ini
    if (error) {
        return (
            <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-red-50 text-red-600">
                <h1 className="text-3xl font-black">{error}</h1>
                <Link href="/" className="text-blue-600 underline font-bold">Kembali ke Toko</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-8 text-black">
            <div className="max-w-7xl mx-auto">

                {/* Header Dasbor */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">🛠️ Dasbor Admin</h1>
                        <p className="text-gray-500 mt-1">Pantau Semua Pesanan Yang Masuk Secara Real-time.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="bg-white border text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 shadow-sm">
                            Lihat Toko
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/login");
                            }}
                            className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 shadow-sm"
                        >
                            Logout Admin
                        </button>
                    </div>
                </div>

                {/* Tabel Pesanan */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900 text-white">
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider">ID Pesanan</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider">Info Pembeli</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider">Total Harga</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider">Status</th>
                                    <th className="p-5 font-semibold text-sm uppercase tracking-wider">Detail Barang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">

                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500 font-bold text-lg">
                                            Belum Ada Pesanan Yang Masuk 📭
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="p-5 font-black text-blue-600 text-lg">
                                                #ORD-{order.id}
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-gray-800">{order.user.name}</p>
                                                <p className="text-sm text-gray-500">{order.user.email}</p>
                                            </td>
                                            <td className="p-5 font-extrabold text-orange-500 text-lg">
                                                Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-yellow-200">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                                    {order.items.map((item: any) => (
                                                        <li key={item.id} className="font-medium">
                                                            {item.product.name} <span className="text-blue-500 font-bold">(x{item.quantity})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}