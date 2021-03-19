const { App } = require("@slack/bolt");

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

bot.command("/ferie", async ({ ack, body, client }) => {
  await ack();

  try {
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Richiesta Ferie",
          emoji: true,
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: `Ciao ${capitalizeLetter(body.user_name)}`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Pick a date for the deadline.",
            },
            accessory: {
              type: "datepicker",
              initial_date: "1990-04-28",
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "datepicker-action",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Pick a date for the deadline.",
            },
            accessory: {
              type: "datepicker",
              initial_date: "1990-04-28",
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "datepicker-action",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Test block with multi conversations select",
            },
            accessory: {
              type: "multi_conversations_select",
              placeholder: {
                type: "plain_text",
                text: "Select conversations",
                emoji: true,
              },
              action_id: "multi_conversations_select-action",
            },
          },
        ],
      },
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

function capitalizeLetter(name) {
  let capitalName = name.split(".", 1)[0];
  console.log(capitalName);
  capitalName = capitalName.charAt(0).toUpperCase() + capitalName.slice(1);

  return capitalName;
}

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
