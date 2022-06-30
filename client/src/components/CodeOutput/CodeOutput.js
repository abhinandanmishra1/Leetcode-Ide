import React from "react";
import TextareaAutosize from "react-textarea-autosize";

const CodeOutput = ({ output, toggled }) => {
	return (
		<div
			className={`flex flex-col bg-gray-100 p-4 w-1/2 md:w-full ${
				toggled ? "h-full" : "h-4/6"
			}`}>
			<label className="flex text-xl border-b-2 border-gray-200">Output</label>
			<TextareaAutosize
				className="w-full min-h-full max-h-screen "
				value={output}
				disabled
			/>
		</div>
	);
};

export default CodeOutput;
