const Registration = {
  email: {
    in: ['body'],
    errorMessage: 'Email is not valid',
    isEmail: true,
  },
  password: {
    in: ['body'],
    isString: true,
    toString: true,
    isLength: {
      errorMessage: 'Password should be at least 7 chars long',
      options: { min: 7 },
    },
  },
  firstName: {
    optional: true,
  },
  lastName: {
    optional: true,
  },
};

const Login = {
  email: {
    in: ['body'],
    errorMessage: 'Email is not valid',
    isEmail: true,
  },
  password: {
    in: ['body'],
    errorMessage: 'Password should not be empty',
  },
};

export { Registration, Login };
