export enum API_ROUTES {
	// Users
	CREATE_USER = "/users/register",
	LOGIN_USER = "/users/login",
	PROFILE_USER = "/users/profile",
	// Restaurants
	CREATE_RESTAURANT = "/restaurants/register",
	LOGIN_RESTAURANT = "/restaurants/login",
	PROFILE_RESTAURANT = "/restaurants/profile",
	GET_RESTAURANTS = "/restaurants",
	GET_RESTAURANT = "/restaurants",
	GET_OPENED_RESTAURANTS = "/restaurants/open",
	MENU_RESTAURANT = "/restaurants/menu",
	MENU_ITEM_RESTAURANT = "/restaurants/menu",
	// Baskets
	BASKETS = "/baskets",
	// Orders
	ORDERS = "/orders",
	GET_RESTAURANT_ORDERS = "/orders",
	SINGLE_ORDER = "/orders/[id]",
}
