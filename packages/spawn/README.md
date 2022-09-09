# @bercow/c8

Test plugin for the [bercow](https://github.com/lachrist/bercow) test runner which spawns a child process.

* `command <string>` Name of the program to spawn.
* `command-windows <string>` Name of the program to spawn on windows.
* `argv <string[]>` Program argument array. *Default* `["$TEST"]`. Recognized variables:
  - `$ABSOLUTE_MAIN_PATH`
  - `$ABSOLUTE_TEST_PATH`
  - `$RELATIVE_MAIN_PATH`
  - `$RELATIVE_TEST_PATH`
  - `$MAIN` alias for `$ABSOLUTE_MAIN_PATH`
  - `$TEST` alias for `$ABSOLUTE_TEST_PATH`
* `options <Object>` Option to provide to `child_process.spawn`. *Default* `{}`.
