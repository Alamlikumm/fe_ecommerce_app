"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const fetchCategories = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/api/admin/categories", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setCategories(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        try {
            const url = editingId 
                ? `http://localhost:8000/api/admin/categories/${editingId}`
                : `http://localhost:8000/api/admin/categories`;
                
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                setName("");
                setEditingId(null);
                fetchCategories();
            } else {
                const data = await res.json();
                setError(data.message || "Gagal menyimpan kategori");
            }
        } catch (err) {
            setError("Gagal menghubungi server");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/admin/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchCategories();
        } catch (err) {}
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800">Manajemen Kategori</h2>
                <p className="text-gray-500 mt-1">Kelola kategori produk jualanmu di sini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Tambah/Edit */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Contoh: Laptop Gaming"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 w-full">
                                {editingId ? "Simpan Perubahan" : "Tambahkan"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setName(""); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-300">
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabel Kategori */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700">
                                <th className="p-4 font-semibold text-sm">ID</th>
                                <th className="p-4 font-semibold text-sm">Nama Kategori</th>
                                <th className="p-4 font-semibold text-sm">Slug</th>
                                <th className="p-4 font-semibold text-sm text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((cat: any) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-500">#{cat.id}</td>
                                    <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                                    <td className="p-4 text-gray-500">{cat.slug}</td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => { setEditingId(cat.id); setName(cat.name); }}
                                            className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada kategori.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
