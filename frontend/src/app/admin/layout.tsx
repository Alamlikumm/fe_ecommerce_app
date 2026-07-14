"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Cek token valid dan role admin
        fetch("http://localhost:8000/api/user", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.role === 'admin') {
                setIsAuthorized(true);
            } else {
                alert("Akses ditolak! Anda bukan Admin.");
                router.push("/");
            }
        })
        .catch(() => {
            router.push("/login");
        });
    }, [router]);

    if (!isAuthorized) {
        return <div className="min-h-screen flex items-center justify-center">Loading Admin Area...</div>;
    }

    const navLinks = [
        { name: "Statistik Dasbor", path: "/admin" },
        { name: "Data Pesanan", path: "/admin/orders" },
        { name: "Kategori", path: "/admin/categories" },
        { name: "Produk", path: "/admin/products" },
        { name: "Pengguna & Role", path: "/admin/users" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Admin Navbar */}
            <header className="bg-gray-900 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold tracking-widest text-blue-400">ADMIN PANEL</h1>
                            <nav className="hidden md:flex gap-4">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.path} 
                                        href={link.path}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/" className="px-4 py-2 bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">
                                Lihat Toko Publik
                            </Link>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    router.push("/login");
                                }}
                                className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
