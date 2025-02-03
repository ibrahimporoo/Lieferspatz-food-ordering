import { ReceivedRestaurant } from '@/constants/types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const RestaurantCard = ({ data }: { data: ReceivedRestaurant }) => {

	return (
		<article className="rounded-xl border-2 border-white shadow-md">
			<div className="flex items-start gap-4 pt-6 pb-3 px-6 lg:px-8">
				<Image
					alt="partner-img"
					width={400}
					height={400}
					src={data.img_url}
					className="size-20 object-cover rounded-lg border"
				/>

				<div>
					<h3 className="font-medium text-orangeColor text-lg md:text-xl">
						{ data.name }
					</h3>

					<Link target='_blank' className='text-xs underline' href="https://www.google.com/maps/place/Ruhrorter+Str.,+Duisburg/@51.4499222,6.740337,17z/data=!3m1!4b1!4m6!3m5!1s0x47b8befe51b63029:0x6ff5c6dec5802a6b!8m2!3d51.4499222!4d6.740337!16s%2Fg%2F1vl5fw39?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D">
						{ data.adresse }
					</Link>

					<p className="text-sm mt-1">
						{ data.beschreibung }
					</p>

					<Link href={`/restaurants/${data.id}`} className="group text-sm mt-2 inline-flex items-center gap-1 font-medium text-blue-500">
						Speisen zeigen

						<span aria-hidden="true" className="block transition-all group-hover:ms-0.5 rtl:rotate-180">
							&rarr;
						</span>
					</Link>
					<div className='mt-3'>
						<p className='text-slate-400 mb-1'>Öffnungszeiten</p>
						<div className='grid grid-cols-1 sm:grid-cols-3 p-0 m-0 space-x-2'>
							<p><span className='text-xs'>Mo:</span> <span className='text-blue-300 text-xs'>{data.mo}</span> </p>
							<p><span className='text-xs'>DI:</span> <span className='text-blue-300 text-xs'>{data.di}</span> </p>
							<p><span className='text-xs'>Mi:</span> <span className='text-blue-300 text-xs'>{data.mi}</span> </p>
							<p><span className='text-xs'>Do:</span> <span className='text-blue-300 text-xs'>{data.do}</span> </p>
							<p><span className='text-xs'>Fr:</span> <span className='text-blue-300 text-xs'>{data.fr}</span> </p>
							<p><span className='text-xs'>SA:</span> <span className='text-blue-300 text-xs'>{data.sa}</span> </p>
							<p><span className='text-xs'>SO:</span> <span className='text-blue-300 text-xs'>{data.so}</span> </p>
						</div>
					</div>
				</div>
			</div>

			{/* <div className="flex justify-end">
				<strong
					className="-mb-[2px] -me-[2px] inline-flex items-center gap-1 rounded-ee-xl rounded-ss-xl bg-orangeColor px-3 py-1.5 text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
						/>
					</svg>

					<span className="text-[10px] font-medium sm:text-xs">Online!</span>
				</strong>
			</div> */}
		</article>
	)
}

export default RestaurantCard