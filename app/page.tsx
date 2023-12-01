import Stripe from "stripe";
import Product from "./components/Product";

const getProducts = async () => {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
		apiVersion: "2022-11-15",
	});
	const products = await stripe.products.list();

	const productWithPrices = await Promise.all(
		products.data.map(async (product: Stripe.Product) => {
			const defaultPrice: any = product.default_price;
			const price = await stripe.prices.retrieve(defaultPrice);
			const features = product.metadata.features || "";
			return {
				id: product.id,
				name: product.name,
				image: product.images[0],
				unit_amount: price.unit_amount,
				currency: price.currency,
				description: product.description,
				metadata: { features },
			};
		})
	);
	return productWithPrices;
};

export default async function Home() {
	const products = await getProducts();
	return (
		<main className="grid grid-cols-fluid gap-12">
			{products.map((product) => (
				<Product {...product} key={product.id} />
			))}
		</main>
	);
}
