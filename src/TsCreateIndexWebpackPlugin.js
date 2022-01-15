import path from 'path';
import writeIndex from './utilities/writeIndex';

export class TsCreateIndexWebpackPlugin {
  constructor({dirs}) {
    this.dirs = dirs;
    writeIndex(this.dirs, {
      extensions: ['ts'],
      outputFile: 'index.ts',
    });
  }

  apply(compiler) {
    compiler.hooks.watchRun.tapAsync('TsCreateIndexWebpackPlugin', (compilation, callback) => {
      const ourFiles = this.dirs.map((directory) => path.join(directory, 'index.ts'));
      const modifiedFiles = compiler.modifiedFiles ? Array.from(compiler.modifiedFiles) : [];
      const modifiedFilesWithoutOurs = modifiedFiles.filter((file) => !ourFiles.includes(file));
      if (modifiedFilesWithoutOurs.length) {
        writeIndex(this.dirs, {
          extensions: ['ts'],
          outputFile: 'index.ts',
        });
      }
      callback();
    });
  }
}
