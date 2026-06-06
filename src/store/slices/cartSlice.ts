import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@/contexts/cartContextValues';

type CartState = {
  items: CartItem[];
  ready: boolean;
};

const initialState: CartState = {
  items: [],
  ready: false,
};

// Guarda el carrito global y si ya terminó de cargar.
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    setCartReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload;
    },
    addCartItem: (
      state,
      action: PayloadAction<{ product: Product; quantity: number }>,
    ) => {
      const amount = Math.max(1, Math.floor(action.payload.quantity));
      const existingItem = state.items.find((item) => item.id === action.payload.product.id);

      if (existingItem) {
        existingItem.quantity += amount;
        return;
      }

      state.items.push({ ...action.payload.product, quantity: amount });
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateCartQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload.productId);
        return;
      }

      const item = state.items.find((cartItem) => cartItem.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addCartItem,
  clearCart,
  removeCartItem,
  setCart,
  setCartReady,
  updateCartQuantity,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
