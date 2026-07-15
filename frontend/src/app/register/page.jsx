"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (password !== passwordConfirmation) {
            setMessage("Password dan konfirmasi password tidak cocok.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/register", {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            const token = response.data.access_token;
            localStorage.setItem("token", token);

            setMessage("Registrasi Berhasil! Mengalihkan...");

            // Normally a new user is not an admin, so redirect to home
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Registrasi gagal, periksa kembali data Anda.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="glass p-10 rounded-[2rem] shadow-2xl border border-white/50 w-full max-w-md text-black relative overflow-hidden"
            >
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2 text-center text-gray-900 flex items-center justify-center gap-3">
                        <UserPlus className="w-8 h-8 text-indigo-500" />
                        Daftar Akun
                    </h1>
                    <p className="text-center text-gray-500 mb-8 font-medium">Buat akun untuk mulai berbelanja.</p>

                    <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm transition-all text-gray-800 font-medium"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm transition-all text-gray-800 font-medium"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm transition-all text-gray-800 font-medium"
                            required
                            minLength={8}
                        />
                        <input
                            type="password"
                            placeholder="Konfirmasi Password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none backdrop-blur-sm transition-all text-gray-800 font-medium"
                            required
                            minLength={8}
                        />
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold p-4 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all mt-2 flex items-center justify-center"
                        >
                            {loading ? "Memproses..." : "Daftar Sekarang"}
                        </motion.button>
                    </form>
                    
                    {message && (
                        <p className={`mt-6 text-center text-sm font-bold ${message.includes("Berhasil") ? "text-green-500" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}

                    <div className="mt-8 text-center text-sm font-medium text-gray-600">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
