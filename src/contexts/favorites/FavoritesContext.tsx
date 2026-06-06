import { useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchFavorites, toggleFavorite as toggleFavoriteLib } from '@/lib/favorites';
import {
    FavoritesActionsContext,
    FavoritesStateContext,
    type FavoritesActions,
} from './favoritesContextValues';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearWishlist, setWishlistIds, setWishlistLoading } from '@/store/slices/wishlistSlice';

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const ids = useAppSelector((state) => state.wishlist.ids);
    const loading = useAppSelector((state) => state.wishlist.loading);

    const load = useCallback(async (userId: string) => {
        dispatch(setWishlistLoading(true));
        try {
            const favs = await fetchFavorites(userId);
            dispatch(setWishlistIds(favs));
        } catch {
            dispatch(setWishlistIds([]));
        } finally {
            dispatch(setWishlistLoading(false));
        }
    }, [dispatch]);

    useEffect(() => {
        supabase.auth.getClaims().then(({ data }) => {
            if (data?.claims?.sub) {
                load(data.claims.sub);
            } else {
                dispatch(clearWishlist());
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                dispatch(clearWishlist());
            } else if (session?.user?.id) {
                load(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch, load]);

    const toggle = useCallback(async (productId: string) => {
        const prev = ids;
        const isIn = prev.includes(productId);
        dispatch(setWishlistIds(isIn ? prev.filter(id => id !== productId) : [...prev, productId]));
        try {
            const updated = await toggleFavoriteLib(productId);
            dispatch(setWishlistIds(updated));
        } catch (err) {
            dispatch(setWishlistIds(prev));
            throw err;
        }
    }, [dispatch, ids]);

    const state = useMemo(() => ({ ids, loading }), [ids, loading]);
    const actions = useMemo<FavoritesActions>(() => ({ toggle }), [toggle]);

    return (
        <FavoritesStateContext.Provider value={state}>
            <FavoritesActionsContext.Provider value={actions}>
                {children}
            </FavoritesActionsContext.Provider>
        </FavoritesStateContext.Provider>
    );
}
