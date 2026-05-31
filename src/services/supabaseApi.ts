import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Nico: estas variables deben quedar en .env cuando conectemos el proyecto real.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Aquí centralicé las llamadas REST a Supabase para no repetir fetch en cada página.
const baseQuery = fetchBaseQuery({
  baseUrl: `${SUPABASE_URL}/rest/v1/`,
  prepareHeaders: (headers) => {
    if (SUPABASE_ANON_KEY) {
      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const supabaseApi = createApi({
  reducerPath: 'supabaseApi',
  baseQuery,
  tagTypes: ['Profile', 'Order'],
  endpoints: (builder) => ({
    // Perfil: nombre y foto del usuario comprador.
    getProfile: builder.query<any, string>({
      query: (userId) => `profiles?id=eq.${userId}&select=*`,
      providesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),
    updateProfile: builder.mutation<any, { userId: string; full_name?: string; avatar_url?: string }>({
      query: ({ userId, ...patch }) => ({
        url: `profiles?id=eq.${userId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Profile', id: userId }],
    }),
    // Órdenes: se crean al confirmar pago y se leen en el overview.
    createOrder: builder.mutation<any, { userId: string; items: any[] }>({
      query: ({ userId, items }) => ({
        url: 'orders',
        method: 'POST',
        body: {
          user_id: userId,
          items: items,
          status: 'pending',
        },
      }),
      invalidatesTags: ['Order'],
    }),
    getOrdersByUser: builder.query<any[], string>({
      query: (userId) => `orders?user_id=eq.${userId}&select=*`,
      providesTags: ['Order'],
    }),
    // Limpia el carrito que queda guardado en profiles después de crear la orden.
    clearCartInProfile: builder.mutation<any, string>({
      query: (userId) => ({
        url: `profiles?id=eq.${userId}`,
        method: 'PATCH',
        body: { cart: null },
      }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateOrderMutation,
  useGetOrdersByUserQuery,
  useClearCartInProfileMutation,
} = supabaseApi;
