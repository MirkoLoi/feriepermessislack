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
              type: "mrkdwn",
              text: `Ciao *${capitalizeLetter(body.user_name)}* 😊🏖️`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Inserisci la data del tuo primo giorno di ferie 😎",
            },
            accessory: {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "Seleziona una data",
                emoji: true,
              },
              action_id: "datepicker-action-init",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Inserisci la data del tuo ultimo giorno di ferie 🥲",
            },
            accessory: {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "Seleziona una data",
                emoji: true,
              },
              action_id: "datepicker-action-end",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Inserisci il/i PM a cui richiedi le ferie 🤞",
            },
            accessory: {
              type: "multi_conversations_select",
              placeholder: {
                type: "plain_text",
                text: "Seleziona PM",
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
