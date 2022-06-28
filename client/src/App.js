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
	const [language, setLanguage] = useState("cpp");
	const [testInput, setTestInput] = useState("");
	const [theme, setTheme] = useState("cobalt");
	const handleSubmit = async () => {
		const payload = {
			language,
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
		<div className="m-4 h-screen w-full">
			<h1>Leetcode Ide</h1>
			<div className="flex">
				<div className="flex flex-col w-2/3">
					<Navbar
						setLanguage={setLanguage}
						language={language}
						setCode={setCode}
					/>
					<div>
						<CodeEditor
							theme={theme}
							code={code}
							setCode={setCode}
							language={language}
						/>
					</div>
				</div>
				<div className="w-1/3 flex flex-col m-2">
					<CodeOutput output={output} />
					<CodeInput testInput={testInput} setTestInput={setTestInput} />
				</div>
			</div>
			<button onClick={handleSubmit}>Submit</button>
		</div>
	);
}

export default App;
