import React from "react";
import { cppBoiler, jsBoiler, pyBoiler } from "../../boilerCodes/boilerPlate";
import monacoThemes from "monaco-themes/themes/themelist";
import { defineTheme } from "../../lib/defineTheme";
import Select from "react-select";
const Navbar = ({ language, setLanguage, setCode, setTheme, theme }) => {
	function handleThemeChange(th) {
		const theme = th;
		console.log("theme...", theme);

		if (["light", "vs-dark"].includes(theme.value)) {
			setTheme(theme);
		} else {
			defineTheme(theme.value).then((_) => setTheme(theme.value));
		}
	}
	const languageOptions = [
		{
			label: "Javascript",
			value: "js",
		},
		{
			label: "C++",
			value: "cpp",
		},
		{
			label: "Python",
			value: "py",
		},
	];
	return (
		<div className="flex">
			<Select
				placeholder={language.label}
				options={languageOptions}
				value={language.value}
				className="w-1/3"
				onChange={(e) => {
					setLanguage(e.value);
					const boiler =
						e.value === "cpp"
							? cppBoiler
							: e.value === "py"
							? pyBoiler
							: jsBoiler;
					setCode(boiler);
				}}
			/>
			<Select
				placeholder={"Cobalt"}
				options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
					label: themeName,
					value: themeId,
					key: themeId,
				}))}
				value={theme.value}
				className="w-1/3"
				onChange={handleThemeChange}
			/>
		</div>
	);
};

export default Navbar;
