# bercow-prettier

Lint plugin for the [bercow](https://github.com/lachrist/bercow) test runner based on [prettier](https://github.com/prettier/prettier).

* `prettier-options <PrettierOptions> | <string> | null`: Options to pass to prettier. A `<string>` indicates the path to a prettier configuration file. `null` means that options will be retrieve per-file basis. *Default*: `null`.
