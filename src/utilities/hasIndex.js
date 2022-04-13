import fs from 'fs';
import path from 'path';

export default (directoryPath, options = {}) => {
  const indexPath = path.resolve(directoryPath, options.outputFile || 'index.ts');

  try {
    fs.statSync(indexPath);

    return true;
  } catch {
    return false;
  }
};
