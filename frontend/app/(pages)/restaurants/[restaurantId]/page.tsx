import MenuCard from "@/components/menu-card";

import { API_ROUTES } from "@/constants/enums";
import { Menu } from "@/constants/types";
import api from "@/lib/api";

const SingleRestaurant = async ({ params }: { params: { restaurantId: string } }) => {

	const { restaurantId } = params;
	let menus: Menu[] = [];

	try {
    const { data } = await api.get(API_ROUTES.GET_RESTAURANT+`/${restaurantId}`);
    if (data.status === "success") {
      menus = data.data.menu;
    }
  } catch (error) {
    console.error("Error fetching restaurants:", error);
  }

	return (
		<div className='py-32 container'>
			<div className="mb-10">
				<h2 className="text-blue-700 text-3xl">
					Unsere Lieblingsspeisen!
					<span className='bg-orangeColor mt-1 h-[2px] w-1/3 block'></span>
				</h2>
			</div>
			<div className='space-y-4'>
				{
					menus.length > 0 ? (
						menus.map((menu) => (
							<MenuCard key={menu.id} menu={menu} restaurantId={restaurantId} />
						))
					) : (
						<p>Noch keine Speisen geben!</p>
					)
				}
			</div>
		</div>
	)
}

export default SingleRestaurant