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
import api from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { Textarea } from "../ui/textarea";
import { updateMenus } from "@/store/slices/orderSlice";
import { useDispatch } from "react-redux";
import { DialogClose } from "@radix-ui/react-dialog";

export function EditMenuModal({ data, which }: { data: any, id?: number ,which: "Hinzufuegen" | "Bearbeiten" }) {

	const [profile, setProfile] = useState(data);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const dispatch = useDispatch();

	const handleUpdate = async () => {
		try {
			await api.put(API_ROUTES.MENU_RESTAURANT + `/${data.id}`, { ...profile, img: selectedFile? selectedFile: null});
			toast.success("Speise wurde entfernet!")
			dispatch(updateMenus());
			// setProfile(initialData)
		} catch(error) {
			toast.error("Ein Fehler auftritt!")
		}
	}

	const handleAdd = async () => {
		console.log("Profile:", profile)
		try {
			await api.post(API_ROUTES.MENU_RESTAURANT, { ...profile, img: selectedFile? selectedFile: null});
			dispatch(updateMenus())
			toast.success("Speise wurde entfernet!")
			// setProfile(initialData)
		} catch(error) {
			toast.error("Ein Fehler auftritt!")
		}
	}

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="orangeColor">{ which }</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90%] overflow-auto">
        <DialogHeader>
          <DialogTitle>Artikel { which }</DialogTitle>
          <DialogDescription>
						
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
						<div className="flex flex-col space-y-2">
							<Label htmlFor="name">
								Name von dem Gericht
							</Label>
							<Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="preis">
								Preis
							</Label>
							<Input id="preis" value={profile.preis} onChange={(e) => setProfile({ ...profile, preis: parseFloat(e.target.value) || 0 })} />
						</div>
						<div className="flex flex-col space-y-2">
							<Label htmlFor="bes">
								Beschreibung
							</Label>
							<Textarea id="bes" value={profile.beschreibung} onChange={(e) => setProfile({ ...profile, beschreibung: e.target.value })} />
						</div>
						<div className="flex flex-col space-y-2">
								<Label htmlFor="img">Bild</Label>
								<Input
									id="img"
									type="file"
									accept="image/*"
									onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
									className="border rounded-lg p-2 mb-4"
								/>
						</div>
					</div>
        </div>
				<DialogFooter>
          <DialogClose asChild>
						<Button
							className="w-fit ml-auto" 
							variant="orangeColor"
							type="submit"
							onClick={() => {
								if(which === "Hinzufuegen") {
									handleAdd()
								} else {
									handleUpdate()
								}
							}}
						>
							Daten { which }
						</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
