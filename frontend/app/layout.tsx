import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "./providers/toaster-providers";

export const metadata: Metadata = {
	title: "Lieferspatz - Dein Bestellungsort",
	description: "Bestell Essen jederzeit und jeden Tag",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de">
			<body>
				<ToasterProvider />
				{children}
			</body>
		</html>
	);
}
