# @bercow/spawn

Test plugin for the [bercow](https://github.com/lachrist/bercow) test runner which spawns a child process.

* `command <string>` Name/Path of the program to spawn.
* `command-platform <string>` Where `platform` is any value returned by `node:os.platform()` -- eg: `command-win32` for windows. Name of the program to spawn on a specific platform. If present, takes precedence over `command`.
* `argv <string[]>` Program argument array. *Default* `["$TEST"]`. Recognized variables:
  - `$ABSOLUTE_MAIN_PATH`
  - `$ABSOLUTE_TEST_PATH`
  - `$RELATIVE_MAIN_PATH`
  - `$RELATIVE_TEST_PATH`
  - `$MAIN` alias for `$ABSOLUTE_MAIN_PATH`
  - `$TEST` alias for `$ABSOLUTE_TEST_PATH`
* `options <Object>` Options to provide to `child_process.spawn`. *Default* `{}`.
