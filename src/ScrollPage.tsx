import React, { useState, useMemo, useRef, useEffect } from "react";
import * as CSSType from "csstype";
import useInterval from "./useInterval";
import ScrollHelper from "./ScrollHelper";

type direction = "vertical" | "horizon";

type ScrollPageProp = {
	direction: direction;
	showOnlyMobileMode?: boolean;
	children: React.ReactNode | React.ReactNode[];
	singlePageItemCount: number;
	scrollGap: number;
};

const ScrollPage: React.FC<ScrollPageProp> = ({
	direction,
	showOnlyMobileMode,
	scrollGap,
	children,
	singlePageItemCount = 1,
}) => {
	const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
	const [scrollCb, setScrollCb] = useState<Function | null>(null);
	const [delay, setDelay] = useState<number | null>(null);

	const containerDiv = useRef<HTMLDivElement>(null);
	const scrollHandler = useRef<ScrollHelper | null>(null);

	const scrollPageCompoent = useMemo(() => {
		const component = isSingleChildren(children) ? children : [children];
		return chunkAry(component as React.ReactNode[], singlePageItemCount).map(
			(child, index) => (
				<div style={page} key={index} className="scroll-page">
					{child}
				</div>
			)
		);
	}, [children, singlePageItemCount]);

	useEffect(() => {
		const finalPageIndex = scrollPageCompoent.length - 1;
		scrollHandler.current = new ScrollHelper(
			direction,
			finalPageIndex,
			containerDiv.current!,
			scrollGap,
			setDelay,
			setCurrentPageIndex,
			setScrollCb
		);
		//eslint-disable-next-line
	}, [scrollPageCompoent.length]);

	useInterval(delay, scrollCb);

	const pageCount = useMemo(() => {
		return scrollPageCompoent.length;
	}, [scrollPageCompoent]);

	const shouldShowDot = useMemo(() => {
		return pageCount > 1;
	}, [pageCount]);

	const constainerStyle = useMemo(() => {
		if (direction === "vertical") {
			return { ...container, ...vertical };
		} else {
			return { ...container, ...horizon };
		}
	}, [direction]);

	const onUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
		e.stopPropagation();
		// const xScroll = containerDiv.current!.scrollLeft;
		// const yScroll = containerDiv.current!.scrollTop;
		// const pageWidth = containerDiv.current!.offsetWidth;
		// const pageHeight = containerDiv.current!.offsetHeight;
		// let page = 0;
		// if (direction === "horizon") {
		// 	page = xScroll / pageWidth;
		// } else {
		// 	page = yScroll / pageHeight;
		// }

		// if (Math.floor(page) !== currentPageIndex) {
		// 	setCurrentPageIndex(Math.floor(page));
		// }

		if (delay !== null) return;
		const cb = scrollHandler.current!.getCallback(currentPageIndex);
		if (!cb) return;
		setDelay(5);
		setScrollCb(() => cb);
	};

	const uiPageDot = () => {
		return (
			<div style={pageDot} className="page-dot">
				{scrollPageCompoent.map((_, index) => {
					const isSelected = index === currentPageIndex;
					const style = isSelected ? { ...dot, ...dotSelected } : { ...dot };
					return (
						<span
							key={index}
							style={style}
							className={`dot${isSelected ? " selected" : ""}`}
						></span>
					);
				})}
			</div>
		);
	};

	return (
		<div style={cover} className="scrll-cover">
			<div
				ref={containerDiv}
				onScroll={onUserScroll}
				style={constainerStyle}
				className="scrll-page-container"
			>
				{scrollPageCompoent}
			</div>
			{shouldShowDot && uiPageDot()}
		</div>
	);
};

export default ScrollPage;

const cover: CSSType.Properties = {
	width: "100%",
	height: "100%",
	position: "relative",
	overflow: "hidden",
	display: "flex",
};

const container: CSSType.Properties = {
	width: "100%",
	height: "100%",
	position: "relative",
	display: "flex",
	justifyContent: "start",
	alignItems: "center",
	overflow: "scroll",
};

const horizon: CSSType.Properties = {
	// scrollSnapPointsX: "repeat(100%)",
	// scrollSnapType: "x mandatory",
};

const vertical: CSSType.Properties = {
	flexDirection: "column",
	// scrollSnapPointsY: "repeat(100%)",
	// scrollSnapType: "y mandatory",
};

const page: CSSType.Properties = {
	minWidth: "100%",
	width: "100%",
	minHeight: "100%",
	height: "100%",
	position: "relative",
	overflow: "hidden",
	scrollSnapAlign: "start",
	scrollSnapStop: "normal",
	scrollMargin: "0",
	scrollPadding: "0",
};

const pageDot: CSSType.Properties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "100%",
	height: "2rem",
	position: "absolute",
	bottom: "2rem",
};

const dot: CSSType.Properties = {
	border: "2px solid rgb(197, 208, 219)",
	display: "inline-block",
	width: "1rem",
	height: "1rem",
	margin: "0 0.25rem",
	borderRadius: "50%",
};

const dotSelected: CSSType.Properties = {
	backgroundColor: "#69c7f1",
};

const isSingleChildren = (
	children: React.ReactNode | React.ReactNode[]
): boolean => {
	return Array.isArray(children);
};

const chunkAry = (ary: any[], count: number): any[][] => {
	const res = [];
	for (let i = 0, j = ary.length; i < j; i += count) {
		res.push(ary.slice(i, i + count));
	}
	return res;
};
