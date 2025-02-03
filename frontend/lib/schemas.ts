import { z } from "zod";

export const registeringUserFormSchema = z.object({
	vorname: z.string().min(2, {
		message: "Name des Geschäfts muss mindestens 2 Buchstaben enthalten.",
	}).trim(),
	nachname: z.string().min(2, {
		message: "Name des Geschäfts muss mindestens 2 Buchstaben enthalten.",
	}).trim(),
	email: z.string().email({ message: "Ungültige E-Mail-Adresse" }).trim(),
	passwort: z
		.string()
		.min(6, { message: "Muss mindestens 5 Zeichen enthalten." })
		// .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/, {
		// 	message:
		// 		"Muss eine Buchstabe, eine Zahl und ein Sonderzeichen enthalten.",
		// }),
		,
	adresse: z.string().trim(),
	plz: z.string().trim()
});

export const registeringFormSchema = z.object({
	name: z.string().min(2, {
		message: "Name des Geschäfts muss mindestens 2 Buchstaben enthalten.",
	}).trim(),
	email: z.string().email({ message: "Ungültige E-Mail-Adresse" }).trim(),
	passwort: z
		.string()
		.min(6, { message: "Muss mindestens 5 Zeichen enthalten." })
		// .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/, {
		// 	message:
		// 		"Muss eine Buchstabe, eine Zahl und ein Sonderzeichen enthalten.",
		// }),
		,
	adresse: z.string().trim(),
	plz: z.string().trim(),
	beschreibung: z.string().trim(),
	logo: z.string().base64(),
	img: z.string().base64(),
});

export const loginFormSchema = z.object({
	email: z.string().email({ message: "Ungültige E-Mail-Adresse" }).trim(),
	passwort: z
		.string()
		.min(5, { message: "Muss mindestens 5 Zeichen enthalten." })
		// .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/, {
		// 	message:
		// 		"Muss mindestens einen Buchstaben, eine Zahl.",
		// })
});