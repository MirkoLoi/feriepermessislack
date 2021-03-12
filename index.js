const { App } = require('@slack/bolt');

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

bot.event("app_mention", async ({ context, event }) => {

    console.log(context, event)
  try{
    await say(`Hey yoo <@${event.user}> you mentioned me`);
  }
  catch (e) {
    console.log(`error responding ${e}`);
  }

});

bot.message('hello', async ({ message, say }) => {
    await say(`Ciao <@${message.user}> :wave:`);
  });

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

})();