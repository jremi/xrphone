const { execSync } = require("child_process");
const ngrok = require("ngrok");
const updateDotenv = require("update-dotenv");

async function generateNgrokUrl() {
  const url = await ngrok.connect(process.env.PORT || 3000);
  console.log(`Ngrok url: ${url}`);
  console.log("Ngrok ui: http://localhost:4040");
  execSync(
    `node ${__dirname}/autopilot-setup.js --updateActionsUrl ${url} --assistantName xrphone`
  );
  console.log(`\nTwilio urls updated!`);

  await updateDotenv({
    SERVER_URL: url,
  });
}

async function disconnectNgrokUrl() {
  await ngrok.disconnect();
  await ngrok.kill();
}

generateNgrokUrl();

// 1hr 59min ngrok refresh
// ngrok free (2 hr limit)
setInterval(async () => {
  await disconnectNgrokUrl();
  generateNgrokUrl();
}, 7140000);
