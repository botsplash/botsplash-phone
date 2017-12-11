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
    const activeChannels = response.channels;
    this.channels = [];
    activeChannels.forEach(function add(channel) {
      this.channels.push(channel.name);
    });
    /* eslint no-unneeded-ternary: 0 */
    return channelExists(channelToCheck, this.channels) ? true : false;
  });
}

module.exports = {
  sendToSlack: (req, res) => {
    // continues conversations in same channels, if they exist
    if (validChannel('#twilio')) {
      slack.webhook(
        {
          channel: '#twilio',
          icon_emoji: ':speech_balloon:',
          username: process.env.SLACK_BOT_NAME,
          attachments: [
            {
              fallback: `from ${req.body.From} to ${req.body.To}: ${req.body.Body}`,
              color: '#3D91FC',
              author_name: `Recieved message from ${req.body.From} to ${req.body.To}`,
              title: req.body.Body,
            },
          ],
        }, () => { }
      );
    } else {
      // creates a new channel for new incoming numbers
      slack.api('channels.create', {
        name: '#twilio',
      }, (err, response) => {
        if (response) {
          slack.webhook(
            {
              channel: '#twilio',
              icon_emoji: ':speech_balloon:',
              username: process.env.SLACK_BOT_NAME,
              attachments: [
                {
                  fallback: `from ${req.body.From} to ${req.body.To}: ${req.body.Body}`,
                  color: '#3D91FC',
                  author_name: `Recieved message from ${req.body.From} to ${req.body.To}`,
                  title: req.body.Body,
                },
              ],
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
