import { Request } from 'express';
import multer, { Options } from 'multer';
import path from 'path';

export interface MulterOptions extends Options {
  extensions: string[];
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

  const mergedOptions: MulterOptions = Object.assign({}, defaultOptions, options);

  if (mergedOptions.any) {
    return multer(mergedOptions).any();
  }

  return multer(mergedOptions).none();
};
