const BaseParser = require('./base');
const { controllers } = require('../paths');
const { grepCommentData, findName, isClassDefinition, getCurlyValue } = require('./utils');
const { START_COMMENT, END_COMMENT, OPEN_CURLY_BRACKET } = require('./keyWords');

const SUCCESS_STATUS = 200;

module.exports = class ControllersParser extends BaseParser {
  constructor() {
    super();

    this.folder = controllers;
  }

  get validParsed() {
    return this.parsed.filter(({ name, description, paths }) => name && description && paths.length);
  }

  get swaggerChunk() {
    return {
      tags: this.tags,
      paths: this.paths,
    };
  }

  get tags() {
    return this.validParsed.map(({ name, description }) => ({ name, description }));
  }

  get paths() {
    return this.validParsed.reduce((def, { name, rootPath, paths }) => {
      paths.forEach(({ path, summary, method, response }) => {
        const tags = [name];

        if (path === '/') {
          path = rootPath;
        } else {
          path = rootPath + path;
        }

        if (!def[path]) {
          def[path] = {};
        }

        const result = {
          tags,
          summary,
          description: '',
          produces: ['application/json'],
          responses: {
            [SUCCESS_STATUS]: {
              description: 'Successful operation',
            },
          },
        };

        if (path.includes(OPEN_CURLY_BRACKET)) {
          const param = getCurlyValue(path);
          result.parameters = [
            {
              name: param,
              description: param,
              in: 'path',
              required: true,
              type: 'string',
            },
          ];
        }

        if (!response.includes('#/definitions')) {
          result.responses[SUCCESS_STATUS].description = response;
        } else if (response.includes(OPEN_CURLY_BRACKET)) {
          result.responses[SUCCESS_STATUS].schema = JSON.parse(response);
        } else {
          result.responses[SUCCESS_STATUS].schema = {
            $ref: response,
          };
        }

        def[path][method] = result;
      });

      return def;
    }, {});
  }

  _parse(file) {
    let startGrep = false;
    let currentData = {};

    this.parsed.push(
      file.split('\n').reduce(
        (notation, line) => {
          line = line.trim();

          if (line === END_COMMENT) {
            startGrep = false;

            if (currentData.rootPath) {
              notation.rootPath = currentData.rootPath;
              notation.description = currentData.description;
            } else {
              notation.paths.push(currentData);
            }

            currentData = {};

            return notation;
          }

          if (startGrep) {
            const { prop, value } = grepCommentData(line);
            currentData[prop] = value;

            return notation;
          }

          if (line === START_COMMENT) {
            startGrep = true;

            return notation;
          }

          if (isClassDefinition(line)) {
            notation.name = findName(line.split(' '));

            return notation;
          }

          return notation;
        },
        {
          name: '',
          description: '',
          rootPath: '',
          paths: [],
        },
      ),
    );
  }
};
