import Image from 'next/image'
import { BasketItem } from '@/constants/types'
import { Button } from '../ui/button';
import api from '@/lib/api';
import { API_ROUTES } from '@/constants/enums';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { updateBaskets, updateOrders } from '@/store/slices/orderSlice';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';

const DataCard = ({ dataProp }: { dataProp: BasketItem }) => {

	const router = useRouter()

	const { user } = useSelector((state: RootState) => state.auth);

	if(!user) {
		router.back();
		toast.error("Du musst dich erstmal als Benutzer registrieren..")
	}

	const dispatch = useDispatch();	
	const handleSend = async () => {
		try {
			const body = {
				resto_id: dataProp.restaurant.id,
				anmerkung: dataProp.anmerkung,
				eingang: dataProp.eingang,
				total: dataProp.total,
				items: dataProp.items
			}
			const { data } = await api.post(API_ROUTES.BASKETS, body);
			console.log("DATA Orders: ====", data);
			if(data.status === 'success') {
				handleDelete();
				dispatch(updateBaskets())
				dispatch(updateOrders())
				// router.refresh();
				toast.success('Ihre Bestellung wur1de sicher gesendet!')
			} else {
				toast.error('Ein Fehler wurde geschehen!')
			}
		} catch(error: any) {
			toast.error(error.response.data.data.message)
		}
	}

	const handleDelete = async () => {
		try {
			const { data } = await api.delete(API_ROUTES.BASKETS+`/${dataProp.id}`)
			dispatch(updateBaskets())
			dispatch(updateOrders())
		} catch(error) {
			toast.error("Ein Fehler ist aufgeteren in DATA CARD COMP")
		}
	}
 
		return (
			<article className='rounded-md text-black'>
				<div className="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
					<div className='mb-2'>
						<div className='flex gap-2'>
							<span className='block size-28 rounded-xl shadow-lg bg-black'></span>
							<div>
								<h3>Retaurant</h3>
								<p className='text-orangeColor'>{dataProp.restaurant.name}</p>
								<p>{dataProp.restaurant.adresse}, {dataProp.restaurant.plz}</p>
							</div>
						</div>
					</div>
					<div className='mb-3'>
						{
							(dataProp.items && dataProp.items.length > 0) && (
								<div className='grid grid-cols-3 gap-3'>
									{
										dataProp.items.map((item, idx) => (
											<div key={idx} className="rounded-md shadow-xl border p-2">
												<h3>{item.name}</h3>
												<p>{item.preis}$ * {item.anzahl} Mal</p>
											</div>
										))
									}
								</div>
							)
						}
					</div>
					<div>
						<p className="text-gray-700 text-base">{ dataProp.anmerkung }</p>
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
					</div>
				</div>
			</article>
		)
}

export default DataCard