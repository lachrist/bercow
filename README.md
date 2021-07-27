# test-turtle

This package a simple language-agnostic test runner which uses memoization based on file dependency information provided by the user.
The problem that this package is trying to solve is avoiding to re-test files that are known to be unaffected by a change.

## Requirements

1. *Test File Mapping*: Each file to be tested should have a dedicated test file whose path can be computed based on the path of the file it is testing. The user have to provide a regular expression and a template to compute a the path of the test file from any given target file. For instance, if `lib/foo.mjs` is tested by `test/foo.mjs`, then the regular expression `/^lib/(.*)$/` with the template `test/$1` should be provided.
2. *No cyclic dependencies:* This package relies on a partial ordering between files where any given file can only import files which are below itself. Cycles between file imports renders this impossible.
3. *Single directory:* This package does not visit directories multiple times. Hence the directory layout must be reflected by the ordering. For instance the imports `foo < lib/bar < qux` are fine. But the imports `foo < lib/bar < qux < lib/buz` cannot be handled by this package.
4. *Ordering files:* Every directory (deeply) containing files to test should contain a file (named `.test.list` by  default) which provide a partial ordering of the elements of the directory.

## Getting Started

```
npm install test-turtle
npx test-turtle --target <target> --format <format> -- 'node $2'
```

- `target`: the directory to start collecting files.
- `format`: specify how to fetch test files.
  - `"separated"`: the test files are located in the dedicated `test/` directory which mirrors the `lib/` directory.
  - `"alongside"`: the test files are located alongside the file they are testing with an additional `.test` extension -- eg: `foo.js` and `foo.test.js`.

**Warning**
By default all files are considered to be independent from each others.
Specifying dependencies requires the presence of ordering files.

## Demonstration

Installation:

```sh
git clone https://github.com/lachrist/test-turtle.git
cd test-turtle
npm i
cd sample
```

First run (everything is tested):

```sh
node ../lib/bin.mjs 'npx c8 --include $1 -- node $2'
foo.js...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 foo.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
> Success
bar/index.js...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 index.js |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
> Success
foobar.js...
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |      100 |     100 |     100 |                   
 foobar.js |     100 |      100 |     100 |     100 |                   
-----------|---------|----------|---------|---------|-------------------
> Success
```

Second run (everything is memoized):

```sh
node bin/bin.mjs --target sample 'npx c8 --include $1 -- node $2'
sample/foo.js...
> Memoized
sample/bar/index.js...
> Memoized
sample/foobar.js...
> Memoized
```

Modifying `sample/foo.js`:

```sh
echo 'exports.getFoo = () => "f" + "oo";' > sample/foo.js
```

Third run (`bar.js` is still memoized):

```sh
sample/foo.js...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 foo.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
> Success
sample/bar/index.js...
> Memoized
sample/foobar.js...
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------|---------|----------|---------|---------|-------------------
All files  |     100 |      100 |     100 |     100 |                   
 foobar.js |     100 |      100 |     100 |     100 |                   
-----------|---------|----------|---------|---------|-------------------
> Success
```

## Ordering Files

Each directory containing files to test should contain an ordering file.
This file is in text format and contain nested lists whose elements are the name of the elements (files and directories) of the directory.
Each directory should be terminated by `/` character.
There exists two kinds of lists: ordered lists which are marked with a `-` character and unordered lists which are marked with a `*` character.

Example of a configuration file:

```txt
- directory1/
- * filename1
  * directory2/
- filename2
```

The package deduce the following partial ordering:

```txt
directory1 < filename1
directory1 < directory2
directory1 < filename2

filename1 < filename2

directory2 < filename2
```

Note that there is no ordering between `filename1` and `directory2`.

## CLI

```
usage: npx test-turtle <command>
  <command>
      The command to execute for each test.
      First argument: relative path of the target file.
      Second argument: relative path of the test file.
      Example: "npx c8 --include $1 -- node $2"
  --stdio
      What to do with the command's stdio
      Default: "inherit"
  --timeout
      The number of millisecond before sending SIGTERM to the command.
      One second later, SIGKILL will be send.
      Default: 0 (no timeout)
  --target
      The root directory from which to start exploring.
      Default: "."
  --layout-filename
      The name of the file indicating test layout.
      Default: ".test.list"
  --memoization-path
      The path to the file for reading and writing memoization data.
      Default: ".turtle.json"
  --layout
      Use a predefined layout: ["alongside","separated"].
      This option overrides the '--format' and '--exclude' options.
  --format-regexp
      A regular expression to decompose the parts of a target's relative path.
  --format-regexp-flags
      The flags to use for --format-regexp
      Default: "u"
  --format-template
      The template string to format the parts of the target file.
  --exclude-regexp
      Regular expression to exclude files from testing when no ordering
      file is present in the directory.
      Default: "^\."
  --exclude-regexp-flags
      The flags to use for --exclude-regexp.
      Default: "u
  --no-memoization
      Disable memoization.
  --help
      Print this message.
```
