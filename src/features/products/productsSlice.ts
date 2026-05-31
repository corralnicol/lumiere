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
      // aquí cargo el catálogo completo
      state.list = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      // agrega un producto al listado 
      state.list.push(action.payload);
    },
    removeProduct(state, action: PayloadAction<string>) {
      // elimina por id
      state.list = state.list.filter(p => p.id !== action.payload);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
    },
    setSelectedProduct(state, action: PayloadAction<Product>) {
      // guarda el producto que el usuario está viendo
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct(state) {
      // limpia el producto seleccionado
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
