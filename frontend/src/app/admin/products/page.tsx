/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Package, Pencil, Trash2, Layers } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { getImageUrl } from "@/lib/utils";

interface Variant {
    id?: number;
    name: string;
    type: string;
    value: string;
    price_adjustment: number;
    stock: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ name: "", category_id: "", price: "", stock: "", description: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Variants
    const [variants, setVariants] = useState<Variant[]>([]);
    const [showVariants, setShowVariants] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
    const [variantForm, setVariantForm] = useState<Variant>({ name: "", type: "", value: "", price_adjustment: 0, stock: 0 });
    const [savingVariant, setSavingVariant] = useState(false);

    const addToast = useToastStore((s) => s.addToast);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?all=1`);
            if (res.ok) setProducts(await res.json());
        } catch {}
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`, { headers });
            if (res.ok) setCategories(await res.json());
        } catch {}
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const openModal = (product: any | null = null) => {
        setError("");
        setImageFile(null);
        setVariants([]);
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                category_id: product.category_id,
                price: product.price,
                stock: product.stock,
                description: product.description || "",
            });
            loadVariants(product.id);
        } else {
            setEditingId(null);
            setFormData({ name: "", category_id: "", price: "", stock: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const loadVariants = async (productId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}/variants`, { headers });
            if (res.ok) setVariants(await res.json());
        } catch {}
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("category_id", formData.category_id);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        payload.append("description", formData.description);
        if (imageFile) payload.append("image", imageFile);

        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/products`;

            if (editingId) payload.append("_method", "PUT");

            const res = await fetch(url, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: payload,
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
                addToast({ type: "success", title: editingId ? "Produk diupdate!" : "Produk ditambahkan!", message: "" });
            } else {
                const data = await res.json();
                setError(data.message || "Gagal menyimpan produk");
            }
        } catch {
            setError("Gagal menghubungi server");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus produk ini secara permanen?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { fetchProducts(); addToast({ type: "success", title: "Produk dihapus!", message: "" }); }
        } catch {}
    };

    // Variant CRUD
    const saveVariant = async () => {
        if (!editingId) return;
        setSavingVariant(true);
        try {
            const url = editingVariant?.id
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${editingId}/variants/${editingVariant.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${editingId}/variants`;
            const method = editingVariant?.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(variantForm),
            });

            if (res.ok) {
                loadVariants(editingId);
                setEditingVariant(null);
                setVariantForm({ name: "", type: "", value: "", price_adjustment: 0, stock: 0 });
                addToast({ type: "success", title: editingVariant ? "Varian diupdate!" : "Varian ditambahkan!", message: "" });
            }
        } catch {}
        setSavingVariant(false);
    };

    const deleteVariant = async (variantId: number) => {
        if (!editingId || !confirm("Hapus varian ini?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${editingId}/variants/${variantId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { loadVariants(editingId); addToast({ type: "success", title: "Varian dihapus!", message: "" }); }
        } catch {}
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Manajemen Produk</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Tambah, ubah, atau hapus barang daganganmu.</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Tambah Produk
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-[11px] font-black tracking-widest">
                            <tr>
                                <th className="p-4">Foto</th>
                                <th className="p-4">Nama Produk</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4">Stok</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={getImageUrl(p.image_url)} alt={p.name}
                                                className="w-full h-full object-cover"
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{p.description}</p>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{p.category?.name || '-'}</td>
                                    <td className="p-4 font-bold text-orange-500">Rp {new Intl.NumberFormat('id-ID').format(p.price)}</td>
                                    <td className="p-4">
                                        <span className={`font-bold ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {p.stock} pcs
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openModal(p)} className="text-indigo-600 hover:text-indigo-800 font-bold mr-4 text-xs">Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-medium">Belum ada produk. Tambahkan sekarang!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                    {editingId ? "Edit Produk" : "Tambah Produk Baru"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6">
                                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 font-bold">{error}</div>}

                                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama Produk</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Kategori</label>
                                            <select required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all">
                                                <option value="" disabled>Pilih...</option>
                                                {categories.map((c: { id: number; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Harga (Rp)</label>
                                            <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Stok</label>
                                            <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Foto</label>
                                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Deskripsi</label>
                                        <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all resize-none" />
                                    </div>
                                </form>

                                {/* Variants Section */}
                                {editingId && (
                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-indigo-500" />
                                                Varian Produk
                                            </h4>
                                            <button
                                                onClick={() => { setEditingVariant(null); setVariantForm({ name: "", type: "", value: "", price_adjustment: 0, stock: 0 }); setShowVariants(true); }}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Tambah Varian
                                            </button>
                                        </div>

                                        {variants.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                Belum ada varian untuk produk ini.
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {variants.map((v) => (
                                                    <div key={v.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md">{v.type}</span>
                                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{v.value}</span>
                                                            {v.price_adjustment !== 0 && (
                                                                <span className={`text-xs font-bold ${v.price_adjustment > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                    {v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">Stok: {v.stock}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => { setEditingVariant(v); setVariantForm(v); setShowVariants(true); }}
                                                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500 transition-colors">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => deleteVariant(v.id!)}
                                                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variant Form Modal */}
                                        <AnimatePresence>
                                            {showVariants && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
                                                    onClick={() => setShowVariants(false)}
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.95 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0.95 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl"
                                                    >
                                                        <h4 className="font-black text-gray-900 dark:text-white mb-4">
                                                            {editingVariant ? "Edit Varian" : "Tambah Varian Baru"}
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipe</label>
                                                                    <input type="text" placeholder="Warna, Ukuran" value={variantForm.type}
                                                                        onChange={(e) => setVariantForm({...variantForm, type: e.target.value})}
                                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nilai</label>
                                                                    <input type="text" placeholder="Merah, XL" value={variantForm.value}
                                                                        onChange={(e) => setVariantForm({...variantForm, value: e.target.value})}
                                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 mb-1">Nama Varian</label>
                                                                <input type="text" placeholder="Merah - XL" value={variantForm.name}
                                                                    onChange={(e) => setVariantForm({...variantForm, name: e.target.value})}
                                                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Penyesuaian Harga</label>
                                                                    <input type="number" value={variantForm.price_adjustment}
                                                                        onChange={(e) => setVariantForm({...variantForm, price_adjustment: Number(e.target.value)})}
                                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Stok</label>
                                                                    <input type="number" min="0" value={variantForm.stock}
                                                                        onChange={(e) => setVariantForm({...variantForm, stock: Number(e.target.value)})}
                                                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 mt-6">
                                                            <button onClick={() => setShowVariants(false)}
                                                                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                Batal
                                                            </button>
                                                            <button onClick={saveVariant} disabled={savingVariant}
                                                                className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                                                                {savingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : editingVariant ? "Simpan" : "Tambah"}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" form="productForm"
                                        className="flex-1 btn-primary py-3 text-sm">
                                        {editingId ? "Simpan Perubahan" : "Tambahkan Produk"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}