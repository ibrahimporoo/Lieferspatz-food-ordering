import api from "@/lib/api";
import { AppDispatch } from "../store";
import { Order } from "@/constants/types";
import { setOrders } from "../slices/orderSlice";

export const updateOrders = () => async (dispatch: AppDispatch) => {
  const { data } = await api.get(process.env.NEXT_PUBLIC_DATABASE_URL + "/orders")
	dispatch(setOrders(data.data.orders))
};

export const addOrder = (order: Order) => async (dispatch: AppDispatch) => {
	await api.post(process.env.NEXT_PUBLIC_DATABASE_URL + "/baskets", JSON.stringify(order))
	dispatch(updateOrders());
};

// const fetchUserById = createAsyncThunk(
//   'users/fetchByIdStatus',
//   async (userId: number, thunkAPI) => {
//     const response = await userAPI.fetchById(userId)
//     return response.data
//   },
// )

// export const addOrder = (order: Order) => async (dispatch: AppDispatch) => {
// 	await api.post(process.env.NEXT_PUBLIC_DATABASE_URL + "/baskets", order)
// 	dispatch(updateOrders());
// };

// export const deleteMaterial =
//   (material: RecievedMaterial) => (dispatch: AppDispatch) => {
//     fetch(API_URL + "materials/" + material._id, {
//       method: "DELETE",
//     })
//       .then(() => dispatch(updateMaterials()))
//       .catch((error) => console.log(error));
//   };

// export const editMaterial =
//   (material: RecievedMaterial) => (dispatch: AppDispatch) => {
//     fetch(API_URL + "materials/" + material._id, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ material: material }),
//     })
//       .then(() => dispatch(updateMaterials()))
//       .catch((error) => console.log(error));
//   };