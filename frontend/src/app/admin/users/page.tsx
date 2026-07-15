"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "" });

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/api/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const isConfirm = confirm(`Yakin ingin mengubah hak akses pengguna ini menjadi ${newRole.toUpperCase()}?`);
        if (!isConfirm) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchUsers();
            } else {
                alert("Gagal: " + (data.message || "Terjadi kesalahan"));
            }
        } catch (err) {
            alert("Gagal terhubung ke server");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const isConfirm = confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak bisa dibatalkan.");
        if (!isConfirm) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchUsers();
            } else {
                alert("Gagal: " + (data.message || "Terjadi kesalahan"));
            }
        } catch (err) {
            alert("Gagal terhubung ke server");
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
            const res = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setEditingUser(null);
                fetchUsers();
            } else {
                alert("Gagal: " + (data.message || "Terjadi kesalahan (Mungkin email sudah digunakan)"));
            }
        } catch (err) {
            alert("Gagal terhubung ke server");
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Manajemen Pengguna</h2>
                    <p className="text-gray-500 mt-1">Atur siapa saja yang berhak menjadi Admin atau Pembeli Biasa, Edit, dan Hapus.</p>
                </div>
            </div>

            {/* Modal Edit User */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-2xl font-bold mb-4">Edit Pengguna</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    value={editForm.email} 
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button 
                                    type="button" 
                                    onClick={cancelEdit}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">ID</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Nama</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Email</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Hak Akses</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-5 font-black text-gray-500">#{user.id}</td>
                                    <td className="p-5 font-bold text-gray-900">{user.name}</td>
                                    <td className="p-5 text-gray-600">{user.email}</td>
                                    <td className="p-5">
                                        {user.role === 'admin' ? (
                                            <span className="bg-red-100 text-red-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200 cursor-pointer hover:bg-red-200 transition-colors" onClick={() => handleRoleChange(user.id, user.role)} title="Klik untuk ubah pangkat">
                                                ADMIN
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleRoleChange(user.id, user.role)} title="Klik untuk ubah pangkat">
                                                USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right space-x-2">
                                        <button 
                                            onClick={() => startEdit(user)}
                                            className="px-4 py-2 rounded-lg font-bold text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-4 py-2 rounded-lg font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
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
