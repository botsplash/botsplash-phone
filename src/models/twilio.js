const SlackAPIWrapper = require('slack-node');

// initializes Slack
const webhookUri = process.env.SLACK_WEBHOOK_URI;
const apiToken = process.env.SLACK_API_TOKEN;
const slack = new SlackAPIWrapper(apiToken);
slack.setWebhook(webhookUri);

// initializes Twilio
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = {
  sendToTwilio: (req, res) => {
    const messageToSend = req.body.text;
    const numberToSend = req.body.channel_name;
    // pops off the prepended #sms in Slack
    const numberToSendSerialized = numberToSend.slice(3);

    let bodyText = req.body.text;   
    let fromNumber = process.env.TWILIO_NUMBER;
    const bodyLen = req.body.text.length;
    if (bodyLen > 10) {
      const bodyEnd = req.body.text.slice(bodyLen-10, bodyLen);
      console.log('bodyEnd:', bodyEnd);
      if (/^\d+$/g.test(bodyEnd)) {
        fromNumber = bodyEnd;
        bodyText = req.body.text.slice(0, bodyLen - 10);
      }
    }
    console.log('sendToTwilio:', fromNumber, 'body:', bodyText);

    client.messages.create({
      to: numberToSendSerialized,
      from: fromNumber,
      body: bodyText,
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
        channel: `#${req.body.channel_name}`,
        username: req.body.user_name,
        icon_emoji: ':boom:',
        text: `${bodyText} from ${fromNumber}`,
      },
      () => { }
    );
    res.status(200).send('Message sent successfully.');
    res.end();
  },
};
