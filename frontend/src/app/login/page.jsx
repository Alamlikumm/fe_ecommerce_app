/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const addToast = useToastStore((s) => s.addToast);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/login", { email, password });
            const token = response.data.access_token;
            const role = response.data.role;
            localStorage.setItem("token", token);

            addToast({ type: "success", title: "Login Berhasil! 🎉", message: "Selamat datang kembali." });

            setTimeout(() => {
                if (role === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
            }, 800);
        } catch (error) {
            addToast({
                type: "error",
                title: "Login Gagal",
                message: error.response?.data?.message || "Email atau password salah.",
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl flex bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
                {/* Left - Branding */}
                <div className="hidden lg:flex flex-col justify-center flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                    <div className="absolute top-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="text-5xl mb-6">🛍️</div>
                        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                            Selamat Datang<br />Kembali!
                        </h2>
                        <p className="text-white/70 leading-relaxed max-w-sm">
                            Masuk ke akunmu dan lanjutkan belanja produk berkualitas dengan harga terbaik di TokoKita.
                        </p>

                        <div className="flex items-center gap-4 mt-10 pt-10 border-t border-white/10">
                            {[
                                { num: "10K+", label: "Produk" },
                                { num: "5K+", label: "Pelanggan" },
                                { num: "99%", label: "Puas" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-xl font-black text-white">{stat.num}</p>
                                    <p className="text-xs text-white/50">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right - Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 p-8 md:p-12 flex flex-col justify-center"
                >
                    <div className="max-w-sm mx-auto w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <LogIn className="w-6 h-6 text-indigo-500" />
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Masuk</h1>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">Masukkan email dan password akunmu.</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="text-xs text-gray-500 font-medium">Ingat saya</span>
                                </label>
                                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Lupa Password?</a>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
                                ) : (
                                    "Masuk"
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 font-medium">atau</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Social Login (UI only) */}
                        <div className="flex gap-3">
                            <button type="button" onClick={() => {
                                const { useToastStore } = require("@/store/toastStore");
                                useToastStore.getState().addToast({ type: "info", title: "Segera Hadir", message: "Fitur login dengan Google masih dalam tahap pengembangan." });
                            }} className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                            <button type="button" onClick={() => {
                                const { useToastStore } = require("@/store/toastStore");
                                useToastStore.getState().addToast({ type: "info", title: "Segera Hadir", message: "Fitur login dengan Facebook masih dalam tahap pengembangan." });
                            }} className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </button>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Belum punya akun?{" "}
                            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}