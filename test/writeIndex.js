/* eslint-disable no-restricted-syntax */

import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import writeIndex from '../src/utilities/writeIndex';
import codeExample from './codeExample';

const readFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

const removeFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const appendToFile = (filePath, content) => {
  fs.appendFileSync(filePath, content, 'utf-8');
};

const fixturesPath = path.resolve(__dirname, 'fixtures/write-index');

describe('writeIndex()', () => {
  it('creates index in target directory', () => {
    const indexFilePath = path.resolve(fixturesPath, 'mixed/index.ts');

    removeFile(indexFilePath);
    writeIndex([path.resolve(fixturesPath, 'mixed')]);
    const indexCode = readFile(indexFilePath);

    expect(indexCode).to.equal(
      codeExample(`
// @ts-create-index

export * from './bar';
export * from './foo';
    `),
    );
  });

  it('creates index with config in target directory', () => {
    const indexFilePath = path.resolve(fixturesPath, 'with-config/index.ts');
    // eslint-disable-next-line quotes
    const ignoredExportLine = `export * from './bar';`;

    appendToFile(indexFilePath, ignoredExportLine);
    expect(readFile(indexFilePath).includes(ignoredExportLine)).to.equal(true);

    writeIndex([path.resolve(fixturesPath, 'with-config')]);
    const indexCode = readFile(indexFilePath);

    expect(indexCode).to.equal(
      codeExample(`
// @ts-create-index {"ignore":["/bar.js$/"]}

export * from './foo';
    `),
    );
  });
});
