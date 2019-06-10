import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';

export interface MulterOptions {
  storage?: string;
  limit?: number;
  extensions: string[];
}

const getStorage = (options: MulterOptions): StorageEngine => {
  let storageType: StorageEngine = multer.memoryStorage();

  if (options.storage === 'disk') {
    storageType = multer.diskStorage({
      destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, path: string) => void,
      ): void => {
        cb(null, 'uploads');
      },
      filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, fileName: string) => void,
      ): void => {
        cb(null, `${Date.now()}_${file.originalname}`);
      },
    });
  }

  return storageType;
};

const upload = async (options: MulterOptions, req: Request, res: Response, next: NextFunction): Promise<void> => {
  return multer({
    storage: getStorage(options),
    limits: Object.assign({}, { files: options.limit }),
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
  }).any()(
    req,
    res,
    (err: Error): void => {
      if (err) {
        next(err);
      }

      next();
    },
  );
};

export { upload };
