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
  public async validate(codeValue: any, { constraints: [codeName] }: ValidationArguments): Promise<boolean> {
    try {
      const repository: CachedRepository<any> = getCustomRepository(cachedEURINGCodes[`Cached${PascalCase(codeName)}`]);
      const validCodes = await repository.getAllIds();
      return validCodes.includes(codeValue);
    } catch (e) {
      logger.error(`Unable to get cached data to validate ${codeName}`);
      throw e;
    }
  }
}

export function IsCodeExist(code: string, validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [code],
      validator: IsCodeExistConstraint,
    });
  };
}
