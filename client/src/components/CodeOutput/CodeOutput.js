import React from "react";

const CodeOutput = ({ output, toggled, status }) => {
	const getOutput = () => {
    let statusId = output?.status?.id;

    if (statusId === 6) {
      return (
        <pre className="px-2 py-1 font-normal text-sm text-red-500">
          {atob(output?.compile_output)}
        </pre>
      );
    } else if (statusId === 3) {
			console.log("finished",output.time)
      return (
				<>
				{output && <span className="text-[#5cb85c] font-mono text-sm px-2">Finised in {parseInt(output.time*100)} ms </span> }
        <pre className="px-2 py-2 font-mono text-sm ">
          {atob(output.stdout) !== null
            ? `${atob(output.stdout)}`
            : null}
        </pre>
				</>
      );
    } else if (statusId === 5) {
      return (
        <pre className="px-2 py-1 font-normal text-sm text-red-500">
          {`Time Limit Exceeded`}
        </pre>
      );
		} else {
      return (
        <pre className="px-2 py-1 font-normal text-sm text-red-500">
          {atob(output?.stderr)}
        </pre>
      );
    }
  };
	return (
		<div
			className={`flex flex-col overflow-hidden bg-gray-100 p-4 h-64 w-1/2 md:w-full ${
				toggled ? "md:h-full" : "md:h-4/6"
			}`}>
			<label className="flex text-lg border-b-2 border-gray-200 pb-4  text-gray-600">
				Output:{" "}
				{status && (
					<span
						className={`ml-2 block w-28 font-bold text-base text-center rounded-full text-white p-1 ${
							status === "Running" ? "bg-[#0088cc]" : "bg-[#5cb85c]"
						} `}>
						{status}
					</span>
				)}
			</label>
			<div className="w-full h-full flex flex-col p-2 overflow-y-auto">
				 {output ? <>{getOutput()}</> : null}
			</div>
		</div>
	);
};

export default CodeOutput;
