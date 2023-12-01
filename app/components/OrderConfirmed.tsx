"use client";

import { motion } from "framer-motion";
import parrot from "@/public/parrot.gif";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store";
import { useEffect } from "react";

export default function OrderConfirmed() {
	const cartStore = useCartStore();
	useEffect(() => {
		cartStore.setPaymentIntent("");
		cartStore.clearCart();
	}, []);

	return (
		<motion.div
			initial={{ scale: 0.5, opacity: 0.1 }}
			animate={{ scale: 1, opacity: 1 }}
			className="flex items-center justify-center my-12"
		>
			<div className="p-12 rounded-md text-center">
				<h1 className="text-2xl font-medium">Your order has been placed 🚀</h1>
				<h2 className="text-sm sm-4">Check your email for the receipt</h2>
				<Image src={parrot} alt="party parrot" className="py-8" />
				<div className="flex items-center justify-center gap-12">
					<Link href={"/dashboard"}>
						<button
							onClick={() => {
								setTimeout(() => {
									cartStore.setCheckout("cart");
								}, 1000);
								cartStore.toggleCart();
							}}
							className="font-medium"
						>
							Check your order
						</button>
					</Link>
				</div>
			</div>
		</motion.div>
	);
}
