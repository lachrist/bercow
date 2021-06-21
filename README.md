# test-turtle

This module a simple test runner which uses memoization and requires a module ordering.
The key idea behind it is that when modifying a module (or its test file), the modules below it (ie the modules that do not depend on it) do not need to be re-tested.

## Requirements

1. *`.test.js` test file convention:* Unit test files are put next to the file that they are testing and they are named based to the file they are testing. For instance: `foo.js` and `foo.test.js`.
2. *No cyclic dependencies between modules:* There must exists a strict ordering of modules such that a module may only require modules strictly lower than itself. For instance, given the ordering `foo.js < bar.js`, `bar.js` may require `foo.js` but not the reverse.
3. *The module ordering must respect directory layout:* An ordering cannot interleave the modules of a directory with outside modules. For instance `dir/foo.js < bar.js < dir/qux.js` is invalid but `bar.js < dir/foo.js < dir/qux.js` and `dir/foo.js < dir/qux.js < bar.js` are both valid ordering.
4. *Presence of `test.conf` files:* Every directory (deeply) containing source code to test should contain a `.test.conf` file. This file provides two information: the order in which the directory's files should be tested and for each of these file, a memoization of the last successful test run. 

## Example

Installation:

```sh
git clone https://github.com/lachrist/test-turtle.git
cd test-turtle
npm i
```

First run:

```sh
node lib/bin.js sample
running  sample/foo...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 foo.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
running  sample/bar/index...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 index.js |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
running  sample/qux...
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 qux.js   |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------
```

Second run:

```sh
node lib/bin.js sample
memoized sample/foo
memoized sample/bar/index
memoized sample/qux
```

Modifying `sample/bar/index`:

```sh
echo '
  const {getFoo} = require("../foo.js");
  exports.getFooBar = () => `${getFoo()}BAR`;
' > sample/bar/index.js
```

Third run:

```sh
memoized sample/foo
running  sample/bar/index...
/Users/soft/Desktop/workspace/test-turtle/sample/bar/index.test.js:3
  throw new Error("expected 'foobar'");
  ^
```

## Conf Files

The configuration files follow a simple key - value format.
Each test file should appear without extension. For instance the test file `foo.test.js` which tests the file `foo.js` should be represented by `foo`.
The value associated with a test file is used by the runner to perform memoization and should not be provided by the user.
Each directory should by terminated by `/` character and should not be associated with any value.

Example of a configuration file:

```txt
directory1/
filename1 = ff2028171ab0df882f28df7bcad05a90
directory2/
filename2
```

How to understand it:

1. The ordering is `directory1 < filename1.js < directory2 < filename2.js`. For instance it means that the modules of `directory2` do not require the `filename2.js` module.
2. The test `filename1.test.js` has already been successful.
3. The test `filename2.test.js` has not yet been successful.

## CLI

```
usage: npx test-turtle <dir>
  <dir>: the root directory to start testing from
  --ext: the file extension used by the project, it
         is curently not possible to mix extensions
  --cov: the minimum coverage threshold (0, 100)
  --no-memo: disable memoization
```
