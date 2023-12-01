import formatPrice from "@/utils/priceFormat";
import Image from "next/image";
import AddCart from "./AddCart";

type Params = {
	id: string;
};

type SearchParams = {
	name: string;
	image: string;
	unit_amount: number | null;
	id: string;
	description: string | null;
	features: string;
};

type SearchParamTypes = {
	params: Params;
	searchParams: SearchParams;
};

export default async function ProductPage({ searchParams }: SearchParamTypes) {
	return (
		<div className="flex flex-col lg:flex-row justify-center items-center gap-16">
			<Image
				src={searchParams.image}
				alt={searchParams.name}
				width={400}
				height={400}
				className="w-3/5 rounded-lg"
				priority={true}
			/>
			<div className="font-medium w-4/5 border-dashed border-2 p-8">
				<h1 className="text-2xl py-2">{searchParams.name}</h1>
				<p className="py-2">{searchParams.description}</p>

				<div className="flex gap-2">
					<p className="font-bold text-primary">
						{searchParams.unit_amount ? formatPrice(searchParams.unit_amount) : "N/A"}
					</p>
				</div>
				<AddCart {...searchParams} />
			</div>
		</div>
	);
}
