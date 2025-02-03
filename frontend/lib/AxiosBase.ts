import axios from "axios";

const storedUser = localStorage.getItem("storedUser") || '{ "access_token": null }';
const { access_token } = JSON.parse(storedUser!);

console.log("==== access token: ====", access_token)


const AxiosBase = access_token ? (
	axios.create({
		baseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${access_token}`,
	 }
	})
) : (
	axios.create({
		baseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
		headers: {
			"Content-Type": "application/json"
	 }
	})
)

export default AxiosBase;