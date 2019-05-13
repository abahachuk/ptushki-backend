import { registerDecorator, ValidationOptions } from 'class-validator';
import { isNumberStringWithHyphen } from '../validation-messages';

export function IsNumberStringWithHyphen(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isNumberStringWithHyphen',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[0-9-]+$/.test(value);
        },
        defaultMessage: isNumberStringWithHyphen,
      },
    });
  };
}
