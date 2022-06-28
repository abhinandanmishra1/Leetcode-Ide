import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ theme, code, setCode, language }) => {
	return (
		<Editor
			height="70vh"
			width={`100%`}
			language={
				(language === "py"
					? "python"
					: language === "js"
					? "javascript"
					: "cpp") || "cpp"
			}
			value={code}
			theme={theme}
			defaultValue="//Write your code here"
			onChange={(value) => setCode(value)}
		/>
	);
};

export default CodeEditor;
