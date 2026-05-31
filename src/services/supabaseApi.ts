import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Nico aqui reemplaza todo con los url y la key de supabase que hagas
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// baseQuery con fetch.
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
    // Profile
    getProfile: builder.query<any, string>({
      query: (userId) => `profiles?id=eq.${userId}&select=*`,
      providesTags: (result, error, arg) => [{ type: 'Profile', id: arg }],
    }),
    updateProfile: builder.mutation<any, { userId: string; name?: string; avatarUrl?: string }>({
      query: ({ userId, ...patch }) => ({
        url: `profiles?id=eq.${userId}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Profile', id: userId }],
    }),
    // Order
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
    // clear cart in profile
    clearCartInProfile: builder.mutation<any, string>({
      query: (userId) => ({
        url: `profiles?id=eq.${userId}`,
        method: 'PATCH',
        body: { cart: null },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Profile', id: arg }],
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
