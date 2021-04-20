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
              text: `Ciao *${capitalize(body.user_name)}* 😊🏖️`,
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
              action_id: "pm_select-action",
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
  await ack();

  const viewBlock = view.state.values;

  let user = await client.users.list();
  const pmUser = user.members.find(
    (member) =>
      member.id ===
      viewBlock["holiday-pm"]["pm_select-action"].selected_users[0]
  );
  const userClient = user.members.find((member) => member.id === body.user.id);

  // // Message to send user
  let msg = `Ciao *${capitalize(pmUser.name)}*, *${
    userClient.real_name
  }* vorrebbe prendersi delle ferie da: ${
    viewBlock["holiday-date-init"]["datepicker-action-init"].selected_date
  } a ${viewBlock["holiday-date-end"]["datepicker-action-end"].selected_date}`;

  acceptRefuseHoliday(client, viewBlock, msg);
});

bot.action("accept_refuse", async ({ ack, payload, body, client }) => {
  await ack();

  try {
    await client.chat.update({
      channel: body.channel.id,
      ts: body.actions[0].action_ts,
      text: "updated",
      message: {
        text: "updated",
        username: "Slack API Tester",
        bot_id: "B4X35D333",
        type: "message",
        subtype: "bot_message",
      },
    });
  } catch (error) {
    console.error(error);
  }

  console.log(JSON.parse(payload.selected_option.value));
});

function capitalize(name) {
  let capital = name.split(".", 1)[0];
  capital = capital.charAt(0).toUpperCase() + capital.slice(1);

  return capital;
}

async function acceptRefuseHoliday(client, valueBlock, message) {
  try {
    await client.chat.postMessage({
      channel: valueBlock["holiday-pm"]["pm_select-action"].selected_users[0],
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message,
          },
          accessory: {
            type: "radio_buttons",
            action_id: "accept_refuse",
            options: [
              {
                value: `{ 
                  "response": "si", "sd": "${valueBlock["holiday-date-init"]["datepicker-action-init"].selected_date}", "ed": "${valueBlock["holiday-date-end"]["datepicker-action-end"].selected_date}", "pms": "${valueBlock["holiday-pm"]["pm_select-action"].selected_users}"
                }`,
                text: {
                  type: "plain_text",
                  text: "Accetta",
                },
              },
              {
                value: `{"response": "no",}`,
                text: {
                  type: "plain_text",
                  text: "Rifiuta",
                },
              },
            ],
          },
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
