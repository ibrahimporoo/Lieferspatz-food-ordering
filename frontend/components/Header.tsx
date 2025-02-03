"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { CircleDollarSign, Handshake, ShoppingBag, SquareMenuIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DropdownComp } from "./shared/DropdownComp";
import { useEffect } from "react";
import api from "@/lib/api";
import { API_ROUTES } from "@/constants/enums";
import toast from "react-hot-toast";
import { loginRestaurant, loginUser, logoutRestaurant, logoutUser, setAuth } from "@/store/slices/authSlice";
import { updateBaskets } from "@/store/slices/orderSlice";

const Header = () => {

	const { user, restaurant } = useSelector((state: RootState) => state.auth);
	const { baskets } = useSelector((state: RootState) => state.cart);

	const dispatch = useDispatch();

	// dispatch(setAuth({
	// 	user: JSON.parse(localStorage.getItem("storedUser")!),
	// 	restaurant: JSON.parse(localStorage.getItem("storedRestaurant")!)
	// }))

	useEffect(() => {

		const fetchData = async () => {
			if(user && user.access_token) {
				try {
					const { data } = await api.get(API_ROUTES.PROFILE_USER);
					dispatch(updateBaskets())
					if(data.status === "success") {
						dispatch(loginUser({ ...data.data, access_token: user.access_token || null }))
					}
				} catch(error: any) {
					if(error.status === 401 || error.status === 404) {
						toast('Ihre Sitzung wurde beendet!');
						dispatch(logoutUser());
					}
				}
			} else {
				if(restaurant && restaurant.access_token) {
					try {
						const { data } = await api.get(API_ROUTES.PROFILE_RESTAURANT);
						if(data.status === "success") {
							console.log(data)
							dispatch(loginRestaurant({ ...data.data, access_token: restaurant.access_token || null }))
						}
					} catch(error: any) {
						if(error.status === 401) {
							toast('Ihre Sitzung wurde beendet!');
							dispatch(logoutRestaurant());
						}
					}
				}
			}
		}

		fetchData();

	}, [])

	return (
		<header className="fixed top-0 z-50 w-full pt-2 pb-2 bg-background">
			<div className="container">
				<div className="flex h-20 items-center justify-between">

					<Link href={'/'} className="flex items-center gap-2 duration-200 hover:scale-105">
						<Image
							src={"/logo.png"}
							width={130}
							height={130}
							alt="logo"
							className="size-10 object-cover"
						/>
						<span className="text-white text-lg italic">
							<span className="text-orangeColor">Liefer</span>spatz
						</span>
					</Link>

					<div className="flex items-center md:relative space-x-6">

						{
							(user) ? (
								<>
									<Link href="" className="flex gap-1">
										<CircleDollarSign />
										${ user?.geld }
									</Link>
									<div className="relative">
										<Link href="/users/orders" className="flex items-center gap-2 p-2 text-sm">
											<ShoppingBag />
											Bestellungen
										</Link>
										{
											(baskets && baskets.length > 0) && (
												<span className="bg-orangeColor size-7 flex items-center justify-center text-[10px] rounded-full absolute -top-1/3 -left-[8px]">
													{ baskets.length }
												</span>
											)
										}
									</div>
									<div className="cursor-pointer shadow-md border rounded-full">
										<DropdownComp />
									</div>
								</>
							) : (restaurant) ? (
								<>
									<div className="relative flex items-center gap-2">
										<Link href="/restaurants/menu" className="flex items-center gap-2 p-2 text-sm">
											<SquareMenuIcon />
											Menu
										</Link>
										<Link href="/restaurants/orders" className="flex items-center gap-2 p-2 text-sm">
											<ShoppingBag />
											Bestellungen
										</Link>
									</div>
									<div className="cursor-pointer shadow-md border rounded-full">
										<DropdownComp />
									</div>
								</>
							) : (
								<>
									<Link href={'/restaurants/auth'} className="flex items-center gap-1 duration-300 text-sm hover:text-orangeColor">
										<Handshake />
										Partner werden
									</Link>
									<Link href="/users/auth">
										<Button variant="orangeColor">
											Anmelden
										</Button>
									</Link>
								</>
							)
						}

					</div>

				</div>
			</div>
		</header>
	);
}

export default Header;