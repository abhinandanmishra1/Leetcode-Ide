const path = require("path"); // for creating the path for each system - windows,linux,mac
const fs = require("fs"); // for creating the folder "codes"
const { v4: uuid } = require("uuid"); // v4 of uuid is imported as "uuid"(variable name)

// uuid is used to create unique fileName
const codeDir = path.join(__dirname, "codes");

if (!fs.existsSync(codeDir)) {
	fs.mkdirSync(codeDir, { recursive: true });
}

const generateFile = async (format, code) => {
	const jobId = uuid();
	const fileName = `${jobId}.${format}`;
	const filePath = path.join(codeDir, fileName);
	await fs.writeFileSync(filePath, code);
	return filePath;
};

module.exports = {
	generateFile,
};
