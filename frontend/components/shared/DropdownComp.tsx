"use client";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AvatarComp from "./AvatarComp"
import { CircleUserIcon, LogOut } from "lucide-react"
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logoutRestaurant, logoutUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { RootState } from "@/store/store";

export function DropdownComp() {

  const { user, restaurant } = useSelector((state: RootState) => state.auth)

	const router = useRouter();
	const dispatch = useDispatch();

  console.log("USER:", user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center !p-0 rounded-full overflow-hidden">
          {
            user ? (
              <AvatarComp img={user.logo_url} />
            ) : restaurant && (
              <AvatarComp img={restaurant.logo_url} />
            )
          }
				</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent  className="w-48 left-0">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            if(user) {
              router.push('/users/profile')
            } else if (restaurant) {
              router.push('/restaurants/profile')
            } else {
              toast.error("Melden Sie sich bei uns zuerst an!")
            }
          }}>
              Profile
            <DropdownMenuShortcut>
							<CircleUserIcon />
						</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          if(user) {
            dispatch(logoutUser())
          } else if (restaurant) {
            dispatch(logoutRestaurant())
          } else {
            dispatch(logoutUser())
            dispatch(logoutRestaurant())
          }
					toast.success("Erfolgreich haben Sie sich abgemeldet!")
					router.push('/')
				}}>
          Abmelden
          <DropdownMenuShortcut>
						<LogOut />
					</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
