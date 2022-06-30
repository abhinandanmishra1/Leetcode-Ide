import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquareCaretUp,
	faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";
const CodeInput = ({ testInput, setTestInput, setToggled }) => {
	const [toggleInputBar, setToggleInputBar] = useState(true);

	return (
		<div
			className={`flex flex-col justify-end w-1/2 md:w-full bg-gray-100 h-64 ${
				toggleInputBar ? "md:h-16" : "md:h-1/3"
			}`}>
			<button
				className="flex ml-0 items-center bg-gray-200 pt-2 pr-2 rounded-md text-base justify-center w-16"
				onClick={() => {
					setToggleInputBar(!toggleInputBar);
					setToggled(!toggleInputBar);
				}}>
				stdin{" "}
				<FontAwesomeIcon
					icon={toggleInputBar ? faSquareCaretUp : faSquareCaretDown}
					size="xs"
					className="ml-1"
				/>
			</button>
			<textarea
				name=""
				id=""
				className={`p-2 outline-none border-none bg-white ${
					toggleInputBar ? "hidden" : ""
				}`}
				cols="30"
				rows="15"
				placeholder=""
				value={testInput}
				onChange={(e) => setTestInput(e.target.value)}></textarea>
		</div>
	);
};

export default CodeInput;
