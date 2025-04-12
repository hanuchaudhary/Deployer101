const { exec } = require("child_process");
const path = require("path");

const init = () => {
  console.log("Initializing build server...");
  const outputDir = path.join(__dirname, "output");

  const p = exec(`cd ${outputDir} && npm install && npm run build`);
  p.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  p.stdout.on("error", (data) => {
    console.error("error", data.toString());
  });

  p.stdout.on("close", async (code) => {
    if (code !== 0) {
      console.error(`Build process exited with code ${code}`);
      return;
    }
    console.log("Build process completed successfully.");
  });
};
