"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Package, FolderOpen, ShoppingBag, Users, LogOut, ChevronLeft, ChevronRight, Store, Bell } from "lucide-react";

const navLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Pesanan", path: "/admin/orders", icon: ShoppingBag },
    { name: "Kategori", path: "/admin/categories", icon: FolderOpen },
    { name: "Produk", path: "/admin/products", icon: Package },
    { name: "Pengguna", path: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userName, setUserName] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.role === "admin") {
                    setIsAuthorized(true);
                    setUserName(data.name || "Admin");
                } else {
                    router.push("/");
                }
            })
            .catch(() => router.push("/login"));
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Memuat Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 260 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:flex flex-col bg-gray-950 text-white flex-shrink-0 sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden border-r border-gray-800"
            >
                {/* Brand */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Store className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-black tracking-tight">Admin Panel</p>
                                    <p className="text-[10px] text-gray-500">TokoKita</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800/70"
                                }`}
                            >
                                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="whitespace-nowrap overflow-hidden"
                                        >
                                            {link.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Tooltip for collapsed */}
                                {collapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                        {link.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-gray-800">
                    <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="min-w-0"
                                >
                                    <p className="text-sm font-bold truncate">{userName}</p>
                                    <p className="text-[10px] text-gray-500">Super Admin</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-40 px-2 py-2">
                <div className="flex justify-around">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
                                    isActive ? "text-indigo-400" : "text-gray-500"
                                }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold">{link.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950/50">
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-[64px] z-30">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white">
                            {navLinks.find((l) => l.path === pathname)?.name || "Admin"}
                        </h2>
                        <p className="text-xs text-gray-400">
                            Selamat datang, {userName}! 👋
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Store className="w-3.5 h-3.5" />
                            Lihat Toko
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/login");
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
