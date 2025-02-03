'use client';

import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import DataCard from "../cards/DataCard";
import { useEffect, useState } from "react";
import { updateBaskets, updateOrders } from "@/store/slices/orderSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "@/lib/socket";


const OrdersPage = () => {

	const [SocketOrders, setSocketOrders] = useState<string[]>([]);

	const router = useRouter()

	const { baskets, orders } = useSelector((state: RootState) => state.cart);
	const { user, restaurant } = useSelector((state: RootState) => state.auth);

	const dispatch = useDispatch();

	if(!restaurant && !user) {
		router.back();
		toast.error("Du musst dich erstmal registrieren..");
	}

	useEffect(() => {
			if(restaurant && restaurant.access_token) {
				const socket = connectSocket(restaurant.access_token);
				socket.on("new_order", (data) => {
						console.log("New order received:", data);
						setSocketOrders((prev) => [...prev, data.message]); // Add order to state
				});
				return () => {
					disconnectSocket();
				};
			}
	}, []);

	useEffect(() => {
		if(user) {
			dispatch(updateBaskets())
		}
		dispatch(updateOrders())
	}, []);

	return (
		<>
			<div>
				{
					(baskets && baskets.length > 0) && (
						<>
							<h2 className="mb-4 text-xl text-orangeColor">Ihre Bestellungen</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
								{
									baskets.map((basket) => (
										<DataCard key={basket.id} dataProp={basket} />
									))
								}
							</div>
						</>
					)
				}
			</div>
			<div className="mt-8">
				<h2 className="mb-4 text-xl text-orangeColor">Ihre gesendeten Bestellungen</h2>
				{
					(orders && orders.length > 0) && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
							{	orders.map((order) => (
								<DataCard key={order.id} dataProp={order} />
							))}
						</div>
					)
				}
			</div>
		</>
	)
}

export default OrdersPage