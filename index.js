const { App } = require("@slack/bolt");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

bot.command("/ferie", async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
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
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*PS:* _Se stai lavorando in consulenza non dimeticarti di consultare il tuo referente esterno, prima di richeidere le ferie_ ✌️",
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
  const user = await client.users.list();

  const userClient = user.members.find((member) => member.id === body.user.id);

  const pmUser = user.members.find(
    (member) =>
      member.id ===
      viewBlock["holiday-pm"]["pm_select-action"].selected_users[0]
  );

  const userInfo = {
    selectedPms: viewBlock["holiday-pm"]["pm_select-action"].selected_users,
    currentPm: pmUser,
    user: userClient,
    startDate:
      viewBlock["holiday-date-init"]["datepicker-action-init"].selected_date,
    endDate:
      viewBlock["holiday-date-end"]["datepicker-action-end"].selected_date,
  };

  acceptRefuseHoliday(client, userInfo);
});

bot.action("accept_refuse", async ({ ack, payload, body, client }) => {
  await ack();

  updateChat(client, body);

  const selectedOption = JSON.parse(payload.selected_option.value);

  const pms = selectedOption.pms.split(",");
  const users = await client.users.list();

  pms.shift();

  const holidayuser = users.members.find(
    (member) => member.id === selectedOption.user
  );

  if (pms.length) {
    const currentPm = users.members.find((member) => member.id === pms[0]);
    const userInfo = {
      selectedPms: pms,
      currentPm: currentPm,
      user: holidayuser,
      startDate: selectedOption.sd,
      endDate: selectedOption.ed,
    };
    acceptRefuseHoliday(client, userInfo);
  } else {
    const userInfo = {
      user: holidayuser,
      startDate: selectedOption.sd,
      endDate: selectedOption.ed,
    };

    createCalendarEvent(userInfo);

    const pmUser = users.members.find((member) => member.id === body.user.id);

    notifyResponse(client, pmUser, selectedOption);
  }
});

async function acceptRefuseHoliday(client, userInfo) {
  const msg = `Ciao *${userInfo.currentPm.real_name}*, *${userInfo.user.real_name}* vorrebbe prendersi delle ferie da: ${userInfo.startDate} a ${userInfo.endDate}`;

  try {
    await client.chat.postMessage({
      channel: userInfo.currentPm.id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: msg,
          },
          accessory: {
            type: "radio_buttons",
            action_id: "accept_refuse",
            options: [
              {
                value: `{ 
                  "response": true, "sd": "${userInfo.startDate}", "ed": "${userInfo.endDate}", "pms": "${userInfo.selectedPms}", "user": "${userInfo.user.id}"
                }`,
                text: {
                  type: "plain_text",
                  text: "Accetta",
                },
              },
              {
                value: `{ 
                  "response": false, "sd": "${userInfo.startDate}", "ed": "${userInfo.endDate}", "pms": "${userInfo.selectedPms}", "user": "${userInfo.user.id}"
                }`,
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

async function updateChat(client, body) {
  const selectedOption = JSON.parse(body.actions[0].selected_option.value);
  const users = await client.users.list();
  const holidayuser = users.members.find(
    (member) => member.id === selectedOption.user
  );

  const message = `Grazie, ho registrato la risposta! Hai ${
    selectedOption.response ? "accettato" : "rifiutato"
  } le ferie di ${holidayuser.real_name} dal ${selectedOption.sd} al ${
    selectedOption.ed
  }`;

  try {
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message,
          },
        },
      ],
      attachments: [
        {
          actions: [],
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
}

async function notifyResponse(client, pmUser, selectedOption) {
  const acceptMessage = `Le tue ferie sono state accettate. 🥳🏆`;
  const refuseMessage = `Le tue ferie sono state rifiutate. Per favore contatta *${pmUser.real_name}*, in modo da capirne il motivo e riprogrammarti le ferie. Grazie👋`;

  await client.chat.postMessage({
    channel: selectedOption.user,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            selectedOption.response === true ? acceptMessage : refuseMessage,
        },
      },
    ],
  });
}

function capitalize(name) {
  let capital = name.split(".", 1)[0];
  capital = capital.charAt(0).toUpperCase() + capital.slice(1);

  return capital;
}

function createCalendarEvent(userInfo) {
  const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    authorize(JSON.parse(content), listEvents);
  });

  function authorize(credentials, callback) {
    const TOKEN_PATH = "token.json";
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  function getAccessToken(oAuth2Client, callback) {
    const TOKEN_PATH = "token.json";
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
          if (error) return console.error(error);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  function listEvents(auth) {
    const calendar = google.calendar({ version: "v3", auth });

    const event = {
      summary: `Ferie ${userInfo.user.real_name}`,
      description: `${userInfo.user.real_name} è in ferie 😊🏖️`,
      start: {
        date: `${userInfo.startDate}`,
        timeZone: "Europe/Amsterdam",
      },
      end: {
        date: `${userInfo.endDate}`,
        timeZone: "Europe/Amsterdam",
      },
    };

    calendar.events.insert(
      {
        calendarId: "166es9g3ipji45cuk4fobo8msc@group.calendar.google.com",
        resource: event,
      },
      (err) => {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
        }
      }
    );
  }

  module.exports = {
    SCOPES,
    listEvents,
  };
}

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
