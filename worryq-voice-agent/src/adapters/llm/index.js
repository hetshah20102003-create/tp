'use strict';

const modelsConfig = require('../../../config/models.json');

let _adapter = null;

function getAdapter() {
  if (_adapter) return _adapter;
  const name = modelsConfig.active.llm;
  _adapter = require(`./${name}`);
  return _adapter;
}

module.exports = {
  complete: (context) => getAdapter().complete(context),
};
