import { registerDecorator, ValidationOptions } from 'class-validator';
import { isAlphaWithHyphen } from '../validation-messages';

export function IsAlphaWithHyphen(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isAlphaWithHyphen',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-zA-Z-]+$/.test(value);
        },
        defaultMessage: isAlphaWithHyphen,
      },
    });
  };
}
