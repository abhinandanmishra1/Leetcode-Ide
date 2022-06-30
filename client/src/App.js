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
	const [toggled, setToggled] = useState(false);
	const [testInput, setTestInput] = useState("");
	const [theme, setTheme] = useState("vs-dark");
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
			console.log(data.output);
		} catch ({ response }) {
			if (response) {
				const error = response.data.err.stderr;
				setOutput(error);
			} else {
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
					/>

					<CodeEditor
						theme={theme}
						code={code}
						setCode={setCode}
						language={language}
					/>
				</div>
				<div className="md:w-1/3 flex w-full md:flex-col flex-row-reverse h-full md:m-0 mt-8">
					<CodeOutput output={output} toggled={toggled} />
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
