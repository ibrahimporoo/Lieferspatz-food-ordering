"use client";

import Image from "next/image";
import ctaImg from "../../_assets/_imgs/cta-1.jpg"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store/store";

const CTA = () => {

	const { user, restaurant } = useSelector((state: RootState) => state.auth)
	const router = useRouter();
	
	return (
		<section className="overflow-hidden min-h-screen sm:grid sm:grid-cols-2 pt-20 pb-20">
			<div className="flex items-center py-8 md:py-12 lg:py-24">
				<div className="mx-auto pe-2 max-w-xl text-center md:ltr::text-left rtl:sm:text-right">
					<h2 className="text-3xl mb-2 font-bold text-blue-700 md:text-4xl">
						{/* Bestelle Essen und mehr */}
						Finde Restaurants in deiner Nähe und bestelle einfach.
						{/* <span className="text-orangeColor">Was dich geniesst.</span> */}
					</h2>

					<p className="text-sm front-semibold">
						Entdecke eine Vielzahl von Küchen und lass dir dein Lieblingsessen bequem nach Hause liefern.
					</p>

					{/* <p className="text-sm mt-5 md:block">
						Restaurants und Geschäfte, die zu dir in kurzer Zeit liefern koennen
					</p> */}

					<div className="mt-4 md:mt-8">
						<Button variant="orangeColor"
							onClick={() => {
								if(user || restaurant) {
									router.push("/restaurants")
								} else {
									router.push("/users/auth")
									toast("melde dich zuerst an um zu bestellen!", {
										position: "bottom-right"
									})
								}
							}}
						>
							Jetzt bestellen
						</Button>
					</div>
				</div>
			</div>

			<Image
				src={ctaImg}
				width={1200}
				height={1200}
				alt="CTA-Banner"
				className="h-56 w-full object-cover sm:h-full rounded-lg"
			/>
		</section>
	)
}

export default CTA;