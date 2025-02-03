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
import { ProfileType } from "@/constants/types";
import { useState } from "react";

export function Modal({ profileData }: { profileData: ProfileType }) {

	const [profile, setProfile] = useState(profileData);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="orangeColor">Profile bearbeiten</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile bearbeiten</DialogTitle>
          <DialogDescription>
						Nehmen Sie hier Änderungen an Ihrem Profil vor. Klicken Sie auf „Speichern“, wenn Sie fertig sind.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="vorname">
              Vorname
            </Label>
            <Input id="vorname" value={profile.vorname} onChange={(e) => setProfile({ ...profile, vorname: e.target.value })} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="nachname">
              Nachname
            </Label>
            <Input id="nachname" value={profile.nachname} onChange={(e) => setProfile({ ...profile, nachname: e.target.value })} />
          </div>
					<div className="flex flex-col space-y-2">
						<Label htmlFor="adresse">
							Adresse
						</Label>
						<Input id="adresse" value={profile.adresse} onChange={(e) => setProfile({ ...profile, adresse: e.target.value })} />
					</div>
					<div className="flex flex-col space-y-2">
						<Label htmlFor="plz">
							PLZ
						</Label>
						<Input id="plz" value={profile.plz} onChange={(e) => setProfile({ ...profile, plz: e.target.value })} />
					</div>
					{/* <div className="flex flex-col items-center space-y-4 md:flex-row space-x-3">
					</div> */}
        </div>
        <DialogFooter>
          <Button className="w-fit ml-auto" variant="orangeColor" type="submit">
						Daten Speichern
					</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
