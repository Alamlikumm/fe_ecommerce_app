"use client";

import { useEffect, useState } from "react";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                } else {
                    setError("Gagal mengambil data pesanan.");
                }
            } catch (err) {
                setError("Terjadi kesalahan.");
            }
        };

        fetchOrders();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Pesanan Masuk 📦</h1>
            
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 uppercase text-xs font-black tracking-widest">
                        <tr>
                            <th className="p-4">ID Pesanan</th>
                            <th className="p-4">Pembeli</th>
                            <th className="p-4">Barang</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Waktu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                                    Belum ada pesanan masuk.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-blue-600">#ORD-{order.id}</td>
                                    <td className="p-4">
                                        <p className="font-bold">{order.user?.name}</p>
                                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex gap-2">
                                                    <span className="text-gray-500">{item.quantity}x</span>
                                                    <span className="font-bold">{item.product?.name || 'Produk dihapus'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 font-black text-orange-500">
                                        Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs font-bold">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
