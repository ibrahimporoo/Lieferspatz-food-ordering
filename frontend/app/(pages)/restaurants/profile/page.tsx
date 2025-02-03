"use client";

import { EditRestaurantModal } from "@/components/shared/EditRestauratModal";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import { API_ROUTES } from "@/constants/enums"
import { RestaurantProfileType } from "@/constants/types";
import api from "@/lib/api"
import { logoutUser } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const RestaurantProfile = () => {

	const router = useRouter()

	const { restaurant } = useSelector((state: RootState) => state.auth);

	if(!restaurant) {
		router.back();
		toast.error("Du musst dich erstmal als Restaurant registrieren..")
	}

	const [profile, setProfile] = useState<RestaurantProfileType | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await api.get(API_ROUTES.PROFILE_RESTAURANT);
				setProfile(data.data);
				if(!(data.status === "success")) {
					toast('Melde dich erst an!')
				}
			} catch(error: any) {
				if(error.status === 401) {
					toast('Ihre Sitzung wurde beendet!');
					dispatch(logoutUser());
					router.push('/restaurant/auth');
				} else {
					console.log("Ein Fehler ist aufgeteret!")
				}
			}
		}

		fetchData();
	}, [])

	return (
		<div className="py-28 container">
			{
				profile && (
					<>
						<h2 className="mb-2">Willkomenn unser Kunde { profile.name }</h2>
						<div className="space-y-2">
							<div className="flex items-center gap-1">
								<p className="w-1/3">Email:</p>
								<p className="w-1/3">{profile.email}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Adresse:</p>
								<p className="w-1/3">{profile.adresse}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Beschreibung:</p>
								<p className="w-/3">{profile.beschreibung}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Geld:</p>
								<p className="w-/3">{profile.geld}</p>
							</div>
							<div className="">
								<p>PLZen :-</p>
								<div className="grid grid-cols-4 gap-2">
									{
									Object.entries(profile.lieferradius).map(([key, value], idx) => (
										<Label key={idx}>
											{/* {key} */}
											<Input readOnly value={value} />
										</Label>
									))
									}
								</div>
							</div>
							<EditRestaurantModal profileData={profile} />
						</div>
					</>
				)
			}
		</div>
	)
}

export default RestaurantProfile