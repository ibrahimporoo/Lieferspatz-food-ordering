"use client";
import React, { useEffect, useState } from 'react'

import { API_ROUTES } from '@/constants/enums'
import api from '@/lib/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Box from '@/components/shared/Box';
import { ReceivedRestaurant } from '@/constants/types'


const Restaurants = () => {

	const { user } = useSelector((state: RootState) => state.auth);

	const [restaurants, setRestaurants] = useState<ReceivedRestaurant[] | null>(null);
	const [openedRestaurants, setOpenedRestaurants] = useState<ReceivedRestaurant[] | null>(null);

	useEffect(() => {
		const fetchData = async () => {
      try {
        const { data } = await api.get(API_ROUTES.GET_RESTAURANTS);
        setRestaurants(data.data.restaurants);
				if(user) {
					const { data } = await api.get(API_ROUTES.GET_OPENED_RESTAURANTS);
					console.log("Opened Restaurants Data:", data); // Debugging
					setOpenedRestaurants(data.data.restaurants);
				}
      } catch(error) {
        console.error("Error fetching data:", error); // Debugging
      }
    };
    fetchData();
	}, [])

	return (
		<div className='py-32 container'>
			<div className="mb-7">
				<h2 className="text-blue-700 text-2xl md:text-3xl">
					Geöffnete Restaurants, die dir liefern koennen.
					<span className='bg-orangeColor mt-1 h-[2px] w-1/3 block'></span>
				</h2>
			</div>
			{
				<div className='space-y-4'>
					{
						(openedRestaurants && openedRestaurants.length > 0) ? (
							openedRestaurants?.map((restaurant) => (
								<Box key={restaurant.id} data={restaurant} />
							))
						) : (
							<div className='border-dashed mb-3 p-3 border-white border-2 rounded-md'>
								{
									user? <>
										<span className='text-orangeColor'>Geben Sie deine Adresse ein</span>
										<div className='mt-2'>
											<Link href={`/users/profile`}>
												<Button variant="orangeColor">Profile</Button>
											</Link>
										</div>
									</> : (
									<span className='text-orangeColor'>Du muesst dich anmelden und deine Adresse eingeben um die Restaurants zu zeigen.</span>
								)
								}
							</div>
						)
					}
				</div>
			}
			<div className="mb-10 mt-5">
				<h2 className="text-blue-700 text-2xl md:text-3xl">
					Unsere Lieblingsrestaurants
					<span className='bg-orangeColor mt-1 h-[2px] w-1/3 block'></span>
				</h2>
			</div>
			<div className='space-y-4'>
				{
					(restaurants && restaurants.length > 0) ? (
						restaurants?.map((restaurant) => (
							<Box key={restaurant.id} data={restaurant}/>
						))
					) : (
						<p>No restaurants found.</p>
					)
				}
			</div>
		</div>
	)
}

export default Restaurants