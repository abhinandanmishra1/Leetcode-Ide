import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ theme, code, setCode, language }) => {
	function handleEditorDidMount(editor, monaco) {
		editor.updateOptions({
			// lineNumbers: "off",
			fontSize: "20px",
			mouseWheelZoom: true,
		});
		console.log(monaco.editor.EditorOption);
	}
	return (
		<Editor
			height="95vh"
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
			className="text-3xl"
			defaultValue="//Write your code here"
			onMount={handleEditorDidMount}
			onChange={(value) => setCode(value)}
		/>
	);
};

export default CodeEditor;
