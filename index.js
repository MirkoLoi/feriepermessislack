const { App } = require('@slack/bolt');

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  // Start the app
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

  await bot.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

})();