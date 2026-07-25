"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, PackageX, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import CategorySlider from "@/components/CategorySlider";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const perPage = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("category_id", categoryId);
    if (sort) params.append("sort", sort);
    if (priceMin) params.append("price_min", priceMin);
    if (priceMax) params.append("price_max", priceMax);
    if (minRating) params.append("min_rating", minRating);
    params.append("per_page", String(perPage));
    params.append("page", String(page));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`);
      const data = await res.json();

      if (data.data) {
        setProducts(data.data);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      } else {
        setProducts(data);
        setLastPage(1);
        setTotal(data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, sort, priceMin, priceMax, minRating, page]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, sort, priceMin, priceMax, minRating]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSort("newest");
    setPriceMin("");
    setPriceMax("");
    setMinRating("");
    setPage(1);
  };

  const hasActiveFilters = search || categoryId || priceMin || priceMax || minRating;

  return (
    <div className="flex flex-col">
      <HeroBanner />

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
          className="flex flex-col sm:flex-row gap-3 mb-4"
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

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Termurah</option>
            <option value="price_desc">Termahal</option>
            <option value="name_asc">A-Z</option>
            <option value="name_desc">Z-A</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
              showFilters || hasActiveFilters
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </motion.div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap items-end gap-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Harga Min</label>
              <input
                type="number"
                placeholder="Rp 0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-32 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Harga Max</label>
              <input
                type="number"
                placeholder="Rp 999.999"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-32 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Rating Min</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Semua</option>
                <option value="4">4+ ★</option>
                <option value="3">3+ ★</option>
                <option value="2">2+ ★</option>
                <option value="1">1+ ★</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              {total > 0 ? (
                <>Menampilkan <span className="font-bold text-gray-600 dark:text-gray-300">{products.length}</span> dari <span className="font-bold text-gray-600 dark:text-gray-300">{total}</span> produk</>
              ) : "Tidak ada produk"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Hapus Filter
              </button>
            )}
          </div>
        )}

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
              {hasActiveFilters ? "Produk tidak ditemukan" : "Belum ada produk"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {hasActiveFilters
                ? "Coba gunakan kata kunci lain atau hapus filter untuk menemukan produk yang kamu cari."
                : "Belum ada produk yang tersedia saat ini."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </motion.div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((product: any, idx: number) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          p === page
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                            : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => setPage(Math.min(lastPage, page + 1))}
                  disabled={page === lastPage}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}