'use strict';

const modelsConfig = require('../../../config/models.json');

let _adapter = null;

function getAdapter() {
  if (_adapter) return _adapter;
  _adapter = require(`./${modelsConfig.active.tts}`);
  return _adapter;
}

module.exports = {
  synthesize: (text) => getAdapter().synthesize(text),
};
