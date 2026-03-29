import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  productIds: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (productId) => {
        const current = get().productIds;
        if (current.includes(productId)) {
          return;
        }
        set({ productIds: [...current, productId].slice(0, 2) });
      },
      remove: (productId) => {
        set({ productIds: get().productIds.filter((id) => id !== productId) });
      },
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "chrono-compare-store",
    },
  ),
);
