"use client";
import Header from "@/components/Header";
// import api from "@/lib/api";
import { store } from "@/store/store";
// import { useEffect } from "react";
import { Provider } from "react-redux";

export default function PagesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	// useEffect(() => {
  //   api("/api/socket");
  // }, []);

	return (
		<main>
			<Provider store={store}>
				<Header />
				{children}
			</Provider>
		</main>
	);
}
