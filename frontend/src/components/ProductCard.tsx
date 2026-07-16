"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye, PackageX } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";

interface ProductCardProps {
    product: any;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const addToCart = useCartStore((s) => s.addToCart);
    const addToast = useToastStore((s) => s.addToast);

    const averageRating =
        product.reviews && product.reviews.length > 0
            ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
            : null;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        addToast({
            type: "success",
            title: "Ditambahkan ke Keranjang! 🛒",
            message: product.name,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 30 }}
            className="group bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden card-hover flex flex-col h-full"
        >
            {/* Image */}
            <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-[4/3]">
                <div className="bg-gray-100 dark:bg-gray-800 w-full h-full">
                    {product.image_url ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image_url}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            onError={(e: any) => (e.target.style.display = "none")}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <PackageX className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Detail
                    </span>
                </div>

                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-white/50 dark:border-gray-700">
                    {product.category?.name || "Tanpa Kategori"}
                </span>
            </Link>

            {/* Info */}
            <div className="flex flex-col flex-1 p-4">
                <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                    {averageRating ? (
                        <>
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{averageRating}</span>
                            </div>
                            <span className="text-xs text-gray-400">({product.reviews.length})</span>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400">Belum ada ulasan</span>
                    )}
                </div>

                {/* Price */}
                <p className="text-lg font-black gradient-text-warm mt-3">
                    Rp {new Intl.NumberFormat("id-ID").format(product.price)}
                </p>

                {/* Add to Cart */}
                <div className="mt-auto pt-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleAddToCart}
                        className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        + Keranjang
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

/* Skeleton Loader */
export function ProductCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
            <div className="aspect-[4/3] shimmer" />
            <div className="p-4 space-y-3">
                <div className="h-4 shimmer w-3/4" />
                <div className="h-4 shimmer w-1/2" />
                <div className="h-3 shimmer w-1/4 mt-2" />
                <div className="h-6 shimmer w-2/3 mt-3" />
                <div className="h-10 shimmer w-full mt-4 rounded-xl" />
            </div>
        </div>
    );
}
