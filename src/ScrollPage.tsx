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
	const [top, setTop] = useState<number>(0);
	const [left, setLeft] = useState<number>(0);
	const [width, setWidth] = useState<number>(0);
	const [height, setHeight] = useState<number>(0);
	const [scrollCb, setScrollCb] = useState<Function | null>(null);
	const [delay, setDelay] = useState<number | null>(null);

	const containerDiv = useRef<HTMLDivElement>(null);
	const scrollHandler = useRef<ScrollHelper | null>(null);

	const scrollPageCompoent = useMemo(() => {
		const component = isSingleChildren(children) ? children : [children];
		return chunkAry(component as React.ReactNode[], singlePageItemCount).map(
			(child, index) => (
				<div
					style={{ ...page, minWidth: width, minHeight: height, width, height }}
					key={index}
					className="scroll-page"
				>
					{child}
				</div>
			)
		);
	}, [children, singlePageItemCount, width, height]);

	useEffect(() => {
		document.querySelector("html")!.style.overflow = "hidden";
		document.querySelector("body")!.style.overflow = "hidden";
		setWidth(containerDiv.current!.parentElement!.offsetWidth);
		setHeight(containerDiv.current!.parentElement!.offsetHeight);
		//eslint-disable-next-line
	}, []);

	useEffect(() => {
		scrollHandler.current = new ScrollHelper(
			setCurrentPageIndex,
			setLeft,
			setTop,
			setDelay,
			containerDiv.current!,
			direction
		);
		//eslint-disable-next-line
	}, [width, height]);

	useInterval(delay, scrollCb);

	const pageCount = useMemo(() => {
		return scrollPageCompoent.length;
	}, [scrollPageCompoent]);

	const shouldShowDot = useMemo(() => {
		return pageCount > 1;
	}, [pageCount]);

	const onUserScroll = (e: React.WheelEvent<HTMLElement>) => {
		if (delay !== null) return;
		const { deltaX, deltaY } = e;
		const cb = scrollHandler.current!.getCallback(
			top,
			left,
			currentPageIndex,
			deltaX,
			deltaY
		);
		if (cb !== null) {
			setScrollCb(() => cb);
			setDelay(100);
		}
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
				className="scrll-page-container"
				ref={containerDiv}
				onWheel={onUserScroll}
				style={{
					...container,
					top: `${top}px`,
					left: `${left}px`,
					transition: `left 1000ms, top 1000ms`,
					flexDirection: direction === "horizon" ? "row" : "column",
				}}
				// style={
				// 	delay === null ? container : { ...container, overflow: "hidden" }
				// }
			>
				{scrollPageCompoent}
			</div>
			{shouldShowDot && uiPageDot()}
		</div>
	);
};

export default ScrollPage;

const cover: CSSType.Properties = {
	top: "0",
	bottom: "0",
	left: "0",
	right: "0",
	position: "absolute",
	overflow: "hidden",
	display: "flex",
};

const container: CSSType.Properties = {
	top: "0",
	bottom: "0",
	left: "0",
	right: "0",
	position: "absolute",
	display: "flex",
	justifyContent: "start",
	alignItems: "center",
	overflow: "visble",
	width: "fit-content",
	height: "fit-content",
};

const page: CSSType.Properties = {
	position: "relative",
	overflow: "hidden",
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
