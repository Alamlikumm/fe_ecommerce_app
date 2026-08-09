/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { Star, ChevronRight, Home, Share2, Shield, Truck, RotateCcw, Minus, Plus, PackageX } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImageZoom, setActiveImageZoom] = useState(false);
    const router = useRouter();

    // Variant state
    const [selectedVariants, setSelectedVariants] = useState<any>({});
    const [activeVariant, setActiveVariant] = useState<any>(null);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addToCart = useCartStore((s) => s.addToCart);
    const addToast = useToastStore((s) => s.addToast);

    const [fetchError, setFetchError] = useState("");
    const [notFound, setNotFound] = useState(false);

    const fetchProduct = async () => {
        setLoading(true);
        setFetchError("");
        setNotFound(false);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            setProduct(data);
            setLoading(false);

            if (data.category_id) {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category_id=${data.category_id}`)
                    .then((r) => r.json())
                    .then((relData) => {
                        setRelatedProducts(
                            (Array.isArray(relData) ? relData : relData.data || [])
                                .filter((p: any) => p.id !== data.id)
                                .slice(0, 5)
                        );
                    })
                    .catch(() => {});
            }
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : "Gagal memuat produk");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = localStorage.getItem("token");
        if (!token) {
            addToast({ type: "warning", title: "Login diperlukan", message: "Kamu harus login untuk memberikan ulasan." });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating, comment }),
            });

            if (res.ok) {
                addToast({ type: "success", title: "Ulasan terkirim! ⭐", message: "Terima kasih atas ulasanmu." });
                setComment("");
                setRating(5);
                fetchProduct();
            } else {
                const errorData = await res.json();
                addToast({ type: "error", title: "Gagal mengirim ulasan", message: errorData.message || "Terjadi kesalahan." });
            }
        } catch {
            addToast({ type: "error", title: "Gagal", message: "Tidak bisa menghubungi server." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEffectivePrice = () => product.price + (activeVariant?.price_adjustment || 0);

    const getCartProduct = () => ({
        ...product,
        price: getEffectivePrice(),
        variant: activeVariant ? { id: activeVariant.id, name: activeVariant.name, value: activeVariant.value } : null,
    });

    const handleBuyNow = () => {
        const cartProduct = getCartProduct();
        for (let i = 0; i < quantity; i++) addToCart(cartProduct);
        router.push("/checkout");
    };

    const handleAddToCart = () => {
        const cartProduct = getCartProduct();
        for (let i = 0; i < quantity; i++) addToCart(cartProduct);
        addToast({ type: "success", title: `${quantity}x Ditambahkan ke Keranjang! 🛒`, message: cartProduct.name });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast({ type: "info", title: "Link disalin! 🔗", message: "Link produk berhasil disalin ke clipboard." });
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-12 animate-pulse">
                    <div className="md:w-1/2 aspect-square shimmer rounded-3xl" />
                    <div className="md:w-1/2 space-y-4">
                        <div className="h-4 shimmer w-1/4" />
                        <div className="h-8 shimmer w-3/4" />
                        <div className="h-6 shimmer w-1/3" />
                        <div className="h-24 shimmer w-full mt-6" />
                        <div className="h-12 shimmer w-full mt-6 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (notFound)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <PackageX className="w-20 h-20 text-gray-300 mb-4" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Produk tidak ditemukan</h2>
                <p className="text-gray-500 mt-2">Produk yang kamu cari tidak tersedia atau telah dihapus.</p>
            </div>
        );

    if (fetchError)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <PackageX className="w-20 h-20 text-red-300 mb-4" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Gagal memuat produk</h2>
                <p className="text-gray-500 mb-6">{fetchError}</p>
                <button onClick={fetchProduct} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        );

    if (!product || !product.id) return null;

    const averageRating =
        product.reviews && product.reviews.length > 0
            ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
            : null;

    // Rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: product.reviews?.filter((r: any) => r.rating === star).length || 0,
    }));
    const maxCount = Math.max(...ratingDist.map((r) => r.count), 1);

    return (
        <div>
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-400">{product.category?.name || "Produk"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            {/* Product Detail */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="md:w-1/2 relative group"
                        >
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-zoom-in"
                                 onMouseEnter={() => setActiveImageZoom(true)}
                                 onMouseLeave={() => setActiveImageZoom(false)}
                            >
                                {product.image_url ? (
                                    <img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-transform duration-700 ${activeImageZoom ? "scale-125" : "scale-100"}`}
                                        onError={(e: any) => (e.target.style.display = "none")}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <PackageX className="w-20 h-20 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Details */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:w-1/2 p-6 md:p-10 flex flex-col"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="badge badge-info text-[11px]">
                                    {product.category?.name || "Tanpa Kategori"}
                                </span>
                                {product.stock > 0 ? (
                                    <span className="badge badge-success text-[11px]">Stok: {product.stock}</span>
                                ) : (
                                    <span className="badge badge-danger text-[11px]">Stok Habis</span>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                                {product.name}
                            </h1>

                            {/* Rating Summary */}
                            <div className="flex items-center gap-3 mb-6">
                                {averageRating ? (
                                    <>
                                        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="font-black text-amber-700 dark:text-amber-400">{averageRating}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">({product.reviews.length} Ulasan)</span>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400">Belum ada ulasan</span>
                                )}
                                <button onClick={handleShare} className="ml-auto p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-indigo-600">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    {Object.entries(
                                        product.variants.reduce((acc: any, v: any) => {
                                            if (!acc[v.type]) acc[v.type] = [];
                                            acc[v.type].push(v);
                                            return acc;
                                        }, {} as Record<string, any[]>)
                                    ).map(([type, items]: any) => (
                                        <div key={type}>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{type}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((v: any) => {
                                                    const isSelected = selectedVariants[type]?.id === v.id;
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => {
                                                                const newSel = { ...selectedVariants, [type]: v };
                                                                setSelectedVariants(newSel);
                                                                setActiveVariant(v);
                                                            }}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                                isSelected
                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
                                                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                                                            }`}
                                                        >
                                                            {v.value}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price */}
                            <p className="text-3xl md:text-4xl font-black gradient-text-warm mb-6">
                                Rp {new Intl.NumberFormat("id-ID").format(product.price + (activeVariant?.price_adjustment || 0))}
                            </p>

                            {/* Description */}
                            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                                <p>{product.description || "Tidak ada deskripsi."}</p>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { icon: Shield, label: "Original" },
                                    { icon: Truck, label: "Gratis Ongkir" },
                                    { icon: RotateCcw, label: "7 Hari Garansi" },
                                ].map((b) => (
                                    <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                        <b.icon className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{b.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Quantity & CTA */}
                            <div className="space-y-4 mt-auto">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Jumlah</span>
                                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-xl transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleAddToCart}
                                        className="flex-1 py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                                    >
                                        + Keranjang
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleBuyNow}
                                        className="flex-1 btn-primary py-3.5 text-sm"
                                    >
                                        Beli Sekarang
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Review List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                            Ulasan Pembeli ({product.reviews?.length || 0})
                        </h2>

                        {/* Rating Distribution */}
                        {product.reviews && product.reviews.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">{averageRating}</p>
                                        <div className="flex gap-0.5 mt-1 justify-center">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{product.reviews.length} ulasan</p>
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        {ratingDist.map((r) => (
                                            <div key={r.star} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 w-3">{r.star}</span>
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 w-6 text-right">{r.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {product.reviews.map((review: any) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={review.id}
                                        className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400">
                                                    {(review.user?.name || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{review.user?.name || "Pengguna"}</p>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(review.created_at).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment || "-"}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                <Star className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Belum ada ulasan. Jadilah yang pertama!</p>
                            </div>
                        )}
                    </div>

                    {/* Review Form */}
                    <div>
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 sticky top-24">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">Berikan Ulasanmu</h3>
                            <form onSubmit={submitReview} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                type="button"
                                                key={s}
                                                onClick={() => setRating(s)}
                                                className="p-1 transition-transform hover:scale-110"
                                            >
                                                <Star className={`w-7 h-7 transition-colors ${s <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Komentar</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-800 resize-none transition-all"
                                        placeholder="Ceritakan pengalamanmu..."
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-primary py-3 text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                            Produk Serupa
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {relatedProducts.map((p: any, i: number) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 md:hidden z-40">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">Harga</p>
                        <p className="text-lg font-black gradient-text-warm">
                            Rp {new Intl.NumberFormat("id-ID").format(getEffectivePrice())}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="px-5 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-sm"
                    >
                        Keranjang
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="px-5 py-3 btn-primary text-sm"
                    >
                        Beli
                    </button>
                </div>
            </div>
        </div>
    );
}
