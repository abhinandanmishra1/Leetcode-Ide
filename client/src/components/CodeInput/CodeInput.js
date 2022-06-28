import React from "react";

const CodeInput = ({ testInput, setTestInput }) => {
	return (
		<div className="flex flex-col m-2 mt-4">
			<label>Input</label>
			<textarea
				name=""
				id=""
				className="p-2"
				cols="30"
				rows="10"
				placeholder="Test case"
				value={testInput}
				onChange={(e) => setTestInput(e.target.value)}></textarea>
		</div>
	);
};

export default CodeInput;
