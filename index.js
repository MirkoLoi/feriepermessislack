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

  // let user = await client.users.list();
  // user = user.members.find(
  //   (member) =>
  //     member.id ===
  //     viewBlock["holiday-pm"]["pm_select-action"].selected_users[0]
  // );

  // // Message to send user
  let msg = `Ciao ${capitalizeName(user.name)}, ${capitalizeName(
    body.user.username
  )} vorebbe prendersi delle ferie da: ${
    viewBlock["holiday-date-init"]["datepicker-action-init"].selected_date
  } a ${viewBlock["holiday-date-end"]["datepicker-action-end"].selected_date}`;

  //acceptRefuseHoliday(client, viewBlock, msg)
});

function capitalizeName(name) {
  let capitalName = name.split(".", 1)[0];
  capitalName = capitalName.charAt(0).toUpperCase() + capitalName.slice(1);

  return capitalName;
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
            action_id: "this_is_an_action_id",
            options: [
              {
                value: "SI",
                text: {
                  type: "plain_text",
                  text: "Accetta",
                },
              },
              {
                value: "NO",
                text: {
                  type: "plain_text",
                  text: "Rifiuta",
                },
              },
            ],
          },
        },
      ],
      attachments: {
        text: "Ciaoooooooo",
      },
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
