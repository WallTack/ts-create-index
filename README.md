# ts-create-index

Forked from: https://github.com/gajus/create-index

## Installation
```
npm i -D ts-create-index
```
or
```
yarn add -D ts-create-index
```

## What's different?

- Will now output `export * from './foo';` (instead of `export { default as foo } from './foo.ts';`)
- Only writes files if their contents have changed
- This readme and all the unit tests have been updated so they are accurate
- Adds a `TsCreateIndexWebpackPlugin`

---

## TsCreateIndexWebpackPlugin

```
// webpack.config.js

import { TsCreateIndexWebpackPlugin } from 'ts-create-index';

module.exports = {
  plugins: [
    // Whenever webpack recompiles, a new index.ts file will be generated in the root of these dirs
    new TsCreateIndexWebpackPlugin({ dirs: ['src/components'] }),
  ]
}
```

---

`ts-create-index` program creates (and maintains) ES6 `./index.ts` file in target directories that imports and exports sibling files and directories.

## Example

```sh
> tree ./
./
├── bar.ts
└── foo.ts

0 directories, 2 files

> ts-create-index ./
[13:17:34] Target directories [ './' ]
[13:17:34] Update index: false
[13:17:34] ./index.ts [created index]
[13:17:34] Done

> tree
.
├── bar.ts
├── foo.ts
└── index.ts

0 directories, 3 files
```

This created `index.ts` with:

```ts
// @ts-create-index

export * from './bar';
export * from './foo';
```

Lets create a new file and re-run `ts-create-index`:

```ts
> touch baz.ts
> tree ./
./
├── bar.ts
├── baz.ts
├── foo.ts
└── index.ts

0 directories, 4 files

> ts-create-index ./
[13:21:55] Target directories [ './' ]
[13:21:55] Update index: false
[13:21:55] ./index.ts [updated index]
[13:21:55] Done
```

This have updated `index.ts` file:

```js
// @ts-create-index

export * from './bar';
export * from './baz';
export * from './foo';
```

## Usage

### Using CLI Program

```sh
npm install ts-create-index

ts-create-index --help

Options:
  --recursive, -r          Create/update index files recursively. Halts on any
                           unsafe "index.ts" files.   [boolean] [default: false]
  --ignoreUnsafe, -i       Ignores unsafe "index.ts" files instead of halting.
                                                      [boolean] [default: false]
  --ignoreDirectories, -d  Ignores importing directories into the index file,
                           even if they have a safe "index.ts".
                                                      [boolean] [default: false]
  --update, -u             Updates only previously created index files
                           (recursively).             [boolean] [default: false]
  --banner                 Add a custom banner at the top of the index file
                                                                        [string]
  --extensions, -x         Allows some extensions to be parsed as valid source.
                           First extension will always be preferred to homonyms
                           with another allowed extension.
                                                       [array] [default: ["ts"]]
  --outputFile, -o         Output file            [string] [default: "index.ts"]                                                      [array] [default: ["ts"]]

Examples:
  ts-create-index ./src ./src/utilities      Creates or updates an existing
                                          ts-create-index index file in the target
                                          (./src, ./src/utilities) directories.
  ts-create-index --update ./src ./tests     Finds all ts-create-index index files in
                                          the target directories and descending
                                          directories. Updates found index
                                          files.
  ts-create-index ./src --extensions ts tsx  Creates or updates an existing
                                          ts-create-index index file in the target
                                          (./src) directory for both .ts and
                                          .tsx extensions.
```

### Using `ts-create-index` Programmatically

```js
import {writeIndex} from 'ts-create-index';

/**
 * @type {Function}
 * @param {Array<string>} directoryPaths
 * @throws {Error} Directory "..." does not exist.
 * @throws {Error} "..." is not a directory.
 * @throws {Error} "..." unsafe index.
 * @returns {boolean}
 */
writeIndex;
```

Note that the `writeIndex` function is synchronous.

```js
import {findIndexFiles} from 'ts-create-index';

/**
 * @type {Function}
 * @param {string} directoryPath
 * @returns {Array<string>} List of directory paths that have ts-create-index index file.
 */
findIndexFiles;
```

### Gulp

Since [Gulp](http://gulpts.com/) can ran arbitrary JavaScript code, there is no need for a separate plugin. See [Using `ts-create-index` Programmatically](#using-ts-create-index-programmatically).

```js
import {writeIndex} from 'ts-create-index';

gulp.task('ts-create-index', () => {
  writeIndex(['./target_directory']);
});
```

Note that the `writeIndex` function is synchronous.

## Implementation

`ts-create-index` program will look into the target directory.

If there is no `./index.ts`, it will create a new file, e.g.

```ts
// @ts-create-index
```

Created index file must start with `// @ts-create-index\n\n`. This is used to make sure that `ts-create-index` does not accidentally overwrite your local files.

If there are sibling files, index file will `import` them and `export`, e.g.

```sh
children-directories-and-files git:(master) ✗ ls -lah
total 0
drwxr-xr-x   5 gajus  staff   170B  6 Jan 15:39 .
drwxr-xr-x  10 gajus  staff   340B  6 Jan 15:53 ..
drwxr-xr-x   2 gajus  staff    68B  6 Jan 15:29 bar
drwxr-xr-x   2 gajus  staff    68B  6 Jan 15:29 foo
-rw-r--r--   1 gajus  staff     0B  6 Jan 15:29 foo.ts
```

Given the above directory contents, `./index.ts` will be:

```ts
// @ts-create-index

import * from './bar';
import * from './foo';

export {
    bar,
    foo
};
```

When file has the same name as a sibling directory, file `import` takes precedence.

Directories that do not have `./index.ts` in themselves will be excluded.

When run again, `ts-create-index` will update existing `./index.ts` if it starts with `// @ts-create-index\n\n`.

If `ts-create-index` is executed against a directory that contains `./index.ts`, which does not start with `// @ts-create-index\n\n`, an error will be thrown.

## Ignore files on `--update`

`ts-create-index` can ignore files in a directory if `./index.ts` contains special object with defined `ignore` property which takes `an array` of `regular expressions` defined as `strings`, e.g.

```ts
> cat index.ts
// @ts-create-index {"ignore": ["/baz.ts$/"]}
```

```ts
> tree ./
./
├── bar.ts
├── baz.ts
├── foo.ts
└── index.ts

0 directories, 4 files
```

Given the above directory contents, after running `ts-create-index` with `--update` flag, `./index.ts` will be:

```ts
// @ts-create-index {"ignore": ["/baz.ts$/"]}

import * from './bar';
import * from './foo';

export {
    bar,
    foo
};
```
