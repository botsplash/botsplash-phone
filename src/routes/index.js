const express = require('express');
/* eslint-disable new-cap */
const router = express.Router();

const slackAPI = require('../models/slack');
const messageProviderAPI = require('../models/messageProvider');

router.post('/sms', slackAPI.sendToSlack);
router.post('/slack', messageProviderAPI.sendToProvider);

module.exports = router;
