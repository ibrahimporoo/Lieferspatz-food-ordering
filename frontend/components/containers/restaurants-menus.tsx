'use client';

import { updateMenus, updateOrders } from '@/store/slices/orderSlice';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { Button } from '../ui/button';
import api from '@/lib/api';
import { API_ROUTES } from '@/constants/enums';
import toast from 'react-hot-toast';
import { EditMenuModal } from '../shared/EditMenuModal';
import { useRouter } from 'next/navigation';

const RestaurantMenus = () => {

	const router = useRouter()
	const { restaurant } = useSelector((state: RootState) => state.auth);

	if(!restaurant) {
		router.back()
		toast.error("Melden Sie sich zuerst als Restaurant")
	}

	const { menus } = useSelector((state: RootState) => state.cart);
	const initialData = {
		name: "",
		preis: 0,
		beschreibung: "",
		img: "",
		image_data: "",
		filename: ""
	}
	const [menuData, setMenuData] = useState(initialData)

	const dispatch = useDispatch()

	useEffect(() => {
		if(restaurant) {
			dispatch(updateMenus())
			// console.log(menus?.items, "===== items")
			// //  "http://127.0.0.1:5000/static/img/margheritapizza.jpeg"
		}
	}, [])

	const handleDelete = async (id: number) => {
		try {
			await api.delete(API_ROUTES.MENU_RESTAURANT + `/${id}`);
			toast.success("Speise wurde entfernet!")
			dispatch(updateMenus())
		} catch(error) {
			toast.error("Ein Fehler auftritt!")
		}
	}


	return (
		<div className='py-28 container'>
			<div className='my-2'>
				{/* <Button variant={"orangeColor"}>Hinzufuegen</Button> */}
				<EditMenuModal data={menuData} which='Hinzufuegen' />
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
				{
					(menus?.items && menus.items.length > 0) && (
						menus.items.map((item: any) => (
							// <OrderCard key={idx} dataProp={order} />
							<div key={item.id} className='border-2 border-orangeColor rounded-md p-2 h-52'>
								<div className="flex gap-2">
									<div className='flex justify-center size-32'>
										<Image className='w-full h-full' src={item.img_url} width={600} height={600} alt='' />
									</div>
									<div>
										<h2>{item.name}</h2>
										<p>{item.preis}</p>
										<p>{item.beschreibung}</p>
									</div>
								</div>
								<div className='grid grid-cols-3 gap-2 mt-2'>
									<EditMenuModal data={item} which='Bearbeiten' />
									<Button	onClick={() => handleDelete(item.id)}
									variant={"destructive"}>Entfernen</Button>
								</div>
							</div>
						))
					)
				}
			</div>
		</div>
	)
}

export default RestaurantMenus;