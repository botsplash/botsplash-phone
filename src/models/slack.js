const SlackAPIWrapper = require('slack-node');
const xml = require('xml');

const webhookUri = process.env.SLACK_WEBHOOK_URI;
const apiToken = process.env.SLACK_API_TOKEN;

const slack = new SlackAPIWrapper(apiToken);
slack.setWebhook(webhookUri);

/**
 * helper function to see if channel exists in array of channels
 * @param  {string} name  Name of channel to be checked
 * @param  {Array.string} listOfChannels
 * @return {boolean} Does this channel exist already?
 */
function channelExists(name, listOfChannels) {
  return (listOfChannels.indexOf(name) > -1);
}

/**
 * pulls list of active channels in Slack and checks whether input channelExists()
 * @param  {string} channelToCheck Name of channel
 * @return {boolean} Should we make a new channel or not?
 */
function validChannel(channelToCheck) {
  slack.api('channels.list', (error, response) => {
    const activeChannels = response.channels || [];
    this.channels = [];
    activeChannels.forEach(function add(channel) {
      this.channels.push(channel.name);
    });
    /* eslint no-unneeded-ternary: 0 */
    return channelExists(channelToCheck, this.channels) ? true : false;
  });
}

function getPayload(req) {
  if (Array.isArray(req.body)) {
    // bandwidth v2 response
    const body = req.body[0];
    if (body.type !== 'message-received') {
      return;
    }

    return {
      body  : body.message.text,
      from  : body.message.from,
      to    : body.to,
      media : body.message.media
    }
  }

  return {
    from  : req.body.From || req.body.from,
    to    : req.body.To || req.body.to,
    body  : req.body.Body || req.body.text,
    media : req.body.media
  }
}

module.exports = {
  sendToSlack: (req, res) => {
    const payload = getPayload(req);
    console.log('sendToSlack:body:', req.body, 'payload:', payload);
    if (!payload) {
      return;
    }

    const { from, to, body, media } = payload;

    let imageAttachments = [];
    if (media) {
      imageAttachments = media.map(m => ({ title: m, image_url: m }));
    } else if (req.body.NumMedia) {
      const numMedia = req.body.NumMedia;
      if (numMedia > 0) {
        for (var i = 0; i < numMedia; i++) {
          imageAttachments.push({
            title       : req.body[`MediaUrl${i}`],
            image_url   : req.body[`MediaUrl${i}`]
          });
        }
      }
    }

    // continues conversations in same channels, if they exist
    if (validChannel('#messaging')) {
      slack.webhook(
        {
          channel: '#messaging',
          icon_emoji: ':speech_balloon:',
          username: process.env.SLACK_BOT_NAME,
          attachments: [
            {
              fallback: `from ${from} to ${to}: ${body}`,
              color: '#3D91FC',
              author_name: `Received message from ${from} to ${to}`,
              title: body
            },
          ].concat(imageAttachments),
        }, () => { }
      );
    } else {
      // creates a new channel for new incoming numbers
      slack.api('channels.create', {
        name: '#messaging',
      }, (err, response) => {
        if (response) {
          slack.webhook(
            {
              channel: '#messaging',
              icon_emoji: ':speech_balloon:',
              username: process.env.SLACK_BOT_NAME,
              attachments: [
                {
                  fallback: `from ${from} to ${to}: ${body}`,
                  color: '#3D91FC',
                  author_name: `Received message from ${from} to ${to}`,
                  title: body,
                },
              ].concat(imageAttachments),
            }, () => { }
          );
        }
      });
    }

    // Send back Twilio an empty XML response to let them know we got the message
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    const twiml = [{ Response: '' }];
    res.end(xml(twiml));
  },
};
