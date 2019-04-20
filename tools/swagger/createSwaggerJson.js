const { resolve } = require('path');
const { writeFileSync } = require('fs');

module.exports = (output, data) => {
  try {
    const json = JSON.stringify(data, null, '\t');
    const out = resolve(output, 'swagger.json');

    writeFileSync(out, json);
    console.log('Swagger Api doc has been successfully created. Please visit: ', out);
  } catch (e) {
    console.log('Unable to create swagger json file: ', e);
  }
};
