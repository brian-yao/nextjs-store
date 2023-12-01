import formatPrice from "@/utils/priceFormat";
import Image from "next/image";
import Link from "next/link";

type ProductProps = {
	name: string;
	image: string;
	unit_amount: number | null;
	quantity?: number | 1;
	id: string;
	description: string | null;
	metadata: Metadatatype;
};

type Metadatatype = {
	features: string;
};

export default function Product({
	name,
	image,
	unit_amount,
	id,
	description,
	metadata,
}: ProductProps) {
	const { features } = metadata;
	return (
		<Link
			href={{
				pathname: `/product/${id}`,
				query: { name, image, unit_amount, id, description, features },
			}}
		>
			<div>
				<Image
					src={image}
					alt={name}
					width={300}
					height={100}
					className="w-full h-60 object-cover rounded-lg"
					priority={true}
				/>
				<div className="font-medium py-2">
					<h1>{name}</h1>
					<h2 className="text-sm text-primary">
						{unit_amount !== null ? formatPrice(unit_amount) : "N/A"}
					</h2>
				</div>
			</div>
		</Link>
	);
}
