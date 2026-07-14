"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch("http://localhost:8000/api/admin/dashboard-stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Gagal mengambil statistik");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Memuat Dasbor...</div>;
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Tren Penjualan 7 Hari Terakhir' },
        },
    };

    const chartData = {
        labels: stats?.chartData?.map((d: any) => d.date) || [],
        datasets: [
            {
                label: 'Pendapatan (Rp)',
                data: stats?.chartData?.map((d: any) => d.total) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3
            }
        ]
    };

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Ikhtisar Toko 📈</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">💰</div>
                    <h3 className="text-gray-500 font-bold mb-1">Total Pendapatan</h3>
                    <p className="text-3xl font-black text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(stats?.summary?.revenue || 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">📦</div>
                    <h3 className="text-gray-500 font-bold mb-1">Total Pesanan</h3>
                    <p className="text-3xl font-black text-gray-900">{stats?.summary?.orders || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4">👥</div>
                    <h3 className="text-gray-500 font-bold mb-1">Total Pengguna</h3>
                    <p className="text-3xl font-black text-gray-900">{stats?.summary?.users || 0}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                {stats?.chartData && stats.chartData.length > 0 ? (
                    <Line options={chartOptions} data={chartData} />
                ) : (
                    <div className="text-center py-12 text-gray-500 font-bold">Belum ada data penjualan 7 hari terakhir.</div>
                )}
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
                <h3 className="font-bold text-xl mb-2">Selamat Datang di Dasbor Admin! 🎉</h3>
                <p>Di sini kamu bisa mengelola produk, kategori, peran pengguna, dan memantau performa tokomu secara keseluruhan. Gunakan menu di samping untuk mulai bekerja.</p>
            </div>
        </div>
    );
}