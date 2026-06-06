import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type WishlistState = {
  ids: string[];
  loading: boolean;
};

const initialState: WishlistState = {
  ids: [],
  loading: true,
};

// Guarda los productos favoritos del usuario.
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistIds: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
    },
    clearWishlist: (state) => {
      state.ids = [];
      state.loading = false;
    },
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { clearWishlist, setWishlistIds, setWishlistLoading } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
