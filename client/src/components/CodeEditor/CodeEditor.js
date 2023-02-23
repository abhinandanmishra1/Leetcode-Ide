import React,{useEffect, useState} from "react";
import Editor from "@monaco-editor/react";

import { useWindowSize } from "../../Hook/windowSize";
import { handleEditorDidMount } from "../../utils/codeEditor.utils";

const CodeEditor = ({ theme, code, setCode, language }) => {
	const { width } = useWindowSize();
	const [editorHeight,setEditorHeight] = useState("95vh");

	useEffect(() => {
    if(width>768){
			setEditorHeight("95vh");
		}else{
			setEditorHeight("55vh");
		}
  }, [width]);

	return (
		<Editor
			height={editorHeight}
			width={`100%`}
			language={language}
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
