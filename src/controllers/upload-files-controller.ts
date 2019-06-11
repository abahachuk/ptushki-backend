import { Request } from 'express';
import multer, { Options } from 'multer';
import path from 'path';

export interface MulterOptions {
  storage?: string;
  limits?: {
    files: number;
  };
  extensions: string[];
  dest?: string;
  any: boolean;
}

export const upload = (options: MulterOptions) => {
  const defaultOptions: Options = {
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ): void => {
      const ext = path.extname(file.originalname);

      if (options.extensions.includes(ext)) {
        callback(null, true);
      } else {
        callback(
          new Error(`Incorrect file extension. It is possible to upload only: ${options.extensions.join(',')}`),
          false,
        );
      }
    },
  };

  const mergedOptions: Options = Object.assign({}, defaultOptions, options);

  // @ts-ignore
  if (mergedOptions.any) {
    return multer(mergedOptions).any();
  }

  return multer(mergedOptions).none();
};
