const { resolve } = require('path');
const { readdirSync, readFileSync } = require('fs');

const { CLASS, OPEN_CURLY_BRACKET, PUBLIC, OPEN_BRACKET, CLOSE_CURLY_BRACKET } = require('./keyWords');

const findName = (words = [], prev = null, index = 0) =>
  prev === CLASS ? words[index] : findName(words, words[index], index + 1);

const getCurlyValue = line => {
  let res = '';
  let isOpen = false;
  line.split('').forEach(char => {
    if (char === OPEN_CURLY_BRACKET) {
      isOpen = true;
      return;
    }

    if (char === CLOSE_CURLY_BRACKET) {
      isOpen = false;
      return;
    }

    if (isOpen) {
      res += char;
    }
  });

  return res;
};

const grepCommentData = line => {
  let [prop, value] = line.split('=');
  prop = prop.replace('* @', '');
  value = value.trim();

  return { prop, value };
};

const setAsDefinition = model => `#/definitions/${model}`;

const processFile = (file, cb) => {
  try {
    cb(readFileSync(file, { encoding: 'utf8' }));
    console.log('  -- Parsed: ', file);
  } catch (e) {
    console.log('Cant process provided file: ', e);
  }
};

const processEach = (dir, cb) => {
  try {
    readdirSync(dir, { withFileTypes: true }).forEach(file => processFile(resolve(dir, file), cb));
    console.log(' - Folder Parsing complete. \n');
  } catch (e) {
    console.log('Can`t process provided dir: ', e);
  }
};

const isClassDefinition = line => line.includes(OPEN_CURLY_BRACKET) && line.includes(CLASS);

const isMethodDefinition = line => line.includes(PUBLIC) && line.includes(OPEN_BRACKET);

module.exports = {
  findName,
  setAsDefinition,
  processEach,
  grepCommentData,
  isClassDefinition,
  isMethodDefinition,
  getCurlyValue,
};
