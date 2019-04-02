module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  bracketSpacing: true,
  printWidth: 120,
  tabWidth: 2,
  printWidth: 120,
  overrides: [
    {
      files: ['*.json', '.eslintrc'],
      options: {
        parser: 'json',
        bracketSpacing: false,
        singleQuote: false,
      },
    },
    {
      files: ['*.ts'],
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
      },
    },
  ],
};
