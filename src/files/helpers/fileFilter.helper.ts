import { type Request } from 'express';

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb,
): void => {
  if (!file) return cb(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['png', 'jpg', 'svg', 'webp', 'jpeg'];

  if (validExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(null, false);
};
