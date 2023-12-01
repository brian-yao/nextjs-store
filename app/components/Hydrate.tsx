"use client";

import { useThemeStore } from "@/store";
import { ReactNode, useState, useEffect } from "react";

// This component is used to make sure that the client and server data
// are in sync

export default function Hdyrate({ children }: { children: ReactNode }) {
	const [isHydrated, setIsHydrated] = useState(false);
	const themeStore = useThemeStore();
	useEffect(() => {
		setIsHydrated(true);
	}, []);
	return (
		<>
			{isHydrated ? (
				<body className="px-4 lg:px-48`" data-theme={themeStore.mode}>
					{children}
				</body>
			) : (
				<body></body>
			)}
		</>
	);
}
