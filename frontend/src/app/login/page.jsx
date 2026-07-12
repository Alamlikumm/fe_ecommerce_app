"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("Loading...");
        try {
            const response = await api.post("/login", {
                email: email,
                password: password
            });

            const token = response.data.access_token;
            localStorage.setItem("token", token);

            setMessage("Login Berhasil! Token Tersimpan.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Kredensial Salah / Login Gagal");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-black">
                <h1 className="text-2xl font-bold mb-6 text-center text-black-600">Login Toko</h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded outline-black-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded outline-black-500"
                        required
                    />
                    <button type="submit" className="bg-black-600 text-black font-bold p-2 rounded hover:bg-blue-700 transition">
                        Masuk
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-sm font-semibold text-red-500">{message}</p>}
            </div>
        </div>
    );
}