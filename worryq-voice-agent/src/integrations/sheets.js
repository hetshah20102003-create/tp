'use strict';

const { google } = require('googleapis');
const logger = require('../utils/logger');

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

// Reads column A (phone numbers), skips header row, returns [{phone, row}]
async function getPhoneNumbers(sheetId) {
  const authClient = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:C',
  });

  const rows = res.data.values ?? [];
  const numbers = [];

  for (let i = 1; i < rows.length; i++) {
    const phone = (rows[i][0] ?? '').toString().trim();
    const called = (rows[i][2] ?? '').toString().trim().toLowerCase();
    if (phone && called !== 'called') {
      numbers.push({ phone, row: i + 1 });
    }
  }

  logger.info('sheets.loaded', { count: numbers.length, sheetId });
  return numbers;
}

// Marks column C of the given row as "called" with outcome
async function markAsCalled(sheetId, row, outcome) {
  const authClient = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!C${row}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[`called:${outcome}`]] },
  });
}

module.exports = { getPhoneNumbers, markAsCalled };
