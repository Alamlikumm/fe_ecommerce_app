/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Trash2, Edit, ChevronDown, Check, X, Search, Loader2, Eye } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

const statuses = [
  { value: "pending", label: "Menunggu Pembayaran", color: "badge-warning" },
  { value: "paid", label: "Dibayar", color: "badge-success" },
  { value: "processing", label: "Diproses", color: "badge-info" },
  { value: "shipped", label: "Dikirim", color: "badge-info" },
  { value: "completed", label: "Selesai", color: "badge-success" },
  { value: "cancelled", label: "Dibatalkan", color: "badge-danger" },
];



export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, { headers });
      if (res.ok) setOrders(await res.json());
      else setError("Gagal mengambil data pesanan.");
    } catch {
      setError("Terjadi kesalahan.");
    }
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${id}`, { headers });
      if (res.ok) setSelectedOrder(await res.json());
    } catch {
      addToast({ type: "error", title: "Gagal", message: "Tidak bisa mengambil detail pesanan." });
    }
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: selectedOrder._newStatus || selectedOrder.status,
          tracking_number: selectedOrder._tracking,
          shipping_courier: selectedOrder._courier,
          admin_notes: selectedOrder._notes,
        }),
      });
      if (res.ok) {
        addToast({ type: "success", title: "Status diperbarui!", message: "" });
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const err = await res.json();
        addToast({ type: "error", title: "Gagal", message: err.message });
      }
    } catch {
      addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toString().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Pesanan Masuk</h1>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 font-bold">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ID, nama, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all pr-10"
          >
            <option value="">Semua Status</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase text-[11px] font-black tracking-widest">
              <tr>
                <th className="p-4">ID Pesanan</th>
                <th className="p-4">Pembeli</th>
                <th className="p-4">Barang</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Waktu</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 font-medium">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">#ORD-{order.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-white">{order.user?.name || "-"}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {(order.items || []).map((item: { id: number; quantity: number; product?: { name?: string } }) => (
                          <div key={item.id} className="flex gap-2">
                            <span className="text-gray-500">{item.quantity}x</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{item.product?.name || "Produk dihapus"}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-black text-orange-500">
                      Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${statuses.find((s) => s.value === order.status)?.color || "badge-info"} uppercase tracking-wider text-[10px]`}>
                        {statuses.find((s) => s.value === order.status)?.label || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs font-bold">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openDetail(order.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Detail Pesanan #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pembeli</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.user?.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.shipping_address}</p>
                  </div>
                )}

                {/* Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Riwayat Status</p>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((entry: { id: number; label: string; description: string; created_at: string }) => (
                        <div key={entry.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.label}</p>
                            <p className="text-xs text-gray-500">{entry.description}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(entry.created_at).toLocaleDateString("id-ID", {
                                year: "numeric", month: "long", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Status Form */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <p className="font-black text-gray-900 dark:text-white mb-4">Perbarui Status</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Status</label>
                      <select
                        value={selectedOrder._newStatus || selectedOrder.status}
                        onChange={(e) => setSelectedOrder({ ...selectedOrder, _newStatus: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Kurir</label>
                        <input
                          type="text"
                          placeholder="JNE, SiCepat, dll"
                          value={selectedOrder._courier || ""}
                          onChange={(e) => setSelectedOrder({ ...selectedOrder, _courier: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">No. Resi</label>
                        <input
                          type="text"
                          placeholder="JP000123456"
                          value={selectedOrder._tracking || ""}
                          onChange={(e) => setSelectedOrder({ ...selectedOrder, _tracking: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Catatan Admin</label>
                      <textarea
                        rows={2}
                        value={selectedOrder._notes || ""}
                        onChange={(e) => setSelectedOrder({ ...selectedOrder, _notes: e.target.value })}
                        placeholder="Catatan internal..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={updateStatus}
                      disabled={updating}
                      className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {updating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}