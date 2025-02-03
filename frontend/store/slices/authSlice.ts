import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { User, ProfileType, RestaurantProfileType } from "@/constants/types"

export interface AuthState {
  user: User | null | any;
  restaurant: RestaurantProfileType | null | any;
}

// let initialState: AuthState = {
//   user: null,
//   restaurant: null,
// };

const initialState: AuthState = {
  user: localStorage.getItem("storedUser")
    ? JSON.parse(localStorage.getItem("storedUser")!)
    : null,
  restaurant: localStorage.getItem("storedRestaurant")
    ? JSON.parse(localStorage.getItem("storedRestaurant")!)
    : null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.restaurant = action.payload.restaurant;
      // localStorage.setItem("storedAuth", JSON.stringify(action.payload));
    },
    loginUser: (state, action: PayloadAction<ProfileType>) => {
      state.user = action.payload;
      localStorage.setItem("storedUser", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("storedUser");
    },
    loginRestaurant: (state, action: PayloadAction<RestaurantProfileType>) => {
      state.restaurant = action.payload;
      localStorage.setItem("storedRestaurant", JSON.stringify(action.payload));
    },
    logoutRestaurant: (state) => {
      state.restaurant = null;
      localStorage.removeItem("storedRestaurant");
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setAuth,
  loginUser,
  logoutUser,
  loginRestaurant,
  logoutRestaurant,
} = authSlice.actions;

export default authSlice.reducer