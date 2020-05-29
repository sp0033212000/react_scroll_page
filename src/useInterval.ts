import { useEffect } from "react";
import { useRef } from "react";

type UseInterval = (delay: null | number, cb: null | Function) => void;

const useInterval: UseInterval = (delay, cb): void => {
	const saveCallback = useRef<Function | null>(null);

	useEffect(() => {
		saveCallback.current = cb;
	}, [cb]);

	useEffect(() => {
		function tick(): void {
			if (saveCallback.current !== null) {
				saveCallback.current();
			}
		}

		if (delay !== null) {
			let id = setInterval(tick, delay!);
			return () => clearInterval(id);
		}
	}, [delay]);
};

export default useInterval;
