"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // State untuk form ulasan
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");

    const fetchProduct = () => {
        fetch(`http://localhost:8000/api/products/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError("");
        setReviewSuccess("");
        setIsSubmitting(true);
        
        const token = localStorage.getItem("token");
        if (!token) {
            setReviewError("Kamu harus login untuk memberikan ulasan.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/api/products/${params.id}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                setReviewSuccess("Terima kasih! Ulasanmu berhasil ditambahkan.");
                setComment("");
                setRating(5);
                fetchProduct(); // Refresh data produk & ulasan
            } else {
                const errorData = await res.json();
                setReviewError(errorData.message || "Terjadi kesalahan.");
            }
        } catch (err) {
            setReviewError("Gagal menghubungi server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat produk...</div>;
    if (!product || !product.id) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-800 text-2xl">Produk tidak ditemukan 🥲</div>;

    // Hitung rata-rata rating
    const averageRating = product.reviews && product.reviews.length > 0 
        ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : "Belum ada rating";

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">TokoKita</Link>
                    <Link href="/" className="text-gray-500 font-bold hover:text-blue-600">
                        &larr; Kembali
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8 w-full flex-grow">
                {/* Bagian Detail Produk */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 mb-12">
                    <div className="md:w-1/2">
                        <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                                <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" onError={(e: any) => e.target.src = "https://via.placeholder.com/400"} />
                            ) : (
                                <span className="text-gray-400 font-bold">No Image</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <span className="text-sm text-blue-500 font-black tracking-widest uppercase mb-2">
                            {product.category?.name || 'Tanpa Kategori'}
                        </span>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center text-yellow-400 text-xl">
                                ★ <span className="text-gray-700 font-bold text-base ml-1">{averageRating}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">{product.reviews?.length || 0} Ulasan</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500 font-bold">Stok: {product.stock}</span>
                        </div>

                        <p className="text-3xl font-black text-orange-500 mb-8">
                            Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                        </p>

                        <div className="prose text-gray-600 mb-8 max-w-none">
                            <p>{product.description || 'Tidak ada deskripsi.'}</p>
                        </div>

                        <div className="mt-auto">
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>

                {/* Bagian Ulasan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-extrabold mb-6 text-gray-800">Ulasan Pembeli ({product.reviews?.length || 0})</h2>
                        
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {product.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-bold text-gray-800">{review.user?.name || 'Pengguna'}</div>
                                            <div className="text-sm text-gray-400">
                                                {new Date(review.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                        <div className="text-yellow-400 mb-3 text-lg">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </div>
                                        <p className="text-gray-600">{review.comment || '-'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-8 rounded-2xl text-center border border-gray-200">
                                <p className="text-gray-500">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Berikan Ulasanmu</h3>
                            
                            {reviewError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-4">{reviewError}</div>}
                            {reviewSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-bold mb-4">{reviewSuccess}</div>}
                            
                            <form onSubmit={submitReview} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Rating</label>
                                    <select 
                                        value={rating} 
                                        onChange={(e) => setRating(Number(e.target.value))}
                                        className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value={5}>⭐⭐⭐⭐⭐ - Sangat Bagus</option>
                                        <option value={4}>⭐⭐⭐⭐ - Bagus</option>
                                        <option value={3}>⭐⭐⭐ - Biasa Saja</option>
                                        <option value={2}>⭐⭐ - Kurang</option>
                                        <option value={1}>⭐ - Sangat Buruk</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Komentar (Opsional)</label>
                                    <textarea 
                                        rows={3} 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ceritakan pengalamanmu dengan produk ini..."
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
