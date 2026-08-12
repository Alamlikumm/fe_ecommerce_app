/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Package, Settings, LogOut, ChevronRight, ShoppingBag,
  Shield, Calendar, Heart, MapPin, Plus, X, Pencil, Trash2, Check, Loader2,
  Camera, Map, Tag, Bell
} from "lucide-react";
import { useToastStore } from "@/store/toastStore";

const tabs = [
  { id: "orders", label: "Pesanan Saya", icon: Package, desc: "Lacak & riwayat pesanan" },
  { id: "addresses", label: "Alamat", icon: MapPin, desc: "Kelola alamat pengiriman" },
  { id: "wishlist", label: "Wishlist", icon: Heart, desc: "Produk favorit Anda" },
  { id: "settings", label: "Pengaturan", icon: Settings, desc: "Kata sandi & info akun" },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Telah Dibayar",
  processing: "Sedang Diproses",
  shipped: "Dalam Pengiriman",
  completed: "Pesanan Selesai",
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

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, { headers: apiHeaders }).then((r) => { if (!r.ok) throw new Error('Unauthenticated'); return r.json(); }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-orders`, { headers: apiHeaders }).then((r) => { if (!r.ok) throw new Error('Unauthenticated'); return r.json(); }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, { headers: apiHeaders }).then((r) => { if (!r.ok) throw new Error('Unauthenticated'); return r.json(); }),
    ])
      .then(([userData, ordersData, addrData]) => {
        if (userData?.message === "Unauthenticated.") throw new Error("Unauthenticated");
        setUser(userData);
        setProfileName(userData.name || "");
        setOrders(ordersData);
        setAddresses(addrData);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        method: "PUT",
        headers: apiHeaders,
        body: JSON.stringify({ name: profileName }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ type: "success", title: "Berhasil!", message: data.message || "Profil berhasil diperbarui." });
        setUser((prev: any) => (prev ? { ...prev, name: profileName } : null));
      } else {
        addToast({ type: "error", title: "Gagal", message: data.message || "Terjadi kesalahan." });
      }
    } catch {
      addToast({ type: "error", title: "Kesalahan Jaringan", message: "Tidak bisa menghubungi server." });
    } finally {
      setProfileSaving(false);
    }
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
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Akun <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Saya</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">
            Kelola pesanan, alamat pengiriman, dan pengaturan akun Anda di sini.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 sticky top-28 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-200/40 dark:shadow-black/40 overflow-hidden relative"
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

              <div className="text-center mb-8 relative z-10">
                <div className="relative inline-block mb-5 group">
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-xl shadow-indigo-500/30 transform group-hover:scale-105 transition-all duration-500">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors transform hover:scale-110 active:scale-95">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{user.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{user.email}</p>
                {user.role === "admin" && (
                  <div className="mt-3 flex justify-center">
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Shield className="w-3.5 h-3.5" /> Administrator
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800/50 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                  <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{orders.length}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Pesanan</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800/50 group hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors">
                  <p className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {new Date(user.created_at).getFullYear()}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Bergabung</p>
                </div>
              </div>

              <div className="space-y-2 mb-8 relative z-10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className="w-full relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors text-left"
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {hoveredTab === tab.id && activeTab !== tab.id && (
                      <motion.div
                        layoutId="hover-tab"
                        className="absolute inset-0 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                      activeTab === tab.id 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700"
                    }`}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    
                    <div className="relative z-10 flex-1">
                      <p className={`text-sm font-bold transition-colors ${
                        activeTab === tab.id ? "text-indigo-900 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {tab.label}
                      </p>
                      <p className={`text-[11px] transition-colors ${
                        activeTab === tab.id ? "text-indigo-600/70 dark:text-indigo-400/70" : "text-gray-400"
                      }`}>
                        {tab.desc}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 relative z-10 transition-transform ${
                      activeTab === tab.id ? "text-indigo-500 translate-x-1" : "text-gray-300 dark:text-gray-600"
                    }`} />
                  </button>
                ))}
              </div>

              {user.role === "admin" && (
                <div className="relative z-10 mb-4">
                  <Link
                    href="/admin"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                  >
                    Buka Dasbor Admin <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="relative z-10 w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar Akun
              </button>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-indigo-500" />
                      Riwayat Pesanan
                    </h2>
                  </div>

                  {orders.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none"
                    >
                      <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-12 h-12 text-indigo-500" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Belum ada pesanan</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Anda belum pernah melakukan pemesanan. Mulai jelajahi produk menarik kami sekarang!</p>
                      <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-full font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1">
                        Mulai Belanja <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5"
                    >
                      {orders.map((order: any) => (
                        <motion.div
                          key={order.id}
                          variants={itemVariants}
                          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg shadow-gray-200/20 dark:shadow-none group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                        >
                          <Link href={`/orders/${order.id}`} className="block">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
                                  <Package className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                      #ORD-{order.id}
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                                        year: "numeric", month: "long", day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge[order.status] || statusBadge.pending}`}>
                                      {statusLabels[order.status] || order.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:ml-auto">
                                <div className="text-right mr-2 hidden sm:block">
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Belanja</p>
                                  <p className="text-lg font-black text-gray-900 dark:text-white">
                                    Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                                  </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  <ChevronRight className="w-5 h-5" />
                                </div>
                              </div>
                            </div>

                            <div className="p-5 md:p-6">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Detail Produk</p>
                              <div className="space-y-4">
                                {order.items.slice(0, 2).map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                      {item.product?.images?.[0] ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.product.images[0]}`} alt={item.product?.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Tag className="w-6 h-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {item.product?.name || "Produk Dihapus"}
                                      </h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {item.quantity} x <span className="font-semibold text-gray-700 dark:text-gray-300">Rp {new Intl.NumberFormat("id-ID").format(item.price)}</span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 pt-2 flex items-center gap-1">
                                    + {order.items.length - 2} produk lainnya
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex sm:hidden items-center justify-between">
                                <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                  Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-purple-500" />
                      Alamat Pengiriman
                    </h2>
                    {addresses.length > 0 && (
                      <button
                        onClick={openAddAddress}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Alamat Baru
                      </button>
                    )}
                  </div>

                  {addresses.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none"
                    >
                      <div className="w-24 h-24 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Map className="w-12 h-12 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Belum ada alamat</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Tambahkan alamat pengiriman agar memudahkan Anda saat proses checkout pesanan.</p>
                      <button onClick={openAddAddress} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-full font-bold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1">
                        <Plus className="w-4 h-4" /> Tambah Alamat Pertama
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      {addresses.map((addr) => (
                        <motion.div
                          key={addr.id}
                          variants={itemVariants}
                          layout
                          className={`relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border p-6 transition-all ${
                            addr.is_primary
                              ? "border-purple-300 dark:border-purple-700 ring-4 ring-purple-500/10 shadow-lg shadow-purple-500/10"
                              : "border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/20 dark:shadow-none hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                        >
                          {addr.is_primary && (
                            <div className="absolute top-0 right-0">
                              <div className="bg-gradient-to-bl from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-sm flex items-center gap-1">
                                <Check className="w-3 h-3" /> Utama
                              </div>
                            </div>
                          )}

                          <div className="flex items-start justify-between mb-4 mt-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl flex-shrink-0 ${addr.is_primary ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-base text-gray-900 dark:text-white">
                                  {addr.label || "Alamat"}
                                </h4>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{addr.recipient_name}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                            <p className="font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                              {addr.phone}
                            </p>
                            <p className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0" />
                              <span className="line-clamp-2">{addr.address}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                              {addr.city}, {addr.province} {addr.postal_code}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            {!addr.is_primary && (
                              <>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSetPrimary(addr.id)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl text-sm font-bold transition-colors"
                                >
                                  Jadikan Utama
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <Heart className="w-6 h-6 text-pink-500" />
                      Wishlist Tersimpan
                    </h2>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-pink-50 dark:bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-pink-500 fill-pink-500/20" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Lihat Semua Wishlist</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Kelola semua produk favorit yang telah Anda simpan di halaman khusus Wishlist.</p>
                      <Link href="/wishlist" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-8 rounded-full font-bold text-sm hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1">
                        Buka Halaman Wishlist <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-500" />
                      Pengaturan Akun
                    </h2>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none">
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Informasi Dasar</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Perbarui nama dan informasi profil Anda.</p>
                      
                      <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama Lengkap</label>
                          <div className="relative">
                            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all dark:text-white" />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Shield className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Alamat Email</label>
                          <div className="relative">
                            <input type="email" value={user.email} disabled
                              className="w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-500 cursor-not-allowed" />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Settings className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" /> Email telah diverifikasi
                          </p>
                        </div>
                        <div className="pt-4">
                          <button type="submit" disabled={profileSaving} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-8 rounded-full font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                            {profileSaving ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                            ) : (
                              <><Check className="w-4 h-4" /> Simpan Perubahan</>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-800/30">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Preferensi Notifikasi</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Atur bagaimana kami menghubungi Anda.</p>
                      
                      <div className="space-y-4 max-w-xl">
                        <label className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                              <Bell className="w-4 h-4 text-blue-500" /> Promo & Diskon
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dapatkan info terbaru tentang promo, flash sale, dan diskon spesial.</p>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </div>
                        </label>
                        
                        <label className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" /> Status Pesanan
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Terima notifikasi instan saat status pesanan Anda berubah.</p>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer mt-1">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Address Modal with Enhanced UI */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowAddressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {editingAddress ? "Edit Alamat Pengiriman" : "Tambah Alamat Baru"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Pastikan alamat yang Anda masukkan benar.</p>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <form id="address-form" onSubmit={handleSaveAddress} className="space-y-6">
                  <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">
                      Gunakan label yang mudah diingat seperti &quot;Rumah&quot;, &quot;Kantor&quot;, atau &quot;Apartemen&quot; untuk memudahkan pemilihan saat checkout.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Label Alamat</label>
                      <input
                        type="text"
                        placeholder="Contoh: Rumah, Kantor, Kosan"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama Penerima <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap"
                        value={addressForm.recipient_name}
                        onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">No. Telepon <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Alamat Lengkap <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Nama jalan, gedung, no. rumah, detail patokan..."
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all resize-none dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Provinsi <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Provinsi"
                        value={addressForm.province}
                        onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Kota/Kabupaten <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="Kota / Kabupaten"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Kode Pos <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="12345"
                        value={addressForm.postal_code}
                        onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={addressForm.is_primary}
                        onChange={(e) => setAddressForm({ ...addressForm, is_primary: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white block">Jadikan Alamat Utama</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Alamat ini akan otomatis terpilih saat checkout.</span>
                    </div>
                  </label>
                </form>
              </div>

              <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-3.5 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  form="address-form"
                  type="submit"
                  disabled={savingAddress}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center gap-2 disabled:opacity-70"
                >
                  {savingAddress ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    editingAddress ? "Simpan Perubahan" : "Simpan Alamat"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </div>
  );
}