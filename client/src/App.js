import "./App.css";
import React, { useState } from "react";
import axios from "axios";
function App() {
	const [code, setCode] = useState("");
	const [output, setOutput] = useState("");
	const [language, setLanguage] = useState("cpp");
	const [testInput, setTestInput] = useState("cpp");
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
		<div className="App">
			<h1>Leetcode Ide</h1>
			<div>
				<label>Language :</label>
				<select onChange={(e) => setLanguage(e.target.value)} value={language}>
					<option value="cpp">C++</option>
					<option value="py">Python</option>
					<option value="js">JavaScript</option>
				</select>
			</div>
			<div>
				<textarea
					name=""
					id=""
					cols="80"
					rows="20"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="write your code here"></textarea>
			</div>
			<div>
				<textarea
					name=""
					id=""
					cols="30"
					rows="10"
					placeholder="Test case"
					value={testInput}
					onChange={(e) => setTestInput(e.target.value)}></textarea>
			</div>
			<button onClick={handleSubmit}>Submit</button>
			<p>{output}</p>
		</div>
	);
}

export default App;
