const { App } = require("@slack/bolt");

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

bot.command("/ferie", async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
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
              text: `Ciao *${capitalizeName(body.user_name)}* 😊🏖️`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "holiday-date-init",
            element: {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "Seleziona una data",
                emoji: true,
              },
              action_id: "datepicker-action-init",
            },
            label: {
              type: "plain_text",
              text: "Inserisci la data del tuo primo giorno di ferie 😎",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "holiday-date-end",
            element: {
              type: "datepicker",
              placeholder: {
                type: "plain_text",
                text: "Seleziona una data",
                emoji: true,
              },
              action_id: "datepicker-action-end",
            },
            label: {
              type: "plain_text",
              text: "Inserisci la data del tuo ultimo giorno di ferie 🥲",
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "holiday-pm",
            element: {
              type: "multi_users_select",
              placeholder: {
                type: "plain_text",
                text: "Seleziona PM",
                emoji: true,
              },
              action_id: "multi_users_select-action",
            },
            label: {
              type: "plain_text",
              text: "Inserisci il/i PM a cui richiedi le ferie 🤞",
              emoji: true,
            },
          },
        ],
        callback_id: "view_submission",
      },
    });
  } catch (error) {
    console.error(error);
  }
});

bot.view("view_submission", async ({ ack, body, view, client }) => {
  // Acknowledge the view_submission event
  await ack();

  console.log("view", view.state.values);

  // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

  // Assume there's an input block with `block_1` as the block_id and `input_a`
  // const val = view['state']['values']['block_1']['input_a'];
  const user = body["user"]["id"];

  // // Message to send user
  let msg = `Ciao ${view.state.values["holiday-pm"]}, ${body.user_name} vorebbe prendersi delle ferie da: ${view.state.values["holiday-date-init"]} a ${view.state.values["holiday-date-end"]}`;
  // // Save to DB
  // const results = await db.set(user.input, val);

  // if (results) {
  //   // DB save was successful
  //   msg = 'Your submission was successful';
  // } else {
  //   msg = 'There was an error with your submission';
  // }

  // Message the user
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg,
    });
  } catch (error) {
    console.error(error);
  }
});

function capitalizeName(name) {
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
