import React from "react";
import ScrollPage from "./ScrollPage";

const App: React.FC = () => {
	return (
		<div className="app">
			<div className="sroll-test">
				<ScrollPage direction="horizon" singlePageItemCount={1} scrollGap={5}>
					<div className="section1 section"></div>
					<div className="section2 section"></div>
					<div className="section3 section"></div>
					<div className="section4 section"></div>
					<div className="section5 section"></div>
					<div className="section6 section"></div>
					<div className="section7 section"></div>
				</ScrollPage>
			</div>
		</div>
	);
};

export default App;
