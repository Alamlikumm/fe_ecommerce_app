"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, PackageX, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import CategorySlider from "@/components/CategorySlider";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("category_id", categoryId);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [search, categoryId]);

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 md:px-6 w-full py-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1">
            Katalog Produk
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Temukan ribuan produk pilihan untuk kebutuhanmu
          </p>
        </motion.div>

        {/* Category Slider */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CategorySlider
            categories={categories}
            activeId={categoryId}
            onSelect={setCategoryId}
          />
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-10"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-sm transition-all placeholder:text-gray-400"
            />
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800"
          >
            <PackageX className="w-20 h-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Coba gunakan kata kunci lain atau hapus filter untuk menemukan produk
              yang kamu cari.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryId("");
              }}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              Reset Filter
            </button>
          </motion.div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product: any, idx: number) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && products.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Menampilkan <span className="font-bold text-gray-600 dark:text-gray-300">{products.length}</span> produk
            </p>
          </div>
        )}
      </div>
    </div>
  );
}