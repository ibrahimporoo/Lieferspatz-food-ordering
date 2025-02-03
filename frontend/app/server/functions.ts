"use server";

import { API_ROUTES } from "@/constants/enums";
import axios from "axios";
import toast from "react-hot-toast";

export async function registerRestaurant(values: any) {
	try {
		const { data } = await axios.post(process.env.NEXT_PUBLIC_DATABASE_URL + API_ROUTES.CREATE_RESTAURANT, values)
		console.log(data)
		if(data.status === "success") {
			localStorage.setItem("restaurant", JSON.stringify(data.data))
			console.log("Response:", data);
			// toast.success("Erfolgreich wurde Ihr Restaurant erstellt!", {
			// 	position: "top-right",
			// });
		} else {
			// toast.error("Der Server antowrtet gerade nicht!", {
			// 	position: "top-right",
			// });
			console.log("Not Successed")
		}
	} catch (error) {
		console.error("Registration failed:", error);
		// toast.error("Ein Fehler ist aufgetreten!", {
		// 	position: "bottom-right",
		// });
	}
}

export async function loginRestaurant(values: any) {
	try {
		const { data } = await axios.post(process.env.NEXT_PUBLIC_DATABASE_URL + API_ROUTES.LOGIN_RESTAURANT, values)
		console.log("DATA:", data);
		// if(data.status === "success") {
		// 	localStorage.setItem("restaurant", JSON.stringify(data.data))
		// 	console.log("Response:", data);
		// 	toast.success("Erfolgreich wurde Ihr Restaurant erstellt!", {
		// 		position: "top-right",
		// 	});
		// } else {
		// 	toast.error("Der Server antowrtet gerade nicht!", {
		// 		position: "top-right",
		// 	});
		// }
	} catch (error) {
		console.error("Registration failed:", error);
		toast.error("Ein Fehler ist aufgetreten!", {
			position: "bottom-right",
		});
	}
}

// response.data, response.status