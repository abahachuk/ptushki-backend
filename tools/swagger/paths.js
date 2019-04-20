const { resolve } = require('path');

const root = resolve(__dirname, '../../');
const src = resolve(root, 'src');

module.exports = {
  root,
  src,
  routes: resolve(src, 'routes.ts'),
  controllers: resolve(src, 'controllers'),
  entities: resolve(src, 'entities'),
};
