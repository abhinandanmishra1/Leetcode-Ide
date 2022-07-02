import "./App.css";
import React, { useState } from "react";
import axios from "axios";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import CodeOutput from "./components/CodeOutput/CodeOutput";
import CodeInput from "./components/CodeInput/CodeInput";
import Navbar from "./components/Navbar/Navbar";
import { cppBoiler } from "./boilerCodes/boilerPlate";

function App() {
	const [code, setCode] = useState(cppBoiler);
	const [output, setOutput] = useState("");
	const [language, setLanguage] = useState({
		label: "C++",
		value: "cpp",
	});
	const [toggled, setToggled] = useState(true);
	const [testInput, setTestInput] = useState("");
	const [theme, setTheme] = useState("vs-dark");
	const [status, setStatus] = useState(null);
	const handleSubmit = async () => {
		const payload = {
			language: language.value,
			code,
			testInput,
		};
		const url = "http://localhost:5000/run";
		try {
			const { data } = await axios.post(url, payload);
			setOutput(data.output);
			// console.log(data.output);
			setStatus("Finished");
		} catch ({ response }) {
			if (response) {
				const error = response.data.err.stderr;
				setOutput(error);
				console.log(response);
				setStatus("Compile Error");
			} else {
				setStatus("Server Error");
				setOutput("Error connecting with the Server!");
			}
		}
	};
	return (
		<div className="h-screen w-full">
			<div className="flex md:flex-row flex-col h-full w-full">
				<div className="flex h-full flex-col md:w-2/3 w-full ">
					<Navbar
						setLanguage={setLanguage}
						language={language}
						setCode={setCode}
						setTheme={setTheme}
						theme={theme}
						handleSubmit={handleSubmit}
						setStatus={setStatus}
					/>

					<CodeEditor
						theme={theme}
						code={code}
						setCode={setCode}
						language={language}
					/>
				</div>
				<div className="md:w-1/3 border-l-1 border-gray-200 flex w-full md:flex-col flex-row-reverse h-full">
					<CodeOutput output={output} toggled={toggled} status={status} />
					<CodeInput
						testInput={testInput}
						setTestInput={setTestInput}
						setToggled={setToggled}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
