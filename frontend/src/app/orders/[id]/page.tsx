"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import {
  ArrowLeft, Package, ChevronRight, Calendar, MapPin, Truck,
  CreditCard, Check, Clock, Loader2, PackageX, ShoppingBag, Home
} from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const statusBadge: Record<string, string> = {
  pending: "badge-warning",
  paid: "badge-success",
  processing: "badge-info",
  shipped: "badge-info",
  completed: "badge-success",
  cancelled: "badge-danger",
};

const timelineIcons: Record<string, any> = {
  pending: Clock,
  paid: CreditCard,
  processing: Package,
  shipped: Truck,
  completed: Check,
  cancelled: PackageX,
};

const timelineColors: Record<string, string> = {
  pending: "text-amber-500 border-amber-500",
  paid: "text-emerald-500 border-emerald-500",
  processing: "text-blue-500 border-blue-500",
  shipped: "text-indigo-500 border-indigo-500",
  completed: "text-emerald-500 border-emerald-500",
  cancelled: "text-red-500 border-red-500",
};

const timelineBg: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30",
  paid: "bg-emerald-100 dark:bg-emerald-900/30",
  processing: "bg-blue-100 dark:bg-blue-900/30",
  shipped: "bg-indigo-100 dark:bg-indigo-900/30",
  completed: "bg-emerald-100 dark:bg-emerald-900/30",
  cancelled: "bg-red-100 dark:bg-red-900/30",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setOrder)
      .catch(() => router.push("/profile"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <PackageX className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Pesanan tidak ditemukan</h2>
      </div>
    );
  }

  const currentStatusIndex = ["pending", "paid", "processing", "shipped", "completed"].indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back Button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Profil
      </Link>

      {/* Order Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6"
      >
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                  Pesanan #{order.id}
                </h1>
                <span className={`badge ${statusBadge[order.status] || "badge-info"} uppercase tracking-wider`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Total Pembayaran</p>
              <p className="text-2xl font-black gradient-text-warm">
                Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="p-6 md:p-8">
          <h3 className="font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Status Pesanan
          </h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {order.timeline?.length > 0 ? (
                order.timeline.map((entry: any, idx: number) => {
                  const Icon = timelineIcons[entry.status] || Clock;
                  const isLast = idx === order.timeline.length - 1;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="relative flex gap-4"
                    >
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${timelineColors[entry.status] || "text-gray-400 border-gray-300"} ${timelineBg[entry.status] || "bg-gray-100 dark:bg-gray-800"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {entry.label}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(entry.created_at).toLocaleDateString("id-ID", {
                            year: "numeric", month: "long", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="relative flex gap-4">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${timelineColors[order.status]} ${timelineBg[order.status]}`}>
                    {React.createElement(timelineIcons[order.status] || Clock, { className: "w-4 h-4" })}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {statusLabels[order.status] || order.status}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Status terakhir diperbarui
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              Produk Dipesan
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {order.items.map((item: any, idx: number) => (
              <div key={item.id} className="p-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                  {item.product?.image_url ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.image_url}`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {item.product?.name || "Produk Dihapus"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantity}x Rp {new Intl.NumberFormat("id-ID").format(item.price)}
                  </p>
                </div>
                <p className="font-black text-sm text-gray-900 dark:text-white">
                  Rp {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h4 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500" />
              Pengiriman
            </h4>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium">Alamat</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {order.shipping_address || "Tidak ada alamat"}
                </p>
              </div>

              {order.shipping_courier && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Kurir</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                    {order.shipping_courier}
                  </p>
                </div>
              )}

              {order.tracking_number && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">No. Resi</p>
                  <p className="font-bold text-indigo-600 mt-0.5">
                    {order.tracking_number}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h4 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Rincian Pembayaran
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  Rp {new Intl.NumberFormat("id-ID").format(order.total_price - (order.shipping_cost || 0) + (order.discount || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-bold text-emerald-600">
                  {order.shipping_cost > 0
                    ? `Rp ${new Intl.NumberFormat("id-ID").format(order.shipping_cost)}`
                    : "GRATIS"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Diskon</span>
                  <span className="font-bold text-red-500">
                    - Rp {new Intl.NumberFormat("id-ID").format(order.discount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-black text-lg gradient-text-warm">
                  Rp {new Intl.NumberFormat("id-ID").format(order.total_price)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}