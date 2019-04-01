module.exports = {
  '*.ts': ['eslint --fix', 'git add'],
  '*.{json,md}': ['prettier --write', 'git add'],
  '{.eslintrc}': ['prettier --write', 'git add'],
};
