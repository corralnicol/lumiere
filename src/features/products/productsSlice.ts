import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface ProductsState {
  list: Product[];
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  list: [],
  selectedProduct: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      // Cami/Sofi: cuando conecten el catálogo real, pueden guardar la lista aquí.
      state.list = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      // Sirve para sumar productos nuevos sin reemplazar todo el catálogo.
      state.list.push(action.payload);
    },
    removeProduct(state, action: PayloadAction<string>) {
      // Elimina por id y limpia la selección si era ese mismo producto.
      state.list = state.list.filter(p => p.id !== action.payload);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
    },
    setSelectedProduct(state, action: PayloadAction<Product>) {
      // Guarda el producto abierto en detalle, por si otra vista lo necesita.
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct(state) {
      // Lo dejamos vacío al salir del detalle.
      state.selectedProduct = null;
    },
  },
});

export const {
  setProducts,
  addProduct,
  removeProduct,
  setSelectedProduct,
  clearSelectedProduct,
} = productsSlice.actions;
export default productsSlice.reducer;
