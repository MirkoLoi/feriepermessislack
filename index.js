const { App } = require('@slack/bolt');

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});


bot.command('/ferie',async ({ command, ack, say }) => {

    await ack();

    await say(`${command.text}, Hai richiesto delle ferie`);

});

bot.message('hello', async ({ message, say }) => {
    await say(`Ciao <@${message.user}> :wave:`);
  });

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

})();