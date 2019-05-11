import { registerDecorator, ValidationOptions } from 'class-validator';
import { isAlphanumericWithHyphen } from '../validation-messages';

export function IsAlphanumericWithHyphen(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAlphanumericWithHyphen',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-zA-Z0-9-]+$/.test(value);
        },
        defaultMessage: isAlphanumericWithHyphen,
      },
    });
  };
}
