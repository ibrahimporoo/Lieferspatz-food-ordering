"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { API_ROUTES } from "@/constants/enums";
import { RestaurantProfileType } from "@/constants/types";
import api from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

export function EditRestaurantModal({ profileData }: { profileData: RestaurantProfileType }) {

	const [profile, setProfile] = useState(profileData);

	const handleSubmit = async () => {
		try {
			const { data } = await api.put(API_ROUTES.PROFILE_RESTAURANT, profileData)
			if(data.status === 'success') {
				toast.success("Profil aktualisiert erfolgreich!")
			}
		} catch (error) {
			console.log(error)
		}
	}

	// Handle changes to the lieferradius array
	const handleLieferradiusChange = (index: number, newValue: string) => {
		setProfile((prev: any) => {
			const updatedLieferradius:string[] = [ ...prev.lieferradius ];
			updatedLieferradius[index] = newValue;
			return { ...prev, lieferradius: updatedLieferradius };
		});
	};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="orangeColor">Profile bearbeiten</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90%] overflow-auto">
        <DialogHeader>
          <DialogTitle>Profile bearbeiten</DialogTitle>
          <DialogDescription>
						
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="vorname">
								Name
							</Label>
							<Input id="vorname" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="nachname">
								Adresse
							</Label>
							<Input id="nachname" value={profile.adresse} onChange={(e) => setProfile({ ...profile, adresse: e.target.value })} />
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="adresse">
								Geld
							</Label>
							<Input id="adresse" value={profile.geld} onChange={(e) => setProfile({ ...profile, geld: e.target.value })} />
						</div>
					</div>
					{/* <div className="grid grid-cols-2">
						
					</div> */}
					<div className="flex flex-col space-y-2">
						<Label htmlFor="plz">
							PLZen
						</Label>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
						{
							profile.lieferradius.map((item, idx) => (
								<Label key={idx}>
									<Input
										type="number"
										value={item}
										onChange={(e) => handleLieferradiusChange(idx, e.target.value)}
										className="w-full p-2 border border-gray-300 rounded-md"
									/>
								</Label>
							))
						}
					</div>
					<div className="flex flex-col space-y-2">
						<Label htmlFor="plz">
							Oeffnungszeiten
						</Label>
						<div className="grid md:grid-cols-2 gap-2">
							{
								<Label>
									<p className="mb-2 text-orangeColor">Montag</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.mi_von }
												onChange={(e) => setProfile({ ...profile, mo_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.mi_bis }
												onChange={(e) => setProfile({ ...profile, mo_bis: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">DIENSTAG</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.di_von }
												onChange={(e) => setProfile({ ...profile, di_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.di_bis }
												onChange={(e) => setProfile({ ...profile, di_bis: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">Mittwoch</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.mi_von }
												onChange={(e) => setProfile({ ...profile, mi_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.mi_bis }
												onChange={(e) => setProfile({ ...profile, mi_bis: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">Donnerstag</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.do_von }
												onChange={(e) => setProfile({ ...profile, do_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.do_bis }
												onChange={(e) => setProfile({ ...profile, do_bis: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">Freitag</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.fr_von }
												onChange={(e) => setProfile({ ...profile, fr_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.fr_bis }
												onChange={(e) => setProfile({ ...profile, fr_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">Sonntag</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.so_von }
												onChange={(e) => setProfile({ ...profile, so_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.fr_bis }
												onChange={(e) => setProfile({ ...profile, fr_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
							{
								<Label>
									<p className="mb-2 text-orangeColor">Samstag</p>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<p className="mb-1">VON</p>
											<Input
												type="number"
												value={ profile.sa_von }
												onChange={(e) => setProfile({ ...profile, sa_von: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
										<div>
											<p className="mb-1">BIS</p>
											<Input
												type="number"
												value={ profile.sa_bis }
												onChange={(e) => setProfile({ ...profile, sa_bis: +e.target.value })}
												className="w-full p-2 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</Label>
							}
						</div>
					</div>
					{/* <div className="flex flex-col items-center space-y-4 md:flex-row space-x-3">
					</div> */}
        </div>
        <DialogFooter>
          <Button
						className="w-fit ml-auto" 
						variant="orangeColor"
						type="submit"
						onClick={handleSubmit}
					>
						Daten Speichern
					</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
