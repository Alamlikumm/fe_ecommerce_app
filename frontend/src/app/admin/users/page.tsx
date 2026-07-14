"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

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

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800">Manajemen Pengguna</h2>
                <p className="text-gray-500 mt-1">Atur siapa saja yang berhak menjadi Admin atau Pembeli Biasa.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">ID</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Nama</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Email</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Terdaftar Sejak</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider">Hak Akses Saat Ini</th>
                                <th className="p-5 font-semibold text-sm uppercase tracking-wider text-right">Ubah Pangkat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-5 font-black text-gray-500">#{user.id}</td>
                                    <td className="p-5 font-bold text-gray-900">{user.name}</td>
                                    <td className="p-5 text-gray-600">{user.email}</td>
                                    <td className="p-5 text-gray-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="p-5">
                                        {user.role === 'admin' ? (
                                            <span className="bg-red-100 text-red-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-200">
                                                ADMIN
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200">
                                                USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => handleRoleChange(user.id, user.role)}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm ${
                                                user.role === 'admin' 
                                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            {user.role === 'admin' ? 'Cabut Akses Admin' : 'Jadikan Admin'}
                                        </button>
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
