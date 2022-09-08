# @bercow/link-adjacent

Link plugin for the [bercow](https://github.com/lachrist/bercow) test runner which links a test file to its main file. This plugin works for projects whose test files sit next to their main file with an additional extension.

* `additional-extension <string>`: The additional extension that marks test files. *Default*: `"test"`.
* `final-extension <string> | null`: The final extension of test file. *Default*: `null` reuse the extension of main files.
