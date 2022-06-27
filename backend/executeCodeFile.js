const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const outputDir = path.join(__dirname, "outputs");
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}
const executeCode = (filePath) => {
	const jobId = path.basename(filePath).split(".")[0]; // basename will give us jobId.cpp
	console.log(jobId);
	const outputPath = path.join(outputDir, `${jobId}.out`);
	console.log(outputPath);
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

module.exports = {
	executeCode,
};
