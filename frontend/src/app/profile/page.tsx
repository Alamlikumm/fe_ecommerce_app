"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, Settings, LogOut, ChevronRight, Clock, ShoppingBag,
  Shield, Calendar, Heart, MapPin, Plus, X, Pencil, Trash2, Star, Check, Loader2
} from "lucide-react";
import { useToastStore } from "@/store/toastStore";

const tabs = [
  { id: "orders", label: "Pesanan Saya", icon: Package },
  { id: "addresses", label: "Alamat", icon: MapPin },
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

const statusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
}

const emptyForm = {
  label: "",
  recipient_name: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  is_primary: false,
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, { headers: apiHeaders }).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-orders`, { headers: apiHeaders }).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, { headers: apiHeaders }).then((r) => r.json()),
    ])
      .then(([userData, ordersData, addrData]) => {
        setUser(userData);
        setOrders(ordersData);
        setAddresses(addrData);
        setLoading(false);
      })
      .catch(() => { router.push("/login"); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Address CRUD
  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(emptyForm);
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code,
      is_primary: addr.is_primary,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);

    try {
      const url = editingAddress
        ? `${process.env.NEXT_PUBLIC_API_URL}/addresses/${editingAddress.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/addresses`;
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(addressForm),
      });

      if (res.ok) {
        const updated = await res.json();
        if (editingAddress) {
          setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        } else {
          setAddresses((prev) => [updated, ...prev]);
        }
        setShowAddressModal(false);
        addToast({ type: "success", title: editingAddress ? "Alamat diupdate!" : "Alamat ditambahkan!", message: "" });
      } else {
        const err = await res.json();
        addToast({ type: "error", title: "Gagal", message: err.message || "Terjadi kesalahan." });
      }
    } catch {
      addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Hapus alamat ini?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${id}`, {
        method: "DELETE",
        headers: apiHeaders,
      });

      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        addToast({ type: "success", title: "Alamat dihapus!", message: "" });
      }
    } catch {
      addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${id}/primary`, {
        method: "PUT",
        headers: apiHeaders,
      });

      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, is_primary: a.id === id }))
        );
        addToast({ type: "success", title: "Alamat utama diubah!", message: "" });
      }
    } catch {
      addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
    }
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
            {/* ORDERS TAB */}
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
                        <Link href={`/orders/${order.id}`} className="block hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
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
                            <div className="flex items-center gap-2">
                              <span className={`badge ${statusBadge[order.status] || "badge-info"} uppercase tracking-wider text-[10px]`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>

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

                          <div className="flex items-center justify-between p-4 md:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <span className="text-sm text-gray-500 font-medium">Total</span>
                            <span className="text-lg font-black gradient-text-warm">
                              Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Alamat Saya
                  </h2>
                  <button
                    onClick={openAddAddress}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Alamat
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                    <MapPin className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Belum ada alamat</h3>
                    <p className="text-sm text-gray-500 mb-6">Tambahkan alamat pengirimanmu.</p>
                    <button onClick={openAddAddress} className="btn-primary inline-flex py-2.5 px-6 text-sm">
                      Tambah Alamat
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <motion.div
                        key={addr.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 transition-all ${
                          addr.is_primary
                            ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-900 dark:text-white">
                              {addr.label || "Alamat"}
                            </span>
                            {addr.is_primary && (
                              <span className="badge badge-success text-[10px] py-0.5 px-2 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Utama
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!addr.is_primary && (
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{addr.recipient_name}</p>
                          <p className="flex items-center gap-1">
                            <span>{addr.phone}</span>
                          </p>
                          <p>{addr.address}</p>
                          <p>{addr.city}, {addr.province} {addr.postal_code}</p>
                        </div>

                        {!addr.is_primary && (
                          <button
                            onClick={() => handleSetPrimary(addr.id)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            Jadikan Utama
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Address Modal */}
                <AnimatePresence>
                  {showAddressModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                      onClick={() => setShowAddressModal(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                      >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                          </h3>
                          <button
                            onClick={() => setShowAddressModal(false)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Label</label>
                              <input
                                type="text"
                                placeholder="Utama, Kantor, dll"
                                value={addressForm.label}
                                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama Penerima *</label>
                              <input
                                type="text"
                                required
                                placeholder="Nama lengkap"
                                value={addressForm.recipient_name}
                                onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">No. Telepon *</label>
                            <input
                              type="tel"
                              required
                              placeholder="081234567890"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Alamat Lengkap *</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="Jalan, gedung, no. rumah, patokan..."
                              value={addressForm.address}
                              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Kota *</label>
                              <input
                                type="text"
                                required
                                placeholder="Kota"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Provinsi *</label>
                              <input
                                type="text"
                                required
                                placeholder="Provinsi"
                                value={addressForm.province}
                                onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Kode Pos *</label>
                              <input
                                type="text"
                                required
                                placeholder="12345"
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={addressForm.is_primary}
                              onChange={(e) => setAddressForm({ ...addressForm, is_primary: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Jadikan alamat utama
                            </span>
                          </label>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddressModal(false)}
                              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={savingAddress}
                              className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {savingAddress ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                              ) : (
                                editingAddress ? "Simpan" : "Tambah"
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* WISHLIST TAB */}
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

            {/* SETTINGS TAB */}
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