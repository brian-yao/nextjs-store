"use client";

import { useCartStore } from "@/store";
import { useState } from "react";

export type AddCartType = {
	name: string;
	id: string;
	image: string;
	quantity?: number | 1;
	unit_amount: number | null;
};

export default function AddCart({ name, id, image, quantity, unit_amount }: AddCartType) {
	const cartStore = useCartStore();
	const [added, setAdded] = useState(false);

	const handleAddToCart = () => {
		cartStore.addProduct({ id, image, name, unit_amount, quantity });
		setAdded(true);
		setTimeout(() => {
			setAdded(false);
		}, 500);
	};
	return (
		<button onClick={handleAddToCart} disabled={added} className="my-4 btn btn-primary w-full">
			{!added && <span>Add to cart</span>}
			{added && <span>Adding to cart...</span>}
		</button>
	);
}
