/**
 * Example usage:
 *
 *    node utils/twilio/autopilot-setup.js --list --assistantName xrphone
 *    node utils/twilio/autopilot-setup.js --updateActionsUrl https://xxxxxxxxx.ngrok.io --assistantName xrphone
 */

require("dotenv").config({
  path: require("path").resolve(`${__dirname}`, "..", "..", ".env"),
});

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const assistantSid = getAssistantSid();

if (argv.list) {
  client.autopilot
    .assistants(assistantSid)
    .tasks.list({ limit: 999 })
    .then((tasks) => {
      tasks.forEach((t) => {
        console.log(
          `\nuniqueName:${t.uniqueName}\nactionsUrl:${t.actionsUrl}\nsid:${t.sid}\n`
        );
      });
    })
    .catch((err) => console.log("err", err));
} else if (argv.updateActionsUrl) {
  client.autopilot
    .assistants(assistantSid)
    .tasks.list({ limit: 999 })
    .then((tasks) => {
      for (let { sid } of tasks) {
        client.autopilot
          .assistants(assistantSid)
          .tasks(sid)
          .update({
            actionsUrl: `${argv.updateActionsUrl}/twilio/autopilot/tasks/action`,
          });
      }
    });
}

function getAssistantSid() {
  const autopilotAssistantSid =
    process.env[
      `TWILIO_AUTOPILOT_ASSISTANT_${argv.assistantName.toUpperCase()}_SID`
    ];
  if (!autopilotAssistantSid) {
    console.error(
      `🚫 Twilio Autopilot assistant (${argv.assistantName}) name was not found inside .env!`
    );
    process.exit(0);
  }
  return autopilotAssistantSid;
}
