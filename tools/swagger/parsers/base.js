const { processEach } = require('./utils');

module.exports = class BaseParser {
  constructor() {
    this.folder = null;
    this.parsed = [];

    this._parse = this._parse.bind(this);
  }

  get swaggerChunk() {
    return {};
  }

  _parse() {
    throw new Error('Not implemented');
  }

  parse() {
    console.log('Starting parsing: ', this.folder);

    processEach(this.folder, this._parse);

    return this.swaggerChunk;
  }
};
