const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const executeCpp = (filePath) => {
	const outputDir = path.join(__dirname, "outputs");
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	const jobId = path.basename(filePath).split(".")[0]; // basename will give us jobId.cpp
	const outputPath = path.join(outputDir, `${jobId}.out`);
	return new Promise((resolve, reject) => {
		exec(
			`g++ ${filePath} -o ${outputPath} && cd ${outputDir} && ${jobId}.out`,
			(error, stdout, stderr) => {
				error && reject({ error, stderr });
				stderr && reject(stderr);
				resolve(stdout);
			}
		);
	});
};

const executePython = (filePath) => {
	return new Promise((resolve, reject) => {
		exec(`python ${filePath}`, (error, stdout, stderr) => {
			error && reject({ error, stderr });
			stderr && reject(stderr);
			resolve(stdout);
		});
	});
};

const executeJavascript = (filePath) => {
	return new Promise((resolve, reject) => {
		exec(`node ${filePath}`, (error, stdout, stderr) => {
			error && reject({ error, stderr });
			stderr && reject(stderr);
			resolve(stdout);
		});
	});
};
const executeCode = (filePath, language) => {
	if (language === "cpp") {
		return executeCpp(filePath);
	} else if (language === "py") {
		return executePython(filePath);
	} else if (language === "js") {
		return executeJavascript(filePath);
	}
};

module.exports = {
	executeCode,
};
