"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, Package, Star, ArrowLeft, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const addToCart = useCartStore((s) => s.addToCart);
    const addToast = useToastStore((s) => s.addToast);
    const { removeId } = useWishlistStore();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [router]);

    const handleRemove = async (productId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Optimistic remove
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        removeId(productId);

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ product_id: productId }),
            });
            addToast({ type: "info", title: "Dihapus dari Wishlist", message: "Produk telah dihapus dari wishlist." });
        } catch {
            addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
        }
    };

    const handleAddToCart = (product: any) => {
        addToCart(product);
        addToast({ type: "success", title: "Ditambahkan ke Keranjang! 🛒", message: product.name });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Memuat wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                        Wishlist Saya
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{products.length} produk favorit</p>
                </div>
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Lanjut Belanja
                </Link>
            </div>

            {products.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
                >
                    <Heart className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Wishlist Masih Kosong</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Ketuk ikon ❤️ di produk untuk menambahkannya ke wishlist!
                    </p>
                    <Link href="/" className="inline-flex btn-primary py-3 px-8 text-sm">
                        Mulai Belanja
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <AnimatePresence>
                        {products.map((product: any, idx: number) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden card-hover flex flex-col"
                            >
                                {/* Image */}
                                <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/3]">
                                    <div className="bg-gray-100 dark:bg-gray-800 w-full h-full">
                                        {product.image_url ? (
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e: any) => (e.target.style.display = "none")}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Category */}
                                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-white/50 dark:border-gray-700">
                                        {product.category?.name || "Tanpa Kategori"}
                                    </span>
                                </Link>

                                {/* Info */}
                                <div className="p-4 flex flex-col flex-1">
                                    <Link href={`/product/${product.id}`}>
                                        <h3 className="font-bold text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-indigo-600 transition-colors min-h-[2.5rem]">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="text-lg font-black gradient-text-warm mt-2">
                                        Rp {new Intl.NumberFormat("id-ID").format(product.price)}
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => handleAddToCart(product)}
                                            className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-1.5"
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            + Keranjang
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleRemove(product.id)}
                                            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
