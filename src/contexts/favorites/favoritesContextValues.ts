import { createContext } from 'react';

export type FavoritesState = {
    ids: string[];
    loading: boolean;
};

export type FavoritesActions = {
    toggle: (productId: string) => Promise<void>;
};

export const FavoritesStateContext = createContext<FavoritesState>({ ids: [], loading: true });
export const FavoritesActionsContext = createContext<FavoritesActions | null>(null);
