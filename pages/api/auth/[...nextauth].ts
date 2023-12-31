import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";
import Stripe from "stripe";

// const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
		//Add another provider
	],
	events: {
		createUser: async function ({ user }) {
			// instantiate stripe
			const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
				apiVersion: "2022-11-15",
			});
			// create a new stripe customer
			if (user.email && user.name) {
				const customer = await stripe.customers.create({
					email: user.email,
					name: user.name,
				});
				// also update the prisma user with stripe id
				await prisma.user.update({
					where: { id: user.id },
					data: { stripeCustomerId: customer.id },
				});
			}
		},
	},
	callbacks: {
		async session({ session, token, user }) {
			session.user = user;
			return session;
		},
	},
};

export default NextAuth(authOptions);
