import React from "react";
import { cppBoiler, jsBoiler, pyBoiler } from "../../boilerCodes/boilerPlate";
const Navbar = ({ language, setLanguage, setCode }) => {
	return (
		<div>
			<label>Language :</label>
			<select
				onChange={(e) => {
					setLanguage(e.target.value);
					const boiler =
						e.target.value === "cpp"
							? cppBoiler
							: e.target.value === "py"
							? pyBoiler
							: jsBoiler;
					setCode(boiler);
				}}
				value={language}>
				<option value="cpp">C++</option>
				<option value="py">Python</option>
				<option value="js">JavaScript</option>
			</select>
		</div>
	);
};

export default Navbar;
