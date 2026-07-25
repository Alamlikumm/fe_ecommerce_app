"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Settings, LogOut, ChevronRight, Clock, ShoppingBag, Shield, Calendar, Heart } from "lucide-react";

const tabs = [
    { id: "orders", label: "Pesanan Saya", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Pengaturan", icon: Settings },
];

const statusBadge: Record<string, string> = {
    pending: "badge-warning",
    paid: "badge-success",
    processing: "badge-info",
    shipped: "badge-info",
    completed: "badge-success",
    cancelled: "badge-danger",
};

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        ])
            .then(([userData, ordersData]) => {
                setUser(userData);
                setOrders(ordersData);
                setLoading(false);
            })
            .catch(() => { router.push("/login"); });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (loading || !user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Memuat profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar / Profile Card */}
                <div className="lg:w-80 flex-shrink-0">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24"
                    >
                        {/* Avatar */}
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                            {user.role === "admin" && (
                                <span className="badge badge-info mt-2 inline-flex">
                                    <Shield className="w-3 h-3 mr-1" /> Admin
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">{orders.length}</p>
                                <p className="text-[11px] text-gray-500 font-medium">Pesanan</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                                <p className="text-xl font-black text-gray-900 dark:text-white">
                                    {new Date(user.created_at).getFullYear()}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium">Bergabung</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="space-y-1 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id
                                            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                                </button>
                            ))}
                        </div>

                        {user.role === "admin" && (
                            <Link
                                href="/admin"
                                className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors mb-3"
                            >
                                Buka Dasbor Admin
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </button>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                                    Riwayat Pesanan
                                </h2>

                                {orders.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                                        <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Belum ada pesanan</h3>
                                        <p className="text-sm text-gray-500 mb-6">Mulai belanja dan pesananmu akan muncul di sini.</p>
                                        <Link href="/" className="btn-primary inline-flex py-2.5 px-6 text-sm">
                                            Mulai Belanja
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order: any) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                                            >
                                                {/* Order Header */}
                                                <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                                year: "numeric", month: "long", day: "numeric",
                                                            })}
                                                        </div>
                                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                                            #ORD-{order.id}
                                                        </span>
                                                    </div>
                                                    <span className={`badge ${statusBadge[order.status] || "badge-info"} uppercase tracking-wider text-[10px]`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                                {/* Order Items */}
                                                <div className="p-4 md:p-5 divide-y divide-gray-100 dark:divide-gray-800">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {item.product?.name || "Produk Dihapus"}
                                                                </span>
                                                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium">
                                                                    x{item.quantity}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Footer */}
                                                <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                                    <span className="text-sm text-gray-500 font-medium">Total</span>
                                                    <span className="text-lg font-black gradient-text-warm">
                                                        Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "wishlist" && (
                            <motion.div
                                key="wishlist"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                                    Wishlist Saya
                                </h2>
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                                    <Heart className="w-16 h-16 text-red-200 dark:text-red-800 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Lihat Semua Wishlist</h3>
                                    <p className="text-sm text-gray-500 mb-6">Kelola produk favorit kamu di halaman Wishlist.</p>
                                    <Link href="/wishlist" className="btn-primary inline-flex py-2.5 px-6 text-sm">
                                        Buka Wishlist
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                                    Pengaturan Akun
                                </h2>
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama</label>
                                            <input type="text" defaultValue={user.name}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                                            <input type="email" defaultValue={user.email} disabled
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <button className="btn-primary py-3 px-6 text-sm">
                                            Simpan Perubahan
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
