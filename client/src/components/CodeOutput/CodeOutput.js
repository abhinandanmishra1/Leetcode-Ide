import React from "react";
import TextareaAutosize from "react-textarea-autosize";

const CodeOutput = ({ output }) => {
	return (
		<div className="flex flex-col h-2/3 m-2">
			<label>Output</label>
			<TextareaAutosize
				className="w-full min-h-full bg-gray-100"
				value={output}
				disabled
			/>
		</div>
	);
};

export default CodeOutput;
