import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, FilterState } from '@/types';

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    priceRange: [0, 5000],
    brands: [],
    componentTypes: [],
    sortBy: 'best-match',
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateFilters(state, action: PayloadAction<Partial<FilterState>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const { setProducts, setLoading, setError, updateFilters, resetFilters } =
  productsSlice.actions;
export default productsSlice.reducer;
