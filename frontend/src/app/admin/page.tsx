"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DollarSign, Package, Users, TrendingUp, ArrowUpRight, ShoppingBag, Plus, Eye } from "lucide-react";
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const statCards = [
    {
        label: "Total Pendapatan",
        key: "revenue",
        icon: DollarSign,
        color: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
        format: (v: number) => `Rp ${new Intl.NumberFormat("id-ID").format(v)}`,
    },
    {
        label: "Total Pesanan",
        key: "orders",
        icon: ShoppingBag,
        color: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        format: (v: number) => v.toString(),
    },
    {
        label: "Total Pengguna",
        key: "users",
        icon: Users,
        color: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
        format: (v: number) => v.toString(),
    },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        setDashboardError("");
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
        ])
            .then(([statsData, ordersData]) => {
                setStats(statsData);
                const orders = Array.isArray(ordersData) ? ordersData : ordersData.data || [];
                setRecentOrders(orders.slice(0, 5));
            })
            .catch(() => setDashboardError("Gagal memuat data dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
                </div>
                <div className="h-80 shimmer rounded-2xl" />
            </div>
        );
    }

    if (dashboardError) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
                <p className="font-bold text-lg mb-2">{dashboardError}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
                    Muat Ulang
                </button>
            </div>
        );
    }

    const chartData = {
        labels: stats?.chartData?.map((d: any) => {
            const date = new Date(d.date);
            return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        }) || [],
        datasets: [
            {
                label: "Pendapatan (Rp)",
                data: stats?.chartData?.map((d: any) => d.total) || [],
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: "rgb(99, 102, 241)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 7,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleFont: { size: 13, weight: 700 as const },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                    label: (ctx: any) => `Rp ${new Intl.NumberFormat("id-ID").format(ctx.raw)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, weight: 600 as const }, color: "#94a3b8" },
            },
            y: {
                grid: { color: "rgba(148, 163, 184, 0.1)" },
                ticks: {
                    font: { size: 12 },
                    color: "#94a3b8",
                    callback: (v: any) => `Rp ${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v)}`,
                },
            },
        },
    };

    const statusBadge: Record<string, string> = {
        pending: "badge-warning",
        paid: "badge-success",
        processing: "badge-info",
        cancelled: "badge-danger",
    };

    return (
        <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Tambah Produk
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Eye className="w-4 h-4" /> Lihat Semua Pesanan
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                    {card.format(stats?.summary?.[card.key] || 0)}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 mt-3 ${card.textColor}`}>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Aktif</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">Tren Penjualan</h3>
                        <p className="text-xs text-gray-500">7 hari terakhir</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Live</span>
                    </div>
                </div>
                <div className="h-72">
                    {stats?.chartData && stats.chartData.length > 0 ? (
                        <Line options={chartOptions} data={chartData} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                            Belum ada data penjualan.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="text-base font-black text-gray-900 dark:text-white">Pesanan Terbaru</h3>
                    <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Lihat Semua →
                    </Link>
                </div>

                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-t border-gray-100 dark:border-gray-800">
                                    <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                    <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                #ORD-{order.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {order.user?.name || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className={`badge ${statusBadge[order.status] || "badge-info"} uppercase tracking-wider text-[10px]`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                                            Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 text-sm font-medium">
                        Belum ada pesanan.
                    </div>
                )}
            </motion.div>
        </div>
    );
}