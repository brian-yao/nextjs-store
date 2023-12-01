"use client";

import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore, useThemeStore } from "@/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CheckoutForm from "./CheckoutForm";
import OrderAnimation from "./OrderAnimation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Checkout() {
	const cartStore = useCartStore();
	const router = useRouter();
	const [clientSecret, setClientSecret] = useState("");
	const themeStore = useThemeStore();
	const [stripeTheme, setStripeTheme] = useState<"flat" | "stripe" | "night" | "none">("stripe");
	// Create a payment intent as soon as the page loads up
	useEffect(() => {
		if (themeStore.mode === "light") {
			setStripeTheme("flat");
		} else {
			setStripeTheme("night");
		}
		fetch("/api/create-payment-intent", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				items: cartStore.cart,
				payment_intent_id: cartStore.paymentIntent,
			}),
		})
			.then((res) => {
				if (res.status === 401) {
					return router.push("/api/auth/signin");
				}
				return res.json();
			})
			.then((data) => {
				console.log(data);
				setClientSecret(data.paymentIntent.client_secret);
				cartStore.setPaymentIntent(data.paymentIntent.id);
			});
	}, []);

	const options: StripeElementsOptions = {
		clientSecret,
		appearance: {
			theme: stripeTheme,
			labels: "floating",
		},
	};

	return (
		<div>
			{!clientSecret && <OrderAnimation />}
			{clientSecret && (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					<Elements options={options} stripe={stripePromise}>
						<CheckoutForm clientSecret={clientSecret} />
					</Elements>
				</motion.div>
			)}
		</div>
	);
}
