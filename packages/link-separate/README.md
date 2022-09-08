# @bercow/link-separate

Link plugin for the [bercow](https://github.com/lachrist/bercow) test runner which links a test file to its main file. This plugin works for projects whose test files sit in a separate directory that mirrors the structure of the source directory.

* `home-directory <string>`: The home directory of the project. *Default*: the directory of the configuration file.
* `test-directory <string>`: The test directory of the project. *Default*: `"test"`.
