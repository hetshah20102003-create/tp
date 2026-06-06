'use strict';

// Currently only Twilio is supported for telephony
const adapter = require('./twilio');
module.exports = adapter;
