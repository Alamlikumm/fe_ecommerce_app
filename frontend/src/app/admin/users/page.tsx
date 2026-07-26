"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "" });
    const addToast = useToastStore((s) => s.addToast);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
            else setError("Gagal memuat data pengguna");
        } catch {
            setError("Gagal terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const isConfirm = window.confirm(`Yakin ingin mengubah hak akses pengguna ini menjadi ${newRole.toUpperCase()}?`);
        if (!isConfirm) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();
            if (res.ok) {
                addToast({ type: "success", title: "Berhasil!", message: data.message });
                fetchUsers();
            } else {
                addToast({ type: "error", title: "Gagal", message: data.message || "Terjadi kesalahan" });
            }
        } catch {
            addToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal terhubung ke server" });
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak bisa dibatalkan.");
        if (!isConfirm) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                addToast({ type: "success", title: "Berhasil!", message: data.message });
                fetchUsers();
            } else {
                addToast({ type: "error", title: "Gagal", message: data.message || "Terjadi kesalahan" });
            }
        } catch {
            addToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal terhubung ke server" });
        }
    };

    const startEdit = (user: any) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email });
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await res.json();
            if (res.ok) {
                addToast({ type: "success", title: "Berhasil!", message: data.message });
                setEditingUser(null);
                fetchUsers();
            } else {
                addToast({ type: "error", title: "Gagal", message: data.message || "Email mungkin sudah digunakan" });
            }
        } catch {
            addToast({ type: "error", title: "Kesalahan Jaringan", message: "Gagal terhubung ke server" });
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manajemen Pengguna</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Atur siapa saja yang berhak menjadi Admin atau Pembeli Biasa, Edit, dan Hapus.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 font-bold border border-red-200 dark:border-red-800 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchUsers} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors">
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Modal Edit User */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Edit Pengguna</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={editForm.email} 
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button 
                                    type="button" 
                                    onClick={cancelEdit}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-colors"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">ID</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Nama</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Email</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Hak Akses</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Memuat data...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Belum ada pengguna.</td>
                                </tr>
                            ) : users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-5 font-black text-gray-500 dark:text-gray-400">#{user.id}</td>
                                    <td className="p-5 font-bold text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="p-5 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="p-5">
                                        {user.role === 'admin' ? (
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200 dark:border-red-700 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" onClick={() => handleRoleChange(user.id, user.role)} title="Klik untuk ubah pangkat">
                                                ADMIN
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => handleRoleChange(user.id, user.role)} title="Klik untuk ubah pangkat">
                                                USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right space-x-2">
                                        <button 
                                            onClick={() => startEdit(user)}
                                            className="px-4 py-2 rounded-xl font-bold text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-4 py-2 rounded-xl font-bold text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
