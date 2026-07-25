import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
    ids: number[];
    setIds: (ids: number[]) => void;
    addId: (id: number) => void;
    removeId: (id: number) => void;
    isWishlisted: (id: number) => boolean;
    toggle: (id: number) => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            ids: [],
            setIds: (ids) => set({ ids }),
            addId: (id) =>
                set((state) => ({
                    ids: state.ids.includes(id) ? state.ids : [...state.ids, id],
                })),
            removeId: (id) =>
                set((state) => ({
                    ids: state.ids.filter((wid) => wid !== id),
                })),
            isWishlisted: (id) => get().ids.includes(id),
            toggle: (id) => {
                const state = get();
                if (state.ids.includes(id)) {
                    set({ ids: state.ids.filter((wid) => wid !== id) });
                } else {
                    set({ ids: [...state.ids, id] });
                }
            },
        }),
        {
            name: "tokokita-wishlist",
        }
    )
);
