import React from "react";

const CodeOutput = ({ output, toggled, status }) => {
	return (
		<div
			className={`flex flex-col overflow-hidden bg-gray-100 p-4 h-64 w-1/2 md:w-full ${
				toggled ? "md:h-full" : "md:h-4/6"
			}`}>
			<label className="flex text-xl border-b-2 border-gray-200 pb-4 font-semibold text-gray-600">
				Output:{" "}
				{status && (
					<span
						className={`ml-2 block w-28 font-bold text-base text-center rounded-full text-white p-1 ${
							(status === "Running" && "bg-[#0088cc]") ||
							(status === "Finished" && "bg-[#5cb85c]") ||
							(status === "Compile Error" && "bg-[#d9534f]") ||
							(status === "Server Error" && "bg-[#FFC300]")
						} `}>
						{status}
					</span>
				)}
			</label>
			<div className="w-full h-full flex flex-col p-2 overflow-y-auto">
				{output.split("\r\n").map((line, index) => (
					<samp key={index}>{line}</samp>
				))}
			</div>
		</div>
	);
};

export default CodeOutput;
