const SlackAPIWrapper = require('slack-node');
const Bandwidth = require('node-bandwidth');

// initializes Slack
const webhookUri = process.env.SLACK_WEBHOOK_URI;
const apiToken = process.env.SLACK_API_TOKEN;
const slack = new SlackAPIWrapper(apiToken);
slack.setWebhook(webhookUri);

// initializes Twilio
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const bandwidthClient = new Bandwidth({
  userId    : process.env.BANDWIDTH_USER_ID,
	apiToken  : process.env.BANDWIDTH_API_TOKEN,
  apiSecret : process.env.BANDWIDTH_API_SECRET
});

const bandwidthV2Client = new Bandwidth({
  userId    : process.env.BANDWIDTH_V2_USER_ID,
  apiToken  : process.env.BANDWIDTH_V2_API_TOKEN,
  apiSecret : process.env.BANDWIDTH_V2_API_SECRET
});

const providers = ['twilio', 'bandwidth', 'bandwidthv2'];

function parseMessage(bodyText) {
  const body = bodyText.replace(/\+1/gi, '').split(' ');
  const [ provider, fromNumber, toNumber ] = body;

  if (providers.indexOf(provider) === -1) {
    return {
      success: false,
      error: 'Invalid PROVIDER specified. Only "bandwidth" and "twilio" are supported'
    }
  }

  console.log('fromNumber:test:', fromNumber);
  if (!(/^\d{10}$/g.test(fromNumber))) {
    return {
      success: false,
      error: 'Invalid FROM phone number. It should be START of the message'
    }
  }

  console.log('toNumber:test:', toNumber);
  if (!(/^\d{10}$/g.test(toNumber))) {
    return {
      success: false,
      error: 'Invalid TO phone number. It should be after FROM number in the message'
    }
  }

  const message = body.slice(3).join(' ');
  const media = message.match(/\bhttps?:\/\/\S+/gi);

  if (!message.length) {
    return {
      success: false,
      error: 'Invalid MESSAGE. It should be after TO number in the message'
    };
  }

  return {
    success: true,
    provider,
    fromNumber,
    toNumber,
    message: message.replace(/\bhttps?:\/\/\S+/gi, '').trim(),
    media
  };
}

function sendMessage(params) {
  switch (params.provider) {
    case 'twilio':
      return twilioClient.messages.create(
        Object.assign({
          to: params.toNumber,
          from: params.fromNumber,
          body: params.message,
        }, params.media ? { mediaUrl: params.media } : null)
      );
    
    case 'bandwidth':
      return bandwidthClient.Message.send(
        Object.assign({
          to: params.toNumber,
          from: params.fromNumber,
          text: params.message
        }, params.media ? { media: params.media } : null)
      );
    
    case 'bandwidthv2':
      return bandwidthV2Client.v2.Message.send(
        Object.assign({
          to: [params.toNumber],
          from: params.fromNumber,
          text: params.message,
          applicationId : process.env.BANDWIDTH_V2_APP_ID
        }, params.media ? { media: params.media } : null)
      );

    default:
      return new Promise();
  }
}

function slackWebhook(username, text) {
  slack.webhook(
    {
      channel: '#messaging',
      username,
      icon_emoji: ':boom:',
      text
    },
    () => { }
  );
}

module.exports = {
  sendToProvider: (req, res) => {
    const bodyText = req.body.text.trim();
    const result = parseMessage(bodyText);
    console.log('sendSMSresult:', result);
    if (result.success) {
      sendMessage(result)
      .catch((error) => {
        if (error) {
          slackWebhook(
            req.body.user_name,
            `Error sending message: ${error.message || 'Uknonwn'}: \`\`\`/sms ${bodyText}\`\`\``
          );
          console.log('Error: unable to send message:', error);
        }
      });
      // Post SMS message to Slack to show running conversation thread
      slackWebhook(
        req.body.user_name,
        `Sent: \`\`\`/sms ${result.provider} ${result.fromNumber} ${result.toNumber} ${result.message}\`\`\``
      );
      res.status(200).send('Message sent successfully.');
    } else {
      slackWebhook(
        req.body.user_name,
        `Error sending message: ${result.error || 'Uknonwn'}: \`\`\`/sms ${bodyText}\`\`\``
      );

      res.status(200).send(`Error sending message: ${result.error || 'Uknonwn'}`);
    }
  },
};
