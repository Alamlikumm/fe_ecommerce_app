"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Globe, Share2, MessageCircle, Hash, Shield, Truck, RotateCcw, Headphones } from "lucide-react";

const footerLinks = {
    tentang: [
        { label: "Tentang TokoKita", href: "#" },
        { label: "Karir", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Kebijakan Privasi", href: "#" },
        { label: "Syarat & Ketentuan", href: "#" },
    ],
    bantuan: [
        { label: "Pusat Bantuan", href: "#" },
        { label: "Cara Belanja", href: "#" },
        { label: "Cara Pembayaran", href: "#" },
        { label: "Pengiriman", href: "#" },
        { label: "Pengembalian", href: "#" },
    ],
    layanan: [
        { label: "TokoKita Care", href: "#" },
        { label: "Jual di TokoKita", href: "#" },
        { label: "Affiliate Program", href: "#" },
        { label: "Promo Hari Ini", href: "#" },
        { label: "Flash Sale", href: "#" },
    ],
};

const paymentMethods = [
    "BCA", "Mandiri", "BNI", "BRI", "GoPay", "OVO", "DANA", "ShopeePay",
];

const trustFeatures = [
    { icon: Shield, label: "100% Original" },
    { icon: Truck, label: "Gratis Ongkir" },
    { icon: RotateCcw, label: "Garansi 7 Hari" },
    { icon: Headphones, label: "CS 24/7" },
];

export default function Footer() {
    return (
        <footer className="relative bg-gray-900 text-gray-300 overflow-hidden">
            {/* Trust Bar */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {trustFeatures.map((feat) => (
                            <div key={feat.label} className="flex items-center gap-3 group">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                    <feat.icon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="font-bold text-sm text-white">{feat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="text-3xl font-black tracking-tighter">
                            <span className="text-indigo-400">Toko</span>
                            <span className="text-orange-400">Kita</span>
                        </Link>
                        <p className="mt-4 text-gray-400 leading-relaxed max-w-sm">
                            Platform belanja online terpercaya dengan jutaan produk berkualitas.
                            Belanja mudah, aman, dan nyaman hanya di TokoKita.
                        </p>

                        {/* Newsletter */}
                        <div className="mt-6">
                            <p className="text-sm font-bold text-white mb-3">Dapatkan promo eksklusif</p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        placeholder="Email kamu..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent placeholder:text-gray-500 text-white"
                                    />
                                </div>
                                <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="flex gap-3 mt-6">
                            {[Globe, Share2, MessageCircle, Hash].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 group">
                                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">Metode Pembayaran:</p>
                        <div className="flex flex-wrap gap-2">
                            {paymentMethods.map((method) => (
                                <span key={method} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-bold text-gray-400 border border-gray-700">
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} TokoKita. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /> Indonesia
                            <span className="mx-2">•</span>
                            <Phone className="w-3 h-3" /> 0800-123-4567
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
