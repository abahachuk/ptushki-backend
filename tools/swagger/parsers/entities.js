const BaseParser = require('./base');
const { entities } = require('../paths');
const { PUBLIC, ARRAY } = require('./keyWords');
const { findName, setAsDefinition, isMethodDefinition, isClassDefinition } = require('./utils');

module.exports = class EntitiesParser extends BaseParser {
  constructor() {
    super();

    this.folder = entities;
    this.defNames = [];
  }

  get swaggerChunk() {
    return { definitions: this.definitions };
  }

  get definitions() {
    if (!this.parsed.length) {
      return {};
    }

    return this.parsed.reduce((definitions, { name, properties }) => {
      Object.keys(properties).forEach(key => {
        const { type, items } = properties[key];

        if (items && this.defNames.includes(items)) {
          properties[key].items = setAsDefinition(items);
        } else if (type && this.defNames.includes(type)) {
          properties[key].type = setAsDefinition(type);
        }
      });

      definitions[name] = { type: 'object', properties };

      return definitions;
    }, {});
  }

  _parse(file) {
    this.parsed.push(
      file.split('\n').reduce(
        (notation, line) => {
          if (isClassDefinition(line)) {
            notation.name = findName(line.split(' '));
            this.defNames.push(notation.name);

            return notation;
          }

          if (line.includes(PUBLIC) && !isMethodDefinition(line)) {
            const [fieldData, typeData] = line.replace(PUBLIC, '').split(':');
            const typeObject = { type: typeData.replace(';', '').trim() };

            if (typeObject.type.includes(ARRAY)) {
              typeObject.items = typeObject.type.replace(ARRAY, '');
              typeObject.type = 'array';
            }

            notation.properties[fieldData.trim()] = typeObject;

            return notation;
          }

          return notation;
        },
        {
          name: '',
          properties: {},
        },
      ),
    );
  }
};
