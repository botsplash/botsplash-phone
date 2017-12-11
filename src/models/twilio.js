const SlackAPIWrapper = require('slack-node');

// initializes Slack
const webhookUri = process.env.SLACK_WEBHOOK_URI;
const apiToken = process.env.SLACK_API_TOKEN;
const slack = new SlackAPIWrapper(apiToken);
slack.setWebhook(webhookUri);

// initializes Twilio
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function parseMessage(bodyText) {
  const body = bodyText.replace(/\+1/gi, '');
  if (body.length < 22) {
    return {
      success: false,
      error: 'Message to short'
    };
  }

  const fromNumber = body.slice(0, 10);
  console.log('fromNumber:test:', fromNumber);
  if (!(/^\d+$/g.test(fromNumber))) {
    return {
      success: false,
      error: 'Invalid FROM phone number.  It should be START of the message'
    }
  }

  const toNumber = body.slice(11, 21);
  console.log('toNumber:test:', toNumber);
  if (!(/^\d+$/g.test(toNumber))) {
    return {
      success: false,
      error: 'Invalid TO phone number.  It should be after FROM number in the message'
    }
  }

  const message = body.slice(21);

  return {
    success: true,
    fromNumber,
    toNumber,
    message
  };
}

module.exports = {
  sendToTwilio: (req, res) => {
    const bodyText = req.body.text.trim();
    const result = parseMessage(bodyText);
    console.log('sendToTwilio:result:', result);
    if (result.success) { 
      client.messages.create({
        to: result.toNumber,
        from: result.fromNumber,
        body: result.message,
      },
        (error) => {
          if (error) {
            res.send('Error: unable to send message');
            console.log('Error: unable to send message:', error);
          }
        }
      );

      // Post SMS message to Slack to show running conversation thread
      slack.webhook(
        {
          channel: '#twilio',
          username: req.body.user_name,
          icon_emoji: ':boom:',
          text: `Sent message from ${result.fromNumber} to ${result.toNumber}: \`\`\`${result.message}\`\`\``,
        },
        () => { }
      );

      res.status(200).send('Message sent successfully.');
    } else {
      slack.webhook(
        {
          channel: '#twilio',
          username: req.body.user_name,
          icon_emoji: ':boom:',
          text: `Error sending message: ${result.error || 'Uknonwn'}: \`\`\`${bodyText}\`\`\``,
        },
        () => { }
      );

      res.status(200).send(`Error sending message: ${result.error || 'Uknonwn'}`);
    }

    res.end();
  },
};
