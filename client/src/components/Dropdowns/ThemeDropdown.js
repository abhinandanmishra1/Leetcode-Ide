import React from 'react'
import Select from "react-select";
import { defineTheme } from "../../lib/defineTheme"

import monacoThemes from "monaco-themes/themes/themelist";

export default function ThemeDropdown({theme,setTheme}) {
	function handleThemeChange(th) {
		const theme = th;
		if (["light", "vs-dark"].includes(theme.value)) {
			setTheme(theme);
		} else {
			defineTheme(theme.value).then((_) => setTheme(theme.value));
		}
	}
  return (
    <Select
					placeholder={theme}
					options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
						label: themeName,
						value: themeId,
						key: themeId,
					}))}
					value={theme.value}
					className="w-full"
					onChange={handleThemeChange}
				/>
  )
}
