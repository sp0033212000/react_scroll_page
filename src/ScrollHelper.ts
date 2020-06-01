type Direction = "vertical" | "horizon";

enum ScrollAction {
	"notYet",
	"forward",
	"backward",
}

class ScrollHelper {
	private indexSetter: Function;
	private xAxisSetter: Function;
	private yAxisSetter: Function;
	private delaySetter: Function;
	private index: number;
	private finalIndex: number;
	private containerEl: HTMLDivElement;
	private containerWidth: number;
	private containerHeight: number;
	private pageWidth: number;
	private pageHeight: number;
	private xCoord: number;
	private yCoord: number;
	private verticalTriggerPitch: number;
	private horizonTriggerPitch: number;
	private direction: Direction;
	private scrollAction: ScrollAction;
	private scrollGap?: number;
	constructor(
		indexSetter: Function,
		xAxisSetter: Function,
		yAxisSetter: Function,
		delaySetter: Function,
		containerEl: HTMLDivElement,
		direction: Direction,
		scrollGap?: number
	) {
		this.indexSetter = indexSetter;
		this.xAxisSetter = xAxisSetter;
		this.yAxisSetter = yAxisSetter;
		this.delaySetter = delaySetter;
		this.index = 0;
		this.finalIndex = 0;
		this.containerEl = containerEl;
		this.direction = direction;
		this.containerHeight = 0;
		this.containerWidth = 0;
		this.pageHeight = 0;
		this.pageWidth = 0;
		this.xCoord = 0;
		this.yCoord = 0;
		this.verticalTriggerPitch = 0;
		this.horizonTriggerPitch = 0;
		this.scrollAction = ScrollAction.notYet;
		this.scrollGap = scrollGap || 20;
		this.init();
	}

	private init = () => {
		const {
			offsetHeight: ContainerOffsetHeight,
			offsetWidth: ContainerOffsetWidth,
		} = this.containerEl!;
		const {
			offsetHeight: pageOffsetHeight,
			offsetWidth: pageOffsetWidth,
		} = this.containerEl!.parentElement!;
		this.containerHeight = ContainerOffsetHeight;
		this.containerWidth = ContainerOffsetWidth;
		this.pageHeight = pageOffsetHeight;
		this.pageWidth = pageOffsetWidth;
		this.verticalTriggerPitch = this.pageHeight * 0.5;
		this.horizonTriggerPitch = this.pageWidth * 0.5;
		this.finalIndex =
			this.direction === "horizon"
				? this.containerWidth / this.pageWidth - 1
				: this.containerHeight / pageOffsetHeight - 1;
	};

	private setting = (top: number, left: number, pageIndex: number) => {
		this.yCoord = top;
		this.xCoord = left;
		this.index = pageIndex;
	};

	private shouldScroll = () => {
		let should = false;
		if (this.direction === "horizon") {
			if (this.scrollAction === ScrollAction.forward) {
				should = this.xCoord < 0;
			}
			if (this.scrollAction === ScrollAction.backward) {
				should = this.xCoord > -this.containerWidth + this.pageWidth;
			}
		}
		if (this.direction === "vertical") {
			if (this.scrollAction === ScrollAction.forward) {
				should = this.yCoord < 0;
			}
			if (this.scrollAction === ScrollAction.backward) {
				should = this.yCoord > -this.containerHeight + this.pageHeight;
			}
		}
		return should;
	};

	private isClose = (closePostion: number) => {
		const action = this.scrollAction === ScrollAction.forward ? 1 : -1;
		let close = false;
		if (this.direction === "horizon") {
			close = this.xCoord * action > closePostion * action;
		}
		if (this.direction === "vertical") {
			close = this.yCoord * action > closePostion * action;
		}
		return close;
	};

	private stop = (stop: boolean) => {
		if (stop) {
			this.delaySetter(null);
		}
	};

	private triggerScroll = () => {
		const action = this.scrollAction === ScrollAction.forward ? 1 : -1;
		let stopPosition = 0;
		let closePosition = 0;
		let stop = false;
		if (this.direction === "horizon") {
			stopPosition = this.pageWidth * (-this.index + 1 * action);
			closePosition = stopPosition + -(this.scrollGap! * action);
			if (this.isClose(closePosition)) {
				this.xAxisSetter(stopPosition);
				stop = true;
			} else {
				this.scrollPageHandler();
			}
		}
		if (this.direction === "vertical") {
			stopPosition = this.pageHeight * (-this.index + 1 * action);
			closePosition = stopPosition + -(this.scrollGap! * action);
			if (this.isClose(closePosition)) {
				this.yAxisSetter(stopPosition);
				stop = true;
			} else {
				this.scrollPageHandler();
			}
		}
		this.stop(stop);
		if (stop) {
			this.indexSetter(this.index - action);
		}
	};

	private shouldTrigger = () => {
		let should = false;
		if (this.direction === "horizon") {
			if (this.scrollAction === ScrollAction.forward) {
				should =
					this.xCoord >
					-(this.pageWidth * this.index) + this.horizonTriggerPitch;
			}
			if (this.scrollAction === ScrollAction.backward) {
				should =
					this.xCoord <
					-(this.pageWidth * this.index) - this.horizonTriggerPitch;
			}
		}
		if (this.direction === "vertical") {
			if (this.scrollAction === ScrollAction.forward) {
				should =
					this.yCoord >
					-(this.pageHeight * this.index) + this.verticalTriggerPitch;
			}
			if (this.scrollAction === ScrollAction.backward) {
				should =
					this.yCoord <
					-(this.pageHeight * this.index) - this.verticalTriggerPitch;
			}
		}
		return should;
	};

	private setAction = (deltaX: number, deltaY: number) => {
		if (this.direction === "horizon") {
			if (deltaX > 0) this.scrollAction = ScrollAction.forward;
			if (deltaX < 0) this.scrollAction = ScrollAction.backward;
		}
		if (this.direction === "vertical") {
			if (deltaY < 0) this.scrollAction = ScrollAction.forward;
			if (deltaY > 0) this.scrollAction = ScrollAction.backward;
		}
	};

	private scrollPageHandler = () => {
		const action = this.scrollAction === ScrollAction.forward ? 1 : -1;
		if (this.direction === "horizon") {
			this.xAxisSetter(this.xCoord + this.scrollGap! * action);
			this.xCoord = this.xCoord + this.scrollGap! * action;
		}
		if (this.direction === "vertical") {
			this.yAxisSetter(this.yCoord + this.scrollGap! * action);
			this.yCoord = this.yCoord + this.scrollGap! * action;
		}
	};

	getCallback = (
		top: number,
		left: number,
		pageIndex: number,
		deltaX: number,
		deltaY: number
	): Function | null => {
		this.setting(top, left, pageIndex);
		this.setAction(deltaX, deltaY);
		let cb = null;
		if (!this.shouldScroll()) return cb;
		if (this.shouldTrigger()) {
			cb = this.triggerScroll;
		} else {
			this.scrollPageHandler();
		}
		return cb;
	};
}

export default ScrollHelper;
