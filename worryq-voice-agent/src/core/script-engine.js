'use strict';

const path = require('path');
const logger = require('../utils/logger');

class ScriptEngine {
  constructor(scriptName = 'labour-v1') {
    this.script = require(path.join(__dirname, '../../config/scripts', `${scriptName}.json`));
  }

  initialState() {
    return this.script.initial;
  }

  initialSay() {
    return this.script.states[this.script.initial].say;
  }

  // Returns { confident, nextState, say, collect, terminal, outcome } or { confident: false }
  advance(currentState, userText) {
    const state = this.script.states[currentState];
    if (!state) return { confident: false };

    const normalized = userText.toLowerCase().trim();
    const intents = state.intents ?? {};
    let matchedIntent = null;

    if (intents.yes && this._matchesPatterns(normalized, this.script.yesPatterns)) {
      matchedIntent = 'yes';
    } else if (intents.no && this._matchesPatterns(normalized, this.script.noPatterns)) {
      matchedIntent = 'no';
    } else if (intents.immediate && this._matchesPatterns(normalized, this.script.immediatePatterns)) {
      matchedIntent = 'immediate';
    } else if (intents.later && this._matchesPatterns(normalized, this.script.laterPatterns)) {
      matchedIntent = 'later';
    } else if (intents.any) {
      matchedIntent = 'any';
    } else if (intents.unclear) {
      matchedIntent = 'unclear';
    }

    if (!matchedIntent) return { confident: false };

    const nextStateName = intents[matchedIntent];
    if (nextStateName === '__llm__') {
      logger.debug('script.llm_fallback', { state: currentState, input: userText });
      return { confident: false };
    }

    const nextState = this.script.states[nextStateName];
    if (!nextState) return { confident: false };

    logger.debug('script.advance', { from: currentState, to: nextStateName, intent: matchedIntent });

    return {
      confident: true,
      nextState: nextStateName,
      say: nextState.say,
      collect: nextState.collect ?? null,
      terminal: nextState.terminal ?? false,
      outcome: nextState.outcome ?? null,
    };
  }

  getStateSay(stateName) {
    return this.script.states[stateName]?.say ?? '';
  }

  _matchesPatterns(text, patterns) {
    if (!patterns) return false;
    return patterns.some((p) => text.includes(p));
  }
}

module.exports = ScriptEngine;
