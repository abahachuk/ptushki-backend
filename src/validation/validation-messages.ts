export const equalLength = (length: number): string => `Length of $property must be equal ${length} characters`;

export const isAlphaWithHyphen = () => '$property must contain only letters (a-zA-Z) or hyphens (-)';

export const isAlphanumericWithHyphen = () => '$property must contain only letters, numbers and hyphens (-)';

export const isNumberStringWithHyphen = () => '$property must contain only numbers and hyphens (-)';

export const rowIdsError = 'Parameter rowIds should be not empty array of UUIDs';
