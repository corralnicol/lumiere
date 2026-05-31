import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      // esto guarda el carrito para poder usarlo en checkout
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      // elimina item del carrito
      state.items = state.items.filter(i => i.productId !== action.payload);
    },
    clearCart(state) {
      // limpia el carrito cuando la orden ya se creó
      state.items = [];
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      // reemplaza todo el carrito
      state.items = action.payload;
    },
  },
});

export const { addItem, removeItem, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
