"use client";

import { useState, useMemo } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, Eye, EyeOff, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const addToast = useToastStore((s) => s.addToast);

    // Password strength
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthLabels = ["", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];
    const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== passwordConfirmation) {
            addToast({ type: "error", title: "Password tidak cocok", message: "Pastikan password dan konfirmasi sama." });
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/register", {
                name, email, password,
                password_confirmation: passwordConfirmation,
            });

            const token = response.data.access_token;
            localStorage.setItem("token", token);

            addToast({ type: "success", title: "Registrasi Berhasil! 🎉", message: "Selamat datang di TokoKita." });
            setTimeout(() => {
                window.location.href = "/orders";
            }, 800);
        } catch (error) {
            addToast({
                type: "error",
                title: "Registrasi Gagal",
                message: error.response?.data?.message || "Periksa kembali data Anda.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl flex bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
                {/* Left - Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 p-8 md:p-12 flex flex-col justify-center"
                >
                    <div className="max-w-sm mx-auto w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <UserPlus className="w-6 h-6 text-indigo-500" />
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Daftar Akun</h1>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">Buat akun gratis dan mulai belanja hari ini.</p>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" required minLength={8} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Strength Meter */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength >= i ? strengthColors[strength] : "bg-gray-200 dark:bg-gray-700"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-bold ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                                            {strengthLabels[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Konfirmasi Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="password" placeholder="Ketik ulang password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" required minLength={8} />
                                </div>
                            </div>

                            <label className="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-xs text-gray-500">
                                    Saya menyetujui <a href="#" className="text-indigo-600 font-bold hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-indigo-600 font-bold hover:underline">Kebijakan Privasi</a>
                                </span>
                            </label>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !agreed}
                                className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</> : "Daftar Sekarang"}
                            </motion.button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Masuk</Link>
                        </p>
                    </div>
                </motion.div>

                {/* Right - Branding */}
                <div className="hidden lg:flex flex-col justify-center flex-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                    <div className="absolute top-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="text-5xl mb-6">✨</div>
                        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                            Bergabung<br />Sekarang!
                        </h2>
                        <p className="text-white/70 leading-relaxed max-w-sm">
                            Dapatkan akses eksklusif ke promo, flash sale, dan penawaran terbaik. Daftar gratis — tidak perlu kartu kredit!
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                { icon: ShieldCheck, text: "Transaksi 100% aman" },
                                { icon: ShieldCheck, text: "Gratis ongkir untuk member baru" },
                                { icon: ShieldCheck, text: "Garansi uang kembali" },
                            ].map((feat) => (
                                <div key={feat.text} className="flex items-center gap-3">
                                    <feat.icon className="w-5 h-5 text-emerald-300" />
                                    <span className="text-sm text-white/80 font-medium">{feat.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
