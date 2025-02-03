"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast";
import { API_ROUTES } from "@/constants/enums";
import { useRouter } from "next/navigation";
import { loginFormSchema, registeringUserFormSchema } from "@/lib/schemas";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/slices/authSlice";
import api from "@/lib/api";

const AuthUser = () => {

	const dispatch = useDispatch()
	const router = useRouter()

  const RegisteringForm = useForm<z.infer<typeof registeringUserFormSchema>>({
    resolver: zodResolver(registeringUserFormSchema),
    defaultValues: {
      vorname: "",
      nachname: "",
      email: "",
      passwort: "",
      adresse: "",
      plz: "",
    },
  });

  const LoginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      passwort: "",
    },
  });

	const { isSubmitting: isUFSubmitting } = RegisteringForm.formState;
	const { isSubmitting: isLFSubmitting } = LoginForm.formState;

	async function onUFSubmit(values: z.infer<typeof registeringUserFormSchema>) {
		try {
			const { data } = await api.post(API_ROUTES.CREATE_USER, values)
			if(data.status === "success") {
				dispatch(loginUser(data.data))
				toast.success("Erfolgreich wurde Ihr Konto erstellt!");
				router.push("/")
			} else {
				toast.error("Der Server antwortet gerade nicht! Bitte versuch mal spaeter.");
			}
		} catch (error: any) {
			if(error.status === 401) {
				toast.error("Ungültige Zugangsdaten");
			} else {
				toast.error("Ein Fehler ist aufgetreten!");
			}
			console.log(error)
		}
	}

	async function onLFSubmit(values: z.infer<typeof loginFormSchema>) {
		try {
			const { data } = await api.post(API_ROUTES.LOGIN_USER, values)
			if(data.status === "success") {
				dispatch(loginUser(data.data))
				toast.success("Erfolgreich haben Sie schon eingeloggt!");
				router.push("/")
			} else {
				toast.error("Der Server antowrtet gerade nicht! Bitte versuch mal spaeter.");
			}
		} catch (error: any) {
			if(error.status === 401) {
				toast.error("Ungültige Zugangsdaten");
			} else {
				toast.error("Ein Fehler ist aufgetreten!");
			}
			console.log(error)
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
							<div>
								<h2 className="text-2xl md:text-3xl">Konto erstellen</h2>
								<p className="text-orangeColor text-xs">Melde dich an...</p>
							</div>
							<div className="flex items-center mt-5 text-start mx-auto">
								<Form {...RegisteringForm}>
									<form onSubmit={RegisteringForm.handleSubmit(onUFSubmit)} className="space-y-5 w-full">
										<div className="grid grid-cols-2 space-x-4">
											<FormField
												control={RegisteringForm.control}
												name="vorname"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input {...field} placeholder="Vorname*" />
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
												name="nachname"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input {...field} placeholder="Nachname*" />
														</FormControl>
														<FormMessage />
														<FormDescription>
															Dies ist Ihr öffentlicher Anzeigename
														</FormDescription>
													</FormItem>
												)}
											/>
										</div>
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
										<Button disabled={isUFSubmitting} variant="orangeColor" type="submit">
											{isUFSubmitting? "Wird geladen..." : "Konto erstellen"}
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
								<Form {...LoginForm}>
									<form onSubmit={LoginForm.handleSubmit(onLFSubmit)} className="space-y-5 w-full">
										<FormField
											control={LoginForm.control}
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
											control={LoginForm.control}
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

export default AuthUser