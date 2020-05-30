import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { getCustomRepository } from 'typeorm';
import { cachedEURINGCodes } from '../../entities/euring-codes/cached-entities-fabric';
import { CachedRepository } from '../../entities/cached-repository';
import { logger } from '../../utils/logger';

const PascalCase = (s: string): string => s[0].toUpperCase() + s.slice(1);

@ValidatorConstraint({ async: true })
class IsCodeExistConstraint implements ValidatorConstraintInterface {
  public async validate(code: any, { property }: ValidationArguments): Promise<boolean> {
    try {
      const repository: CachedRepository<any> = getCustomRepository(cachedEURINGCodes[`Cached${PascalCase(property)}`]);
      const validCodes = await repository.getAllIds();
      return validCodes.includes(code);
    } catch (e) {
      logger.error(`Unable to get cached data to validate ${property}`);
      throw e;
    }
  }
}

export function IsCodeExist(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCodeExistConstraint,
    });
  };
}
