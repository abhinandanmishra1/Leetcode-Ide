import React from "react";
import { cppBoiler, jsBoiler, pyBoiler } from "../../boilerCodes/boilerPlate";
import monacoThemes from "monaco-themes/themes/themelist";
import { defineTheme } from "../../lib/defineTheme";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({
	language,
	setLanguage,
	setCode,
	setTheme,
	theme,
	handleSubmit,
}) => {
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
		<div className="ml-2 mt-2 w-full flex h-8 md:h-12 justify-between mb-2">
			<button
				onClick={handleSubmit}
				className="bg-[#5cb85c] border-[#4cae4c] border-1 text-white rounded-full md:p-2 p-1 w-32 text-sm md:text-base hover:border-[#398439] hover:bg-[#449d44] ">
				<FontAwesomeIcon
					icon={faPlayCircle}
					className="mr-2"
					color="white"
					size="sm"
				/>
				<span>Run Code</span>
			</button>
			<div className="flex md:w-1/3 w-1/2 justify-around">
				<Select
					placeholder={language.label}
					options={languageOptions}
					value={language.value}
					className="w-1/3"
					onChange={(e) => {
						setLanguage(e);
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
					placeholder={theme}
					options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
						label: themeName,
						value: themeId,
						key: themeId,
					}))}
					value={theme.value}
					className="w-1/2	"
					onChange={handleThemeChange}
				/>
			</div>
		</div>
	);
};

export default Navbar;
