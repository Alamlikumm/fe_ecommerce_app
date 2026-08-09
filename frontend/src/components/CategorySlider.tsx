"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Laptop, Shirt, Home, Dumbbell, Sparkles, Utensils, BookOpen, Gamepad2, Grid3X3 } from "lucide-react";

const defaultIcons: Record<string, React.ReactNode> = {
    "Elektronik": <Laptop className="w-5 h-5" />,
    "Fashion": <Shirt className="w-5 h-5" />,
    "Rumah Tangga": <Home className="w-5 h-5" />,
    "Olahraga": <Dumbbell className="w-5 h-5" />,
    "Kecantikan": <Sparkles className="w-5 h-5" />,
    "Makanan": <Utensils className="w-5 h-5" />,
    "Buku": <BookOpen className="w-5 h-5" />,
    "Gaming": <Gamepad2 className="w-5 h-5" />,
};

interface CategorySliderProps {
    categories: { id: number | string; name: string }[];
    activeId: string;
    onSelect: (id: string) => void;
}

export default function CategorySlider({ categories, activeId, onSelect }: CategorySliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const amount = direction === "left" ? -200 : 200;
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

    const allCategories = [{ id: "", name: "Semua" }, ...categories];

    return (
        <div className="relative group">
            {/* Left Arrow */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Scrollable Area */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1"
            >
                {allCategories.map((cat) => {
                    const isActive = activeId === (cat.id === "" ? "" : String(cat.id));
                    const icon = cat.name === "Semua"
                        ? <Grid3X3 className="w-5 h-5" />
                        : defaultIcons[cat.name] || <Grid3X3 className="w-5 h-5" />;

                    return (
                        <motion.button
                            key={cat.id ?? "all"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(cat.id === "" ? "" : String(cat.id))}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap border transition-all duration-300 flex-shrink-0
                                ${isActive
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                                }`}
                        >
                            {icon}
                            {cat.name}
                        </motion.button>
                    );
                })}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
    );
}
