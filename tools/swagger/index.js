require('./createSwaggerJson')(
  require('./paths').root,
  require('./parsers').reduce((swaggerData, Parser) => ({ ...swaggerData, ...new Parser().parse() }), {
    ...require('./defaults'),
  }),
);
