"use client";

import { useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { registerRestaurant } from "@/app/server/functions";
import toast from "react-hot-toast";
import axios from "axios"
import { API_ROUTES } from "@/constants/enums";
import { useRouter } from "next/navigation";
import { loginFormSchema, registeringFormSchema } from "@/lib/schemas";
import { useDispatch } from "react-redux";
import { loginRestaurant } from "@/store/slices/authSlice";
import api from "@/lib/api";
// import { registerRestaurant } from "@/app/server/functions";

const AuthRestaurant = () => {


	const dispatch = useDispatch()
	const router = useRouter()

  const RegisteringForm = useForm<z.infer<typeof registeringFormSchema>>({
    resolver: zodResolver(registeringFormSchema),
    defaultValues: {
      name: "",
      email: "",
      passwort: "",
      adresse: "",
      plz: "",
      beschreibung: "",
      logo: "",
      img: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      passwort: "",
    },
  });

	const { isSubmitting: isRFSubmitting } = RegisteringForm.formState;
	const { isSubmitting: isLFSubmitting } = loginForm.formState;

	const convertFileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	const handleFileChange = useCallback(
    async (fieldName: "logo" | "img", file: File | undefined) => {
      if (file) {
        const base64 = await convertFileToBase64(file);
        RegisteringForm.setValue(fieldName, base64);
      }
	}, [RegisteringForm]);

	async function onRFSubmit(values: z.infer<typeof registeringFormSchema>) {
		try {
			const { data } = await axios.post(process.env.NEXT_PUBLIC_DATABASE_URL + API_ROUTES.CREATE_RESTAURANT, values)
			if(data.status === "success") {
				dispatch(loginRestaurant(data.data))
				toast.success("Erfolgreich wurde Ihr Geschaeft bei uns erstellt!");
				router.push("/")
			} else {
				toast.error("Der Server antowrtet gerade nicht!");
			}
		} catch (error: any) {
			console.error(error)
			toast.error("Ein Fehler ist aufgetreten!");
		}
	}

	async function onLFSubmit(values: z.infer<typeof loginFormSchema>) {
		try {
			const { data } = await api.post(process.env.NEXT_PUBLIC_DATABASE_URL + API_ROUTES.LOGIN_RESTAURANT, values)
			if(data.status === "success") {
				dispatch(loginRestaurant(data.data))
				toast.success("Erfolgreich bist du angemeldet!");
				router.push("/")
			} else {
				toast.error("Der Server antowrtet gerade nicht!");
			}
		} catch (error: any) {
			console.error(error)
			toast.error("Ein Fehler ist aufgetreten!");
		}
	}

  return (
		<div className="my-28">
			<Tabs defaultValue="signup" className="max-w-xl mx-auto bg-background text-center rounded-lg shadow-lg py-5 px-8">
				<TabsList className="grid w-2/3 mx-auto grid-cols-2 bg-secondbg text-white">
					<TabsTrigger
						value="login"
						className="data-[state=active]:bg-orangeColor data-[state=active]:text-white"
					>
						Anmelden
					</TabsTrigger>
					<TabsTrigger
						value="signup"
						className="data-[state=active]:bg-orangeColor data-[state=active]:text-white"
					>
						Registrieren
					</TabsTrigger>
				</TabsList>
				<div>
					<TabsContent value="signup">
						<div>
							<div className="text-center">
								<h2 className="text-2xl md:text-3xl">Partnerschaft erstellen</h2>
								<p className="text-orangeColor text-xs">Melde dein Restaurant...</p>
							</div>
							<div className="flex items-center mt-5 text-start mx-auto">
								<Form {...RegisteringForm}>
									<form onSubmit={RegisteringForm.handleSubmit(onRFSubmit)} className="space-y-5 w-full">
										<FormField
											control={RegisteringForm.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input {...field} placeholder="Name des Geschäfts*" />
													</FormControl>
													<FormMessage />
													<FormDescription>
														Dies ist Ihr öffentlicher Anzeigename
													</FormDescription>
												</FormItem>
											)}
										/>
										<FormField
											control={RegisteringForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="email" placeholder="Email*" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={RegisteringForm.control}
											name="passwort"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="password" placeholder="Passwort*" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex space-x-4">
											<FormField
												control={RegisteringForm.control}
												name="adresse"
												render={({ field }) => (
													<FormItem className="w-2/3">
														<FormLabel>Adresse</FormLabel>
														<FormControl>
															<Input placeholder="Straße Hausnummer, Ort" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={RegisteringForm.control}
												name="plz"
												render={({ field }) => (
													<FormItem className="w-1/3">
														<FormLabel>PLZ</FormLabel>
														<FormControl>
															<Input placeholder="Z.B. 470**" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<FormField
											control={RegisteringForm.control}
											name="beschreibung"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Beschreibung</FormLabel>
													<FormControl>
														<Textarea placeholder="Z.B. Es erwarten Dich viele Spezialitäten vom ..." {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={RegisteringForm.control}
											name="logo"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input
															type="file"
															accept="image/png, image/jpg, image/jpeg"
															onChange={(e) => handleFileChange("logo", e.target.files?.[0])}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={RegisteringForm.control}
											name="img"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input
															type="file"
															accept="image/png, image/jpg, image/jpeg"
															onChange={(e) => handleFileChange("img", e.target.files?.[0])}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button disabled={isRFSubmitting} variant="orangeColor" type="submit">
											{isRFSubmitting? "Wird geladen..." : "Geschaeftskonto erstellen"}
										</Button>
									</form>
								</Form>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="login">
						<div>
							<div className="text-center">
								<h2 className="text-2xl md:text-3xl">Einloggen</h2>
								<p className="text-orangeColor text-xs">Schon Ein Konto hast...</p>
							</div>
							<div className="flex items-center mt-5 text-start mx-auto">
								<Form {...loginForm}>
									<form onSubmit={loginForm.handleSubmit(onLFSubmit)} className="space-y-5 w-full">
										<FormField
											control={loginForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="email" placeholder="Email*" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={loginForm.control}
											name="passwort"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="password" placeholder="Passwort*" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button disabled={isLFSubmitting} variant="orangeColor" type="submit">
											{isLFSubmitting? "wird geladen..." : "Einloggen"}
										</Button>
										{/* <Button disabled={isLFSubmitting || !isLFValid} variant="orangeColor" type="submit">
											{isLFSubmitting? "wird geladen..." : "Einloggen"}
										</Button> */}
									</form>
								</Form>
							</div>
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
  );
};

export default AuthRestaurant