"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/products");
            if (res.ok) setProducts(await res.json());
        } catch (err) {}
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/api/admin/categories", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setCategories(await res.json());
        } catch (err) {}
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const openModal = (product: any = null) => {
        setError("");
        setImageFile(null);
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                stock: product.stock,
                description: product.description || "",
            });
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                category_id: "",
                price: "",
                stock: "",
                description: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        // Menggunakan FormData karena kita mengirim file gambar
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("category_id", formData.category_id);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        payload.append("description", formData.description);
        
        if (imageFile) {
            payload.append("image", imageFile);
        }

        try {
            const url = editingId 
                ? `http://localhost:8000/api/admin/products/${editingId}`
                : `http://localhost:8000/api/admin/products`;
                
            // Untuk Update dengan FormData di PHP/Laravel, kita gunakan POST tapi tambahkan _method PUT
            if (editingId) {
                payload.append("_method", "PUT");
            }

            const res = await fetch(url, {
                method: "POST", // Selalu POST jika kirim FormData (dengan _method override)
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // Jangan set Content-Type ke application/json, biarkan browser yang atur multipart/form-data
                    "Accept": "application/json"
                },
                body: payload
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            } else {
                const data = await res.json();
                setError(data.message || "Gagal menyimpan produk");
            }
        } catch (err) {
            setError("Gagal menghubungi server");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus produk ini secara permanen?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
        } catch (err) {}
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Manajemen Produk</h2>
                    <p className="text-gray-500 mt-1">Tambah, ubah, atau hapus barang daganganmu.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                >
                    + Tambah Produk Baru
                </button>
            </div>

            {/* Tabel Produk */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700">
                                <th className="p-4 font-semibold text-sm">Foto</th>
                                <th className="p-4 font-semibold text-sm">Nama Produk</th>
                                <th className="p-4 font-semibold text-sm">Kategori</th>
                                <th className="p-4 font-semibold text-sm">Harga</th>
                                <th className="p-4 font-semibold text-sm">Stok</th>
                                <th className="p-4 font-semibold text-sm text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={`http://localhost:8000${p.image_url || '/placeholder.png'}`} alt={p.name} className="w-full h-full object-cover" onError={(e: any) => e.target.src = "https://via.placeholder.com/150"} />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-900">{p.name}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{p.description}</p>
                                    </td>
                                    <td className="p-4 text-gray-600">{p.category?.name || '-'}</td>
                                    <td className="p-4 font-bold text-orange-600">Rp {new Intl.NumberFormat('id-ID').format(p.price)}</td>
                                    <td className="p-4 font-bold text-gray-700">{p.stock} pcs</td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => openModal(p)}
                                            className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500 font-medium">Belum ada produk jualan. Ayo tambahkan!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-2xl font-extrabold text-gray-900">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">{error}</div>}
                            
                            <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Produk</label>
                                    <input 
                                        type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                        <select 
                                            required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                            className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                        >
                                            <option value="" disabled>Pilih Kategori...</option>
                                            {categories.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Harga (Rp)</label>
                                        <input 
                                            type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Stok Barang</label>
                                        <input 
                                            type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                            className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Foto Produk</label>
                                        <input 
                                            type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            className="w-full border-gray-300 rounded-xl p-2 border bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-gray-900"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah foto</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Produk</label>
                                    <textarea 
                                        rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full border-gray-300 rounded-xl p-3 border focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">
                                Batal
                            </button>
                            <button type="submit" form="productForm" className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md">
                                {editingId ? "Simpan Perubahan" : "Tambahkan Produk"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
