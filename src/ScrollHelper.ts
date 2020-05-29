type direction = "vertical" | "horizon";

enum scrollAction {
	"notYet",
	"forward",
	"backward",
}

class ScrollHelper {
	private pageWidth: number;
	private pageHeight: number;
	private verticalScrollTogglePitch: number;
	private horizonScrollTogglePitch: number;
	private pageIndex: number;
	private totalPageIndex: number;
	private direction: direction;
	private el: HTMLElement;
	private scrollGap: number;
	private stopCallback: Function;
	private setPageCallback: Function;
	private cleanCallback: Function;
	constructor(
		direction: direction,
		totalPageIndex: number,
		el: HTMLElement,
		gap: number,
		stopCallback: Function,
		setPageCallback: Function,
		cleanCallback: Function
	) {
		this.pageIndex = 0;
		this.pageWidth = 0;
		this.pageHeight = 0;
		this.verticalScrollTogglePitch = 0;
		this.horizonScrollTogglePitch = 0;
		this.totalPageIndex = totalPageIndex;
		this.direction = direction;
		this.el = el;
		this.scrollGap = gap;
		this.setPageCallback = setPageCallback;
		this.stopCallback = stopCallback;
		this.cleanCallback = cleanCallback;
		this.init();
	}

	private init = (): void => {
		const { offsetWidth, offsetHeight } = this.el;
		this.pageWidth = offsetWidth;
		this.pageHeight = offsetHeight;
		this.verticalScrollTogglePitch = offsetWidth / 2;
		this.horizonScrollTogglePitch = offsetHeight / 2;
	};

	private getTogglePosition = () => {
		let position = 0;
		const action = this.getAction();
		if (this.direction === "horizon") {
			if (action === scrollAction.forward) {
				position =
					this.pageIndex * this.pageWidth + this.horizonScrollTogglePitch;
			} else if (action === scrollAction.backward) {
				position =
					this.pageIndex * this.pageWidth - this.horizonScrollTogglePitch;
			}
		} else if (this.direction === "vertical") {
			if (action === scrollAction.forward) {
				position =
					this.pageIndex * this.pageWidth + this.verticalScrollTogglePitch;
			} else if (action === scrollAction.backward) {
				position =
					this.pageIndex * this.pageWidth - this.verticalScrollTogglePitch;
			}
		}
		return position;
	};

	private getAction = (): scrollAction => {
		let action = scrollAction.notYet;
		const pagePotition = this.pageIndex * this.pageWidth;
		if (this.getCurrentPosition() > pagePotition) {
			action = scrollAction.forward;
		} else if (this.getCurrentPosition() < pagePotition) {
			action = scrollAction.backward;
		}
		return action;
	};

	private getCurrentPosition = (): number => {
		let position = 0;
		if (this.direction === "horizon") {
			position = this.el.scrollLeft;
		} else if (this.direction === "vertical") {
			position = this.el.scrollTop;
		}
		return position;
	};

	private isShouldToggle = (): boolean => {
		let should = false;
		const action = this.getAction();
		if (action === scrollAction.forward) {
			should = this.getCurrentPosition() > this.getTogglePosition();
		} else if (action === scrollAction.backward) {
			should = this.getCurrentPosition() < this.getTogglePosition();
		}
		return should;
	};

	private isClose = () => {
		const action = this.getAction();
		let close = false;
		if (action === scrollAction.forward) {
			if (this.direction === "horizon") {
				close =
					this.getCurrentPosition() + this.scrollGap >=
					(this.pageIndex + 1) * this.pageWidth;
			} else if (this.direction === "vertical") {
				close =
					this.getCurrentPosition() + this.scrollGap >=
					(this.pageIndex + 1) * this.pageHeight;
			}
		} else if (action === scrollAction.backward) {
			if (this.direction === "horizon") {
				close =
					this.getCurrentPosition() - this.scrollGap <=
					(this.pageIndex - 1) * this.pageWidth;
			} else if (this.direction === "vertical") {
				close =
					this.getCurrentPosition() - this.scrollGap <=
					(this.pageIndex - 1) * this.pageHeight;
			}
		}
		return close;
	};

	getCallback = (pageIndex: number) => {
		this.pageIndex = pageIndex;
		if (!this.isShouldToggle()) return null;

		if (this.direction === "horizon") {
			return this.horizonScrollCallback;
		} else if (this.direction === "vertical") {
			return this.verticalScrollCallback;
		}
	};

	private horizonScrollCallback = () => {
		const action = this.getAction();
		if (action === scrollAction.forward) {
			this.el.scrollLeft = this.el.scrollLeft + this.scrollGap;
		} else if (action === scrollAction.backward) {
			this.el.scrollLeft = this.el.scrollLeft - this.scrollGap;
		}
		if (this.isClose()) {
			if (action === scrollAction.forward) {
				this.el.scrollLeft = (this.pageIndex + 1) * this.pageWidth;
				this.setPageCallback((prev: number) => prev + 1);
			} else if (action === scrollAction.backward) {
				this.el.scrollLeft = (this.pageIndex - 1) * this.pageWidth;
				this.setPageCallback((prev: number) => prev - 1);
			}
			this.stopCallback(null);
			this.cleanCallback(null);
		}
	};

	private verticalScrollCallback = () => {
		const action = this.getAction();
		if (action === scrollAction.forward) {
			this.el.scrollTop = this.el.scrollTop + this.scrollGap;
		} else if (action === scrollAction.backward) {
			this.el.scrollTop = this.el.scrollTop - this.scrollGap;
		}
		if (this.isClose()) {
			if (action === scrollAction.forward) {
				this.el.scrollTop = (this.pageIndex + 1) * this.pageHeight;
				this.setPageCallback((prev: number) => prev + 1);
			} else if (action === scrollAction.backward) {
				this.el.scrollTop = (this.pageIndex - 1) * this.pageHeight;
				this.setPageCallback((prev: number) => prev - 1);
			}
			this.stopCallback(null);
			this.cleanCallback(null);
		}
	};
}

export default ScrollHelper;
