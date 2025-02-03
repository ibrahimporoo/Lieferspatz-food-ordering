'use client';

import { updateOrders } from '@/store/slices/orderSlice';
import { RootState } from '@/store/store';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import OrderCard from '../cards/orderCard';

const RestaurantOrders = () => {

	const { restaurant } = useSelector((state: RootState) => state.auth);
	const { orders } = useSelector((state: RootState) => state.cart);

	const dispatch = useDispatch()

	useEffect(() => {
		if(restaurant) {
			dispatch(updateOrders())
		}

	}, [])


	return (
		<div className='py-28 container'>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
				{
					(orders && orders.length > 0) && (
						orders.map((order, idx) => (
							<OrderCard key={idx} dataProp={order} />
							// <h2>HELLO: {order.anmerkung}</h2>
						))
					)
				}
			</div>
		</div>
	)
}

export default RestaurantOrders;