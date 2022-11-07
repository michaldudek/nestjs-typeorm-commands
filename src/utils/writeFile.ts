import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

/**
 * Write string to a file.
 *
 * Will create the file and its whole path if it doesn't exist.
 *
 * @param filePath
 */
export const writeFile = async (
  filePath: string,
  data: string,
): Promise<void> => {
  await mkdirp(path.dirname(filePath));
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};
