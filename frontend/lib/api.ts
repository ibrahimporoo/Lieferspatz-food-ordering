import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DATABASE_URL, // Replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the access token in every request
api.interceptors.request.use(
  (config) => {

    if (typeof window !== "undefined") {  // Ensure code runs only in the browser
      const storedUser = localStorage.getItem("storedUser") || null;
      if(storedUser) {
        const { access_token } = JSON.parse(storedUser);
        config.headers.Authorization = `Bearer ${access_token}`;
      } else {
        const storedRestaurant = localStorage.getItem("storedRestaurant") || null;
        if(storedRestaurant) {
          const { access_token } = JSON.parse(storedRestaurant);
          // console.log("ACEES RESTAURAT TOKEN inside out:", access_token)
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;