"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shield, Truck, RotateCcw, Zap } from "lucide-react";

const slides = [
    {
        title: "Belanja Lebih Pintar",
        highlight: "& Hemat",
        subtitle: "Temukan jutaan produk berkualitas dengan harga terbaik. Nikmati gratis ongkir dan cashback setiap hari!",
        cta: "Mulai Belanja",
        gradient: "from-indigo-900 via-purple-900 to-indigo-950",
        blobColors: ["bg-indigo-500", "bg-purple-500", "bg-pink-500"],
    },
    {
        title: "Flash Sale",
        highlight: "Diskon Gila!",
        subtitle: "Jangan lewatkan promo terbatas hari ini. Diskon hingga 70% untuk produk pilihan!",
        cta: "Lihat Promo",
        gradient: "from-orange-900 via-red-900 to-pink-950",
        blobColors: ["bg-orange-500", "bg-red-500", "bg-yellow-500"],
    },
    {
        title: "Produk Baru",
        highlight: "Telah Hadir",
        subtitle: "Koleksi terbaru sudah menunggumu. Jadilah yang pertama memiliki produk trending!",
        cta: "Jelajahi",
        gradient: "from-emerald-900 via-teal-900 to-cyan-950",
        blobColors: ["bg-emerald-500", "bg-teal-500", "bg-cyan-500"],
    },
];

const trustBadges = [
    { icon: Shield, label: "100% Original" },
    { icon: Truck, label: "Gratis Ongkir" },
    { icon: RotateCcw, label: "Garansi 7 Hari" },
    { icon: Zap, label: "Pengiriman Cepat" },
];

export default function HeroBanner() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[current];

    return (
        <section className="relative overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`relative bg-gradient-to-br ${slide.gradient} text-white py-20 md:py-28 px-6 md:px-8`}
                >
                    {/* Blob Decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className={`absolute top-10 right-10 w-64 h-64 ${slide.blobColors[0]} rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob`} />
                        <div className={`absolute top-32 left-10 w-72 h-72 ${slide.blobColors[1]} rounded-full mix-blend-multiply filter blur-[80px] opacity-25 animate-blob animation-delay-2000`} />
                        <div className={`absolute -bottom-16 left-1/3 w-80 h-80 ${slide.blobColors[2]} rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-4000`} />
                    </div>

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            {/* Text Content */}
                            <motion.div
                                key={`text-${current}`}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="flex-1 text-center md:text-left"
                            >
                                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
                                    {slide.title}{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-pink-300 to-amber-300">
                                        {slide.highlight}
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-white/70 mb-8 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <motion.a
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                                    whileTap={{ scale: 0.95 }}
                                    href="#catalog"
                                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
                                >
                                    {slide.cta}
                                    <ChevronRight className="w-5 h-5" />
                                </motion.a>
                            </motion.div>

                            {/* Decorative Visual */}
                            <motion.div
                                key={`visual-${current}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="flex-1 hidden md:flex items-center justify-center"
                            >
                                <div className="relative w-80 h-80">
                                    <div className={`absolute inset-0 ${slide.blobColors[0]} rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob`} />
                                    <div className={`absolute inset-4 ${slide.blobColors[1]} rounded-full mix-blend-screen filter blur-2xl opacity-50 animate-blob animation-delay-2000`} />
                                    <div className={`absolute inset-8 ${slide.blobColors[2]} rounded-full mix-blend-screen filter blur-xl opacity-60 animate-blob animation-delay-4000`} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-8xl animate-float">🛍️</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex justify-center md:justify-start gap-2 mt-12">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-2 rounded-full transition-all duration-500 ${i === current ? "bg-white w-8" : "bg-white/30 w-2 hover:bg-white/50"}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Trust Badges Bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trustBadges.map((badge) => (
                            <div key={badge.label} className="flex items-center justify-center gap-2 text-sm">
                                <badge.icon className="w-4 h-4 text-indigo-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
