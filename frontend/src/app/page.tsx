"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { motion } from "framer-motion";
import { Search, PackageX } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  // Ambil Kategori untuk dropdown filter
  useEffect(() => {
    fetch("http://localhost:8000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // Ambil Produk berdasarkan filter
  useEffect(() => {
    setLoading(true);
    // Buat URL dengan query params
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("category_id", categoryId);

    fetch(`http://localhost:8000/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [search, categoryId]);

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <main className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white py-20 px-8">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Belanja <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Lebih Pintar</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-lg font-light">
              Temukan barang impianmu hari ini dengan kualitas terbaik dan harga bersahabat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#catalog" 
                className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg text-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all"
              >
                Mulai Belanja
              </motion.a>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 hidden md:block"
          >
            {/* Abstract 3D-like illustration placeholder */}
            <div className="w-full h-80 relative">
               <div className="absolute top-10 right-10 w-48 h-48 bg-orange-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
               <div className="absolute top-0 left-10 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
               <div className="absolute -bottom-8 left-20 w-48 h-48 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
          </motion.div>
        </div>
      </section>

      <div id="catalog" className="max-w-6xl mx-auto p-8 w-full -mt-8 relative z-20">
        {/* Header & Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-3xl shadow-xl mb-12 flex flex-col md:flex-row gap-6 justify-between items-center"
        >
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Katalog Produk</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari nama barang..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[280px] backdrop-blur-sm transition-all"
              />
            </div>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 cursor-pointer backdrop-blur-sm transition-all text-gray-700 dark:text-gray-200"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-medium">Memuat koleksi terbaik...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 glass rounded-3xl border border-gray-100 shadow-sm"
          >
            <PackageX className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white">Barang tidak ditemukan</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">Coba gunakan kata kunci pencarian yang lain atau hapus filter.</p>
          </motion.div>
        )}

        {/* Grid System */}
        {!loading && products.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {products.map((product: any) => (
              <motion.div 
                variants={itemVariants}
                key={product.id} 
                className="glass rounded-3xl p-4 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col h-full group border border-white/40 dark:border-gray-700"
              >
                <Link href={`/product/${product.id}`} className="block flex-grow cursor-pointer relative overflow-hidden rounded-2xl mb-5">
                  <div className="bg-gray-100 dark:bg-gray-800 aspect-[4/3] flex items-center justify-center text-gray-400 font-medium relative">
                    {product.image_url ? (
                      <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e: any) => e.target.src = "https://via.placeholder.com/300"} />
                    ) : (
                      <PackageX className="w-12 h-12 opacity-20" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Badge Label (Opsional) */}
                  <span className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                    {product.category?.name || 'Tanpa Kategori'}
                  </span>
                </Link>

                {/* Info Produk */}
                <div className="flex flex-col gap-2 px-2">
                  <h2 className="text-xl font-extrabold text-gray-800 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={product.name}>
                    {product.name}
                  </h2>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 mt-1">
                    Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                  </p>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/50">
                  <AddToCartButton product={product} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}