import { Variant } from "@/app/admin/product/type";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


export type CartItemClient = {
    variant: Variant;
    quantity: number;
    productName: string;
    productId: number;
    productImage: string;
}

type CartState = {
    items: CartItemClient[];
    isServerMode: boolean; // false = guest/local, true = synced with backend
};


type CartActions = {
    setServerMode: (v: boolean) => void;

    // dùng cho render chung
    setCart: (items: CartItemClient[]) => void;

    // add item (guest OR server)
    addItemGuest: (item: CartItemClient) => void;
    decreaseItemQuantity: (variantId: number) => void;
    removeItemGuest: (variantId: number) => void;

    // helpers cho merge
    getForMergePayload: () => { variantId: number; quantity: number, productId: number, productName: string, productImage: string }[];
    clearGuest: () => void;
    
};


export const useCartStore = create<CartState & CartActions>()(
    devtools(
        persist(
            (set, get) => ({
                items: [],
                isServerMode: false,
                setServerMode: (v: boolean) => set({ isServerMode: v }),
                setCart: (items: CartItemClient[]) => set({ items }),
                addItemGuest: (item) => {
                    const items = get().items.slice();
                    const idx = items.findIndex((i) => i.variant.id === item.variant.id);
                    if (idx !== -1) {
                        items[idx].quantity += item.quantity;
                    } else {
                        items.push(item);
                    }
                    set({ items });
                },

                decreaseItemQuantity: (variantId) => {
                    let items = get().items.slice();
                    const idx = items.findIndex((i) => i.variant.id === variantId);
                    if (idx !== -1) {
                        items[idx].quantity -= 1;
                        if (items[idx].quantity <= 0) {
                            items.splice(idx, 1);
                        }
                    }
                    set({ items });
                },

                removeItemGuest: (variantId) => {
                    const items = get().items.filter((i) => i.variant.id !== variantId);
                    set({ items });
                },

                getForMergePayload: () => {
                    return get().items.map((i) => ({
                        variantId: i.variant.id,
                        quantity: i.quantity,
                        productId: i.productId,
                        productName: i.productName,
                        productImage: i.productImage,
                    }));
                },

                clearGuest: () => set({ items: [] }),

            }),
            {
                name: "cart-storage", // key trong localStorage
                partialize: (state) => ({
                    items: state.items,
                    isServerMode: state.isServerMode,
                }),
            }
        )
    )
);

