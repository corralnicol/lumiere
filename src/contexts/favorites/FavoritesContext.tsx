import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchFavorites, toggleFavorite as toggleFavoriteLib } from '@/lib/favorites';

type FavoritesState = {
    ids: string[];
    loading: boolean;
};

type FavoritesActions = {
    toggle: (productId: string) => Promise<void>;
};

const FavoritesStateContext = createContext<FavoritesState>({ ids: [], loading: true });
const FavoritesActionsContext = createContext<FavoritesActions | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [ids, setIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const favs = await fetchFavorites(userId);
            setIds(favs);
        } catch {
            setIds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        supabase.auth.getClaims().then(({ data }) => {
            if (data?.claims?.sub) {
                load(data.claims.sub);
            } else {
                setIds([]);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIds([]);
                setLoading(false);
            } else if (session?.user?.id) {
                load(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, [load]);

    const toggle = useCallback(async (productId: string) => {
        const prev = ids;
        const isIn = prev.includes(productId);
        setIds(isIn ? prev.filter(id => id !== productId) : [...prev, productId]);
        try {
            const updated = await toggleFavoriteLib(productId);
            setIds(updated);
        } catch (err) {
            setIds(prev);
            throw err;
        }
    }, [ids]);

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

export const useFavoritesState = () => useContext(FavoritesStateContext);
export const useFavoritesActions = () => useContext(FavoritesActionsContext);
