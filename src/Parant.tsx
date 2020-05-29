import React from "react";

type ParantProps = {};

const Parant: React.FC<ParantProps> = ({ children }) => {
	console.log(children);
	return <>{children}</>;
};

export default Parant;
