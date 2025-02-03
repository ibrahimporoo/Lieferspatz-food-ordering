"use client";

import { Modal } from "@/components/shared/Modal";
import { API_ROUTES } from "@/constants/enums"
import { ProfileType } from "@/constants/types";
import api from "@/lib/api"
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const Profile = () => {

	const [profile, setProfile] = useState<ProfileType | null>(null);
	const dispatch = useDispatch();
	const router = useRouter();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await api.get(API_ROUTES.PROFILE_USER);
				setProfile(data.data);
				if(!(data.status === "success")) {
					toast('Melde dich erst an!')
					router.push('/users/auth');
				}
			} catch(error: any) {
				if(error.status === 401) {
					toast('Ihre Sitzung wurde beendet!');
					dispatch(logoutUser());
					router.push('/users/auth');
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
						<h2 className="mb-2">User Profile:</h2>
						<div className="space-y-2">
							<div className="flex items-center gap-1">
								<p className="w-1/3">Vorname:</p>
								<p className="w-1/3">{profile.vorname}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Nachname:</p>
								<p className="w-1/3">{profile.nachname}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Email:</p>
								<p className="w-/3">{profile.email}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">Adresse:</p>
								<p className="w-/3">{profile.adresse ? profile.adresse : "-"}</p>
							</div>
							<div className="flex items-center gap-1">
								<p className="w-1/3">PLZ:</p>
								<p className="w-/3">{profile.plz ? profile.plz : "-"}</p>
							</div>
							<Modal profileData={profile} />
						</div>
					</>
				)
			}
		</div>
	)
}

export default Profile