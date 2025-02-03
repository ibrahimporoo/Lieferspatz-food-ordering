export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties
}

export interface ProfileType {
	email: string,
	adresse: string,
	vorname: string,
	nachname: string,
	plz: string,
	geld: number,
	access_token?: string
}

export interface ReceivedUser extends User {
	id: string,
}

export interface RestaurantProfileType {
	email: string,
	name: string,
	adresse: string,
	plz: string,
	beschreibung: string,
	img_url: string,
	logo_url: string,
	geld: string,
	lieferradius: string[],
	mo_von: number,
	mo_bis: number,
	di_von: number,
	di_bis: number,
	mi_von: number,
	mi_bis: number,
	do_von: number,
	do_bis: number,
	fr_von: number,
	fr_bis: number,
	sa_von: number,
	sa_bis: number,
	so_von: number,
	so_bis: number
}

export interface Menu {
	id: 8,
	beschreibung: string,
	img_url: string,
	name: string,
	preis: number
}

export interface OrderItem {
	id?: number;
	item_id: number,
	name: string,
	preis: number,
	anzahl: number,
}

export interface Order {
	resto_id?: number,
	id?: number,
	status?: string,
	anmerkung: string,
	eingang?: string,
	total: number,
	items: OrderItem[],
	user?: {
		adresse: string,
		nachname: string,
		plz: string,
		vorname: string
	}
}

export interface BasketItem {
  id: string,
  anmerkung: string,
  eingang: string,
	status?: string,
	total: number
	items: Array<{
		anzahl: number,
		name: string,
		preis: number
	}>,
  restaurant: {
    id: string,
    adresse: string,
    name: string,
    plz: string
  },
}

