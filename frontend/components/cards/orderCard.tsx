"use client";

import { API_ROUTES } from "@/constants/enums";
import { Order } from "@/constants/types";
import api from "@/lib/api";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// import Image from 'next/image'
// import { Button } from '../ui/button';
// import api from '@/lib/api';
// import { API_ROUTES } from '@/constants/enums';
// import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
// import { updateBaskets, updateOrders } from '@/store/slices/orderSlice';

const OrderCard = ({ dataProp }: { dataProp: Order }) => {

	const router = useRouter()

	const { restaurant } = useSelector((state: RootState) => state.auth);

	if(!restaurant) {
		router.back();
		toast.error("Du musst dich erstmal als Restaurant registrieren..")
	}

	const dispatch = useDispatch();

	const handleConfirm = async () => {
		try {
			const { data } = await api.put(API_ROUTES.ORDERS+`/${dataProp.id}`, {
				action: "bestätigen"
			})
			console.log("DATA", data)
			toast.success(`Bestellung wurde abgelehnt!`)
			dispatch(updateOrders())
		} catch(error) {
			console.log(error);
			toast.error("Ein Fehler ist aufgeteren in ORDER CARD COMP")
		}
	}

	const handleSend = async () => {
		try {
			const { data } = await api.put(API_ROUTES.ORDERS+`/${dataProp.id}`, {
				action: "absenden"
			})
			console.log("DATA", data)
			toast.success(`Bestellung wurde abgelehnt!`)
			dispatch(updateOrders())
		} catch(error) {
			console.log(error);
			toast.error("Ein Fehler ist aufgeteren in ORDER CARD COMP")
		}
	}


	const handleDelete = async (idx: number | undefined) => {
		if(idx) {
			try {
				const { data } = await api.put(API_ROUTES.ORDERS+`/${idx}`, {
					action: "ablehnen"
				})
				console.log("DATA", data)
				toast.success(`Bestellung wurde abgelehnt!`)
				// toast.success(`${dataProp.items[idx].name} wurde abgelehnt!`)
				dispatch(updateOrders())
			} catch(error) {
				console.log(error);
				toast.error("Ein Fehler ist aufgeteren in ORDER CARD COMP")
			}
		}
	}

	if(typeof dataProp !== "undefined" && typeof dataProp.user !== "undefined") {
		return (
			<article className='rounded-md text-black'>
				<div className="border-r relative p-2 border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal">
					{
						dataProp.status === "abgeschlossen" ? (
							<span className="text-blue-500 absolute top-0 right-0 border-red-400 border-2 p-2 m-2 flex justify-center items-center rounded-md text-sm">{dataProp.status}</span>
						) : (
							<div className="flex items-start gap-2 absolute top-0 right-0 m-2">
								<span className="text-blue-500 border-red-400 border-2 p-2 flex justify-center items-center rounded-md text-sm">{dataProp.status}</span>
								<span onClick={() => handleDelete(dataProp?.id)} className="text-red-500 cursor-pointer border-red-400 border-2 p-2 m-2 flex justify-center items-center rounded-full size-6 text-sm">X</span>
							</div>
						)
					}
					<div className='mb-2 mt-6'>
						<div className='flex gap-2'>
							<div>
								<span className='block size-28 rounded-xl shadow-lg bg-black'></span>
							</div>
							<div className="mx-w-48">
								<h3 className="text-sm">Von: {dataProp.user.vorname} {dataProp.user.nachname}</h3>
								<h3 className="text-sm">Adresse: {dataProp.user.adresse}</h3>
								<h3 className="text-sm">PLZ: {dataProp.user.plz}</h3>
							</div>
						</div>
					</div>
					<div className='mb-3'>
						<p className='text-orangeColor'>{dataProp.anmerkung ? dataProp.anmerkung : "Keine Anmerkung von Kunde"}</p>
						<p>Bezahltes Gesamtgeld: {dataProp.total}$</p>
						{
							(dataProp.items && dataProp.items.length > 0) && (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
									{
										dataProp.items.map((item, idx) => (
											<div key={idx} className="rounded-md shadow-xl border p-2">
												<h3 className="flex justify-between items">{item.name}</h3>
												<p>{item.preis}$ * {item.anzahl} Mal</p>
											</div>
										))
									}
								</div>
							)
						}
					</div>
					{/* <div>
						<p className="text-gray-700 text-base">{ dataProp. }</p>
						<span>{dataProp.eingang}</span>
						<p>Gesamitpreis: { dataProp.total }$</p>
							{dataProp.status ?
								<p className="text-slate-600 mb-2 flex items-center border border-blue-700 p-2 rounded-md text-center">
									{ dataProp.status }
								</p> :
								<div className="grid md:grid-cols-3 gap-2">
									<Button onClick={() => handleSend()} size={"lg"} variant='orangeColor'>Senden</Button>
									<Button size={"lg"} variant='dark'>Edit</Button>
									<Button onClick={handleDelete} size={"lg"} variant='destructive'>Delete</Button>
								</div>
							}
					</div> */}
				</div>
			</article>
		)
	} else {

		return (
			<div>
				<h2>Empty...</h2>
			</div>

		)
	}

	

}

export default OrderCard