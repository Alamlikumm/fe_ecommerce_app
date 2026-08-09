"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    const fetchCategories = async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setCategories(await res.json());
            else setError("Gagal mengambil data kategori.");
        } catch {
            setError("Gagal menghubungi server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const token = localStorage.getItem("token");

        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/categories`;

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
        } catch {
            setError("Gagal menghubungi server");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCategories();
                addToast({ type: "success", title: "Kategori dihapus!", message: "" });
            }
        } catch { }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manajemen Kategori</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola kategori produk jualanmu di sini.</p>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 font-bold">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Tambah/Edit */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kategori</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 rounded-lg p-2.5 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Contoh: Laptop Gaming"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 w-full">
                                {editingId ? "Simpan Perubahan" : "Tambahkan"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setName(""); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabel Kategori */}
                <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                <th className="p-4 font-semibold text-sm">ID</th>
                                <th className="p-4 font-semibold text-sm">Nama Kategori</th>
                                <th className="p-4 font-semibold text-sm">Slug</th>
                                <th className="p-4 font-semibold text-sm text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Memuat data...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada kategori.</td>
                                </tr>
                            ) : (
                                categories.map((cat: { id: number; name: string; slug: string }) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                        <td className="p-4 text-gray-500 dark:text-gray-400">#{cat.id}</td>
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{cat.name}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{cat.slug}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => { setEditingId(cat.id); setName(cat.name); }}
                                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
