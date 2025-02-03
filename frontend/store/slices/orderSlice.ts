import { API_ROUTES } from '@/constants/enums';
import { BasketItem, Order } from '@/constants/types';
import api from '@/lib/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface OrderState {
  orders: Array<Order>,
  baskets: Array<BasketItem>,
  menus: any
}

const initialState: OrderState = {
  orders: [],
  baskets: [],
  menus: null
};

// First, create the thunk
export const updateOrders = createAsyncThunk(
  'orders/updateOrders',
  async () => {
    try {
      const {data} = await api.get(API_ROUTES.ORDERS);
      console.log("DATA Orders:", data.data.orders)
      return data.data.orders;
    } catch (error: any) {
      console.error(error)
    }
  },
)

export const updateBaskets = createAsyncThunk(
  'orders/updateBaskets',
  async () => {
    try {
      const {data} = await api.get(API_ROUTES.BASKETS);
      console.log("DATA Baskets from order slice:", data.data.baskets)
      return data.data.baskets;
    } catch (error: any) {
      console.error(error)
    }
  },
)

export const updateMenus = createAsyncThunk(
  'orders/updateMenus',
  async () => {
    try {
      const { data } = await api.get(API_ROUTES.MENU_RESTAURANT);
      console.log("DATA Baskets from order slice:", data.data)
      return data.data;
    } catch (error: any) {
      console.error(error)
    }
  },
)

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Array<BasketItem>>) => {
      state.orders = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(updateOrders.fulfilled, (state, action) => {
      state.orders = action.payload
    }),
    builder.addCase(updateBaskets.fulfilled, (state, action) => {
      state.baskets = action.payload
    }),
    builder.addCase(updateMenus.fulfilled, (state, action) => {
      state.menus = action.payload
    })
  },
});

export const {
  setOrders
} = orderSlice.actions;

export default orderSlice.reducer