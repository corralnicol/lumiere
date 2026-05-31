import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface ProductsState {
  list: Product[];
}

const initialState: ProductsState = {
  list: [],
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
    },
  },
});

export const { setProducts, addProduct, removeProduct } = productsSlice.actions;
export default productsSlice.reducer;
