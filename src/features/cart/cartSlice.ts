import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  category: string;
  brand: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: number;
  size: string;
  stock: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

type AddItemPayload = Omit<CartItem, 'quantity'> & {
  quantity?: number;
};

const loadSavedCart = (): CartItem[] => {
  const savedCart = localStorage.getItem('lumiere_cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

const initialState: CartState = {
  items: loadSavedCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<AddItemPayload>) {
      // esto guarda el carrito para poder usarlo en checkout
      const quantityToAdd = Math.max(1, action.payload.quantity ?? 1);
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity += quantityToAdd;
      } else {
        state.items.push({ ...action.payload, quantity: quantityToAdd });
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      // elimina item del carrito
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: number; quantity: number }>) {
      // cambia la cantidad desde los botones del carrito
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(i => i.id !== action.payload.id);
        return;
      }
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
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

export const { addItem, removeItem, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
