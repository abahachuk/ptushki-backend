const test = {
  id: {
    in: ['body'],
    errorMessage: 'Here is your custom error for id',
    isInt: true,
    toInt: true,
  },
  name: {
    in: ['body'],
    errorMessage: 'Here is your custom error for name',
    isString: true,
  },
};

export default test;
