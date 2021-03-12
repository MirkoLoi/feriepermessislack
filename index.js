const { App } = require('@slack/bolt');

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

bot.event("app_mention", async ({ context, event }) => {

  try{
    await bot.client.chat.postMessage({
    token: context.botToken,
    channel: event.channel,
    text: `Hey yoo <@${event.user}> you mentioned me`
  });
  }
  catch (e) {
    console.log(`error responding ${e}`);
  }

});

bot.message('hello', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say({
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Hey there <@${message.user}>!`
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Click Me"
            },
            "action_id": "button_click"
          }
        }
      ],
      text: `Hey there <@${message.user}>!`
    });
  });

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

})();