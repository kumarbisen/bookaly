import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';

interface Provider {
    _id: string;
    name: string;
    // Add other relevant fields if needed for display in favorites list
}

interface FavoriteState {
    favorites: Provider[];
    addFavorite: (provider: Provider) => void;
    removeFavorite: (providerId: string) => void;
    isFavorite: (providerId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
    persist(
        (set, get) => ({
            favorites: [],
            addFavorite: (provider) => {
                const { favorites } = get();
                if (!favorites.some((p) => p._id === provider._id)) {
                    set({ favorites: [...favorites, provider] });
                }
            },
            removeFavorite: (providerId) => {
                const { favorites } = get();
                set({ favorites: favorites.filter((p) => p._id !== providerId) });
            },
            isFavorite: (providerId) => {
                const { favorites } = get();
                return favorites.some((p) => p._id === providerId);
            },
        }),
        {
            name: 'favorite-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
