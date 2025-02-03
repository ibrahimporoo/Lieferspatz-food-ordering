"use client";
import Image from "next/image"
import { Menu, Order } from "@/constants/types"
import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { CardModal } from "./shared/CardModal";
import { updateBaskets } from "@/store/slices/orderSlice";
import { API_ROUTES } from "@/constants/enums";
import api from "@/lib/api";

const MenuCard = ({ menu, restaurantId }: { menu: Menu, restaurantId: string }) => {

	const dispatch = useDispatch();
	const [orderData, setOrderData] = useState<Order>({
		resto_id: Number(restaurantId),
    anmerkung: "",
    total: menu.preis,
    items: [
			{
				item_id: menu.id,
				name: menu.name,
				preis: menu.preis,
				anzahl: 1
			}
    ]
	});

	// useEffect(() => {
  //   dispatch(updateOrders());
  // }, [dispatch]);

	// console.log("MENU:", menu);

	const handleAddOrder = async () => {
		try {
			const {data} = await api.put(API_ROUTES.BASKETS, orderData);
			if(data.status === 'success') {
				dispatch(updateBaskets())
				toast.success('Ihre Bestellung wurde sicher gesendet!')
			}
			else {
				toast.error('Ein Fehler wurde geschehen!')
			}
		} catch(error: any) {
			console.error(error)
			toast.error('Der Server antwortet nicht!')
			// toast.error(error.response.data.data.message)
		}
	}


	return (
		<article className="flex shadow-lg border rounded-md transition hover:shadow-xl overflow-hidden">

			<div className="hidden sm:block sm:basis-56">
				<Image
					alt={menu.name}
					width={400}
					height={400}
					src={menu.img_url}
					className="aspect-square h-full w-full object-cover flex-1"
				/>
			</div>

			<div className="flex flex-1 flex-col justify-between">
				<div className="border-s border-gray-900/10 p-4 sm:border-l-transparent sm:p-6">
					<a href="#">
						<h3 className="font-semibold uppercase text-orangeColor">
							{menu.name}
						</h3>
					</a>

					<p className="mt-2 line-clamp-3 text-sm/relaxed">
						{menu.beschreibung}
					</p>
					<span className="block mt-2">${menu.preis}</span>
				</div>

				<div className="sm:flex sm:items-end sm:justify-end">
					<CardModal handleAddOrder={handleAddOrder}
						orderData={orderData} setOrderData={setOrderData}
					/>
				</div>
			</div>
		</article>
	)
}

export default MenuCard