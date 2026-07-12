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
            items: [...state.items, { ...product, quantity: 1 }]
        }
    }),
    clearCart: () => set({ items: [] }),
}));