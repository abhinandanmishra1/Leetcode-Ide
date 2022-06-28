const path = require("path"); // for creating the path for each system - windows,linux,mac
const fs = require("fs"); // for creating the folder "codes"
const { v4: uuid } = require("uuid"); // v4 of uuid is imported as "uuid"(variable name)

// uuid is used to create unique fileName
const codeDir = path.join(__dirname, "codes");
const outputDir = path.join(__dirname, "outputs");
if (!fs.existsSync(codeDir)) {
	fs.mkdirSync(codeDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

const generateCodeFile = async (format, code) => {
	const jobId = uuid();
	const fileName = `${jobId}.${format}`;
	const filePath = path.join(codeDir, fileName);
	await fs.writeFileSync(filePath, code);
	return filePath;
};
const generateInputFile = async (userInput) => {
	const fileName = `input.txt`;
	const codefilePath = path.join(outputDir, fileName);
	const outputfilePath = path.join(codeDir, fileName);
	await fs.writeFileSync(codefilePath, userInput);
	await fs.writeFileSync(outputfilePath, userInput);
	return codefilePath;
};

module.exports = {
	generateCodeFile,
	generateInputFile,
};
