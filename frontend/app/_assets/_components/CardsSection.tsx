import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const CardsSection = () => {
	return (
	<section className="py-10">
		<div className="text-center mb-10">
			<p className="mb-4">Finde die besten Restaurants nach Bewertung</p>
			{/* <h2 className="text-blue-700 text-4xl">Beste Restaurants mit bestem Rating in deiner Naeher</h2> */}
			<h2 className="text-blue-700 text-4xl">Deine Bestellung <span className="text-orangeColor">startet</span> von hier!</h2>
		</div>
		<div className="grid gap-4 grid-cols-1 md:grid-cols-3">

			<article className="overflow-hidden rounded-lg bg-transparent shadow-md border">
				<Image
					alt="restaurants Foto"
					width={1200}
					height={1200}
					src="https://images.unsplash.com/photo-1717322738687-237189b80ac9?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					className="h-48 w-full object-cover"
					// className="h-48 w-full object-contain"
				/>

				<div className="p-4 sm:p-6">
					<a href="#">
						<h3 className="text-md md:text-lg font-medium text-orangeColor">
							Lorem ipsum dolor sit amet consectetur adipisicing elit.
						</h3>
					</a>

					<p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
						pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
						mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
						dignissimos. Molestias explicabo corporis voluptatem?
					</p>

					<Link href="/restaurants" className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-orangeColor">
						Mehr anzeigen

						<span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
							&rarr;
						</span>
					</Link>
				</div>
			</article>
			<article className="overflow-hidden rounded-lg bg-transparent shadow-md border">
				<Image
					alt="restaurants Foto"
					width={1200}
					height={1200}
					src="https://images.unsplash.com/photo-1717322738687-237189b80ac9?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					className="h-48 w-full object-cover"
					// className="h-48 w-full object-contain"
				/>

				<div className="p-4 sm:p-6">
					<a href="#">
						<h3 className="text-md md:text-lg font-medium text-orangeColor">
							Lorem ipsum dolor sit amet consectetur adipisicing elit.
						</h3>
					</a>

					<p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
						pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
						mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
						dignissimos. Molestias explicabo corporis voluptatem?
					</p>

					<a href="#" className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-orangeColor">
						Mehr anzeigen

						<span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
							&rarr;
						</span>
					</a>
				</div>
			</article>
			<article className="overflow-hidden rounded-lg bg-transparent shadow-md border">
				<Image
					alt="restaurants Foto"
					width={1200}
					height={1200}
					src="https://images.unsplash.com/photo-1717322738687-237189b80ac9?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					className="h-48 w-full object-cover"
					// className="h-48 w-full object-contain"
				/>

				<div className="p-4 sm:p-6">
					<a href="#">
						<h3 className="text-md md:text-lg font-medium text-orangeColor">
							Lorem ipsum dolor sit amet consectetur adipisicing elit.
						</h3>
					</a>

					<p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
						pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
						mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
						dignissimos. Molestias explicabo corporis voluptatem?
					</p>

					<a href="#" className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-orangeColor">
						Mehr anzeigen

						<span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
							&rarr;
						</span>
					</a>
				</div>
			</article>

		</div>

		<div className="flex justify-center mt-10">
			<Link href="/restaurants">
				<Button variant="orangeColor" className="rounded-full inline-flex group gap-1">
					Mehr Anzeigen 
					<span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
						&rarr;
					</span>
				</Button>
			</Link>
		</div>
	</section>
	)
}

export default CardsSection