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
		};
		const url = "http://localhost:5000/run";
		const { data } = await axios.post(url, payload);

		setOutput(data.output);
	};
	return (
		<div className="App">
			<h1>Leetcode Ide</h1>
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
					placeholder="Test case"></textarea>
			</div>
			<button onClick={handleSubmit}>Submit</button>
			<p>{output}</p>
		</div>
	);
}

export default App;
