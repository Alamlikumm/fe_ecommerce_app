import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
}

interface CartState {
    items: CartItem[];
    addToCart: (product: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (product) =>
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                image_url: product.image_url || null,
                            },
                        ],
                    };
                }),
            removeFromCart: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                })),
            clearCart: () => set({ items: [] }),
            getTotalItems: () =>
                get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: "tokokita-cart",
        }
    )
);