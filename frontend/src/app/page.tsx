"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

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

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">


      <div className="max-w-6xl mx-auto p-8 w-full">
        {/* Header & Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 text-gray-800">Katalog Produk</h1>
            <p className="text-gray-500">Temukan barang impianmu hari ini!</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Cari nama barang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[250px]"
            />
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-gray-500 font-bold text-xl animate-pulse">
            Mencari barang... 🔍
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🥲</div>
            <h3 className="text-2xl font-bold text-gray-800">Barang tidak ditemukan</h3>
            <p className="text-gray-500 mt-2">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}

        {/* Grid System Tailwind untuk menata kartu produk */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                {/* Link ke Halaman Detail (Akan dibuat di Tahap 3) */}
                <Link href={`/product/${product.id}`} className="block flex-grow cursor-pointer">
                  {/* Tempat Gambar */}
                  <div className="bg-gray-100 h-48 rounded-xl mb-4 flex items-center justify-center text-gray-400 font-medium overflow-hidden">
                    {product.image_url ? (
                      <img src={`http://localhost:8000${product.image_url}`} alt={product.name} className="h-full w-full object-cover transition-transform hover:scale-105 duration-500" onError={(e: any) => e.target.src = "https://via.placeholder.com/150"} />
                    ) : (
                      "Belum Ada Gambar"
                    )}
                  </div>

                  {/* Info Produk */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-blue-500 font-bold tracking-widest uppercase">
                      {product.category?.name || 'Tanpa Kategori'}
                    </span>
                    <h2 className="text-lg font-extrabold text-gray-800 line-clamp-2 leading-tight" title={product.name}>
                      {product.name}
                    </h2>
                    <p className="text-xl font-black text-orange-500 mt-2">
                      Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                    </p>
                  </div>
                </Link>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <AddToCartButton product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}