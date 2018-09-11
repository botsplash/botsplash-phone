# slackSMS 💬

[![dependencies Status](https://david-dm.org/botsplash/slackSMS/status.svg)](https://david-dm.org/botsplash/slackSMS)
[![devDependencies Status](https://david-dm.org/botsplash/slackSMS/dev-status.svg)](https://david-dm.org/botsplash/slackSMS?type=dev)

**Original Repo for fixed Twilio Phone Number: [https://github.com/ammaristotle/slackSMS](https://github.com/ammaristotle/slackSMS)**

## Slack client to send or receive SMS messages

### Features
- Send or Receive messages from **Bandwidth** and **Twilio**
- Use multiple phone numbers that belong to your account
- Support Multi-media messages. Send / receive attachments.
- Deploy to Heroku or Docker included (from **ammaristotle** repo)


### Why we built this:
At botsplash, we build messaging tools and needed a simple interface for our developers and testers to validate SMS messages across different providers.

### How it was built:
The technical details are described here by [Sumit Bajrachara](https://www.linkedin.com/in/sumit-bajracharya-a3801087/) at [botsplash engineering blog](https://medium.com/@sumeetbajra_8529/4b9163404c98).  


### Screenshots
Incoming messages from Bandwidth, look pretty! ![alt text](https://cdn-images-1.medium.com/max/1600/1*4E1v75CUZxMjFGxU1aZbUQ.png)

Reply using quick /sms command!
```
/sms [bandwidth|twilio] [fromNumber] [toNumber] [message]
```
![alt text](https://cdn-images-1.medium.com/max/1600/1*yD2XVsJ-JcTaqMW2T44BsQ.png)

## Requirements
* slackSMS requires some setup (auth tokens and the like) but then can be configured easily and deployed very fast on Heroku or others

## Custom configuration
* If you're interested in customizing slackSMS, just clone the repo:

  ```bash
  $ git clone https://github.com/botsplash/slackSMS
  $ npm install
  ```
* You'll then have to complete steps 1-4 below and copy the configuration variables to a `.env` file (using `.env.example` as a guide). Then:

  ```bash
  $ npm start # runs the server on port 4000
  ```
  * (Optional) Learn how to customize the way [messages appear in Slack](https://api.slack.com/docs/message-attachments)

## Get started for Bandwidth or Twilio
1. Purchase phone number - [Bandwidth](https://app.bandwidth.com/numbers/order) or [Twilio](https://www.twilio.com/console/phone-numbers/search) from Twilio if you haven't already

2. Retrieve your `accountSid` and `auth token` for [Bandwidth](https://app.bandwidth.com/account/profile) or  [Twilio](https://www.twilio.com/console)
![alt text](https://dl.dropboxusercontent.com/s/ew2vthkmgq88d41/Screen%20Shot%202016-08-31%20at%201.03.50%20PM.png?dl=0 "Copy these")

3. Get an auth token from Slack. Get one quickly [here](https://api.slack.com/docs/oauth-test-tokens)

4. Set up an [incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) in Slack. Click "Add Configuration". Choose any channel, we will customize it later. Click "Add Incoming WebHooks Integration". Copy the Webhook URL. You'll need this to set up the slash command.

5. [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/botsplash/slackSMS) using the above credentials

6. Now we'll link our Slack webhook to a slash command. Set up a new [slash command](https://slack.com/apps/A0F82E8CA-slash-commands). Then click "Add Configuration". You can make the command name anything you like. Make sure to replace `your-heroku-url` with your app's URL and the endpoint `api/slack` as a **POST** request
![alt text](https://dl.dropboxusercontent.com/s/lqs8rkeqx1cnqr9/Screen%20Shot%202016-08-31%20at%2012.51.05%20PM.png?dl=0 "Set it up")

7. Go to your managed numbers console [Bandwidth](https://app.bandwidth.com/applications/manage) or [Twilio](https://www.twilio.com/console/phone-numbers/incoming) and click the number you just purchased. Make sure to replace `your-heroku-url` with your app's URL and the endpoint `api/twilio` as a **POST** request
![alt text](https://dl.dropboxusercontent.com/s/oqalaj2bs82hy2l/Screen%20Shot%202016-08-31%20at%2012.56.15%20PM.png "Twilio console")

8. Start sending messages!

#### Costs
The underlying code for slackSMS is free and open source. However, Bandwidth is free to receive messages and $.0005 to send a message. Twilio charges $.0075 to receive a message and $.0075 to send a message (about 1 cent each). Keep this in mind in case you plan on receiving 20 gazillion messages; that could cause a firestorm in your wallet.

##### Credits
Original repo from [ammaristotle/slackSMS](https://github.com/ammaristotle/slackSMS) with generalization and updated features.

##### Contributing / Issues
Contributions are welcome. Please raise issues as they arise.
