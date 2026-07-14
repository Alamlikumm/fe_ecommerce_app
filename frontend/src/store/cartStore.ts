import { create } from "zustand";

interface CartItem {
    id: number;
    name: String;
    price: number;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    addToCart: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id)
        if (existingItem) {
            return {
                items: state.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            };
        }
        return {
            items: [...state.items, { ...product, quantity: 1, image_url: product.image_url }]
        }
    }),
    removeFromCart: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
    })),
    updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)
    })),
    clearCart: () => set({ items: [] }),
}));