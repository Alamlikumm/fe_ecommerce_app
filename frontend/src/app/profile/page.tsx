"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Ambil Data Profil
        fetch("http://localhost:8000/api/user", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => router.push("/login"));

        // Ambil Riwayat Pesanan
        fetch("http://localhost:8000/api/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setOrders(data);
            setLoading(false);
        })
        .catch(() => setLoading(false));

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat profil...</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">TokoKita</Link>
                    <Link href="/" className="text-gray-500 font-bold hover:text-blue-600">
                        &larr; Lanjut Belanja
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8 w-full flex-grow flex flex-col md:flex-row gap-8">
                
                {/* Kartu Profil */}
                <div className="md:w-1/3">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-black mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 mb-6">{user.email}</p>
                        
                        {user.role === 'admin' && (
                            <Link href="/admin" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-3 hover:bg-indigo-700 transition-colors">
                                Masuk ke Dasbor Admin
                            </Link>
                        )}
                        
                        <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors">
                            Keluar (Logout)
                        </button>
                    </div>
                </div>

                {/* Riwayat Pesanan */}
                <div className="md:w-2/3">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Riwayat Pesanan</h2>
                    
                    {orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                            <div className="text-5xl mb-4">🛍️</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada pesanan</h3>
                            <p className="text-gray-500">Kamu belum pernah berbelanja di sini.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {orders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold mb-1">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                            </p>
                                            <p className="font-black text-blue-600">#ORD-{order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-200">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center py-2 text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-800">{item.product?.name || 'Produk Dihapus'}</span>
                                                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                                                </div>
                                                <span className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className="text-gray-500 font-bold">Total Belanja</span>
                                        <span className="text-2xl font-black text-orange-500">Rp {new Intl.NumberFormat('id-ID').format(order.total_price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
