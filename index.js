const { App } = require('@slack/bolt');

const bot = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});


bot.command('/ferie', async ({ command, ack, say }) => {

    await ack();

    console.log(command);

    await say({
        "blocks" : {
            "title": {
                "type": "plain_text",
                "text": "Add info to feedback",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Save",
                "emoji": true
            },
            "type": "modal",
            "blocks": [
                {
                    "type": "input",
                    "element": {
                        "type": "datepicker",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "datepicker-action"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Label",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    "element": {
                        "type": "datepicker",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "datepicker-action"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Label",
                        "emoji": true
                    }
                }
            ]
        }
    });

});

(async () => {
  // Start the app

  await bot.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

})();