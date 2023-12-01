import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { AddCartType } from "@/app/product/[id]/AddCart";
// import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: "2022-11-15",
});

// const prisma = new PrismaClient();

const calculateOrderAmount = (items: AddCartType[]) => {
	const totalPrice = items.reduce((acc, item) => {
		acc += item.unit_amount! * item.quantity!;
		return acc;
	}, 0);
	return totalPrice;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// get user
	const userSession = await getServerSession(req, res, authOptions);
	if (!userSession?.user) {
		res.status(403).json({ message: "You are not logged in" });
		return;
	}
	// extract the data from the body
	const { items, payment_intent_id } = req.body;

	// create order data
	const orderData = {
		user: { connect: { id: userSession.user?.id } },
		amount: calculateOrderAmount(items),
		currency: "usd",
		status: "pending",
		paymentIntentId: payment_intent_id,
		products: {
			create: items.map((item: any) => {
				return {
					name: item.name,
					description: item.description || null,
					unitAmount: parseFloat(item.unit_amount),
					image: item.image,
					quantity: item.quantity,
				};
			}),
		},
	};

	// check if payment intent exists and then update the order
	if (payment_intent_id) {
		// update order amount
		const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);
		// TODO: update this logic so it checks if current_intent has changed from previous
		// to prevent unncessary recalculation
		if (current_intent) {
			const updated_intent = await stripe.paymentIntents.update(payment_intent_id, {
				amount: calculateOrderAmount(items),
			});
			// fetch order with product ids
			const existing_order = await prisma.order.findFirst({
				where: { paymentIntentId: updated_intent.id },
				include: { products: true },
			});
			if (!existing_order) {
				return res.status(400).json({ message: "Invalid payment intent" });
			}

			// udpate the existing order
			const updated_order = await prisma.order.update({
				where: { id: existing_order.id! },
				data: {
					amount: calculateOrderAmount(items),
					products: {
						deleteMany: {},
						create: items.map((item: any) => {
							return {
								name: item.name,
								description: item.description || null,
								unitAmount: parseFloat(item.unit_amount),
								image: item.image,
								quantity: item.quantity,
							};
						}),
					},
				},
			});
			res.status(200).json({ paymentIntent: updated_intent });
			return;
		}
	} else {
		// paymentIntent === "" -> it was never created
		// create new order with prisma
		const payment_intent = await stripe.paymentIntents.create({
			amount: calculateOrderAmount(items),
			currency: "usd",
			automatic_payment_methods: { enabled: true },
		});
		orderData.paymentIntentId = payment_intent.id;

		const newOrder = await prisma.order.create({
			data: orderData,
		});

		res.status(200).json({ paymentIntent: payment_intent });
		return;
	}
}
