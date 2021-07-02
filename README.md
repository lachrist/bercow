# test-turtle

This package a simple language-agnostic test runner which uses memoization based on file dependency information provided by the user.
The problem that this package is trying to solve is re-testing files that are known to be unaffected by a change.

## Requirements

1. *Test File Mapping*: Each file to be tested should have a dedicated test file whose path can be computed based on the path of the file it is testing. The user have to provide a regular expression and a template to compute a the path of the test file from any given target file. For instance, if `lib/foo.mjs` is tested by `test/foo.mjs`, then the regular expression `/^lib/(.*)$/` with the template `test/$1` should be provided.
2. *No cyclic dependencies:* This package relies on a partial ordering between files where any given file can only import files which are below itself. Cycles between file imports renders this impossible.
3. *Single directory:* This package does not visit directories multiple times. Hence the directory layout must be reflected by the ordering. For instance the imports `foo < lib/bar < qux` are fine. But the imports `foo < lib/bar < qux < lib/buz` cannot be handled by this package.
4. *Ordering files:* Every directory (deeply) containing files to test should contain a file (named `.test.list` by  default) which provide a partial ordering of the elements of the directory.

## Example

Installation:

```sh
git clone https://github.com/lachrist/test-turtle.git
cd test-turtle
npm i
```

First run (everything is tested):

```sh
node bin/bin.mjs --target sample 'npx c8 --include $1 -- node $2'
sample/foo.js...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 foo.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
> Success
sample/bar/index.js...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 index.js |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
> Success
sample/foobar.js...
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

Note that there is not ordering between `filename1` and `directory2`.

## CLI

```
usage: npx test-turtle <command>
  <command>
      The command to execute for each test.
      First argument: relative path of the target file.
      Second argument: relative path of the test file.
      Example: "npx c8 --include $1 -- node $2"
  --target
      Path to the root directory from which to start testing files.
      Default: "."
  --replace-regexp-body
      The body of a regular expression to extract parts from target file.
      Default: "^(.*)\.([a-z])$"
  --replace-regexp-flags
      The flags of a regular expression to extract parts from target file,
      Default: "u"
  --replace-template
      The template to replace the parts of the target file.
      Default: "$1.test.$2"
  --layout-filename
      The name of the file indicating test layout.
      Default: ".test.list"
  --memoization-filename
      The name of the file to store memoization data.
      Default: ".turtle.json"
  --no-memoization
      Disable memoization.
  --help
      Print this message.
```
