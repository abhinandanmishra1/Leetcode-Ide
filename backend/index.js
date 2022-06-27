const express = require("express");
const { generateFile } = require("./generateCodeFile");
const { executeCode } = require("./executeCodeFile");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/", (req, res) => {
	return res.json({ hello: "world" });
});

app.post("/run", async (req, res) => {
	const { language, code, testInput } = req.body;
	if (code === undefined) {
		return res.status(400).json({ success: false, error: "Empty code Body" });
	}
	// generate a "code file" from the code
	// then compile that cpp file
	// get output
	try {
		const filePath = await generateFile(language, code);
		const output = await executeCode(filePath, language);
		return res.json({ filePath, output });
	} catch (err) {
		res.status(500).json({ err });
	}
});

app.listen(5000, () => {
	console.log("Listening on port 5000");
});
