import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types/products";
import {
    fetchProducts,
    fetchProductById,
    fetchProductsByIds,
    fetchKits,
} from "@/lib/products";

type AsyncState<T> = {
    data: T;
    loading: boolean;
    error: string | null;
};

function useAsync<T>(
    initial: T,
    fn: () => Promise<T>,
    deps: unknown[]
): AsyncState<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: initial,
        loading: true,
        error: null,
    });
    const cancelRef = useRef(false);

    useEffect(() => {
        cancelRef.current = false;
        setState((s) => ({ ...s, loading: true, error: null }));

        fn().then(
            (data) => {
                if (!cancelRef.current) {
                    setState({ data, loading: false, error: null });
                }
            },
            (err: unknown) => {
                if (!cancelRef.current) {
                    const msg =
                        err instanceof Error ? err.message : "Failed to load products.";
                    setState((s) => ({ ...s, loading: false, error: msg }));
                }
            }
        );

        return () => {
            cancelRef.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return state;
}

export function useProducts(): AsyncState<Product[]> {
    return useAsync<Product[]>([], fetchProducts, []);
}

export function useProduct(id: string | undefined): AsyncState<Product | null> {
    return useAsync<Product | null>(
        null,
        () => (id ? fetchProductById(id) : Promise.resolve(null)),
        [id]
    );
}

export function useProductsByIds(ids: string[]): AsyncState<Product[]> {
    // Stable dep: serialize ids so effect only re-runs when ids actually change
    const key = ids.join(",");
    return useAsync<Product[]>(
        [],
        () => fetchProductsByIds(ids),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
}

export function useKits(): AsyncState<Product[]> {
    return useAsync<Product[]>([], fetchKits, []);
}
