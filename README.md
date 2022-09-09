# bercow

A test runner with a plugin system that has a *strong* emphasis on running tests in order. When developing an application, I found out that I was always running my test files in the same order: from lower-level modules to higher-level modules. This test runner requires you to describe the order in which you want to test your application files with `.ordering` file in each directory. It makes use of cache for performance. Basically, code a bit and always run `npx bercow` to format, lint and test your application from bottom up. Which is nice because you do not need to remember multiple commands nor which files you changed.

## Example

This repository :)

## Plugins

Bercow requires plugins to run. Currently there are only plugins for node applications but bercow is language agnostic.

Linkers: return the test file associated to an application file
- [link-separate](packages/link-separate)
- [link-adjacent](packages/link-adjacent)

Linters: format/lint application files and test files
- [prettier](packages/prettier)
- [eslint](packages/eslint)
- [order-esm-import](packages/order-esm-import)

Testers: run the test file
- [c8](packages/c8)

## Common Options

* `plugins <Object>` Mapping from plugin name/path to plugin options. *Default* `{}`, `bercow` will not do anything.
* `target-directory <string>` Where to start looking for files to test. *Default* `"."`.
* `ordering-filename <string>` Name of the files containing the ordering. *Default* `".ordering"`.
* `ordering-pattern <string> | null` The body of a regular expression for filtering filenames of when the ordering file is missing. *Default* `null`, an error is thrown when the ordering file is missing.
* `lint-cache-file <string> | null` Path for lint caching. *Default* `null`: a file in `./tmp` whose name is based on the content of the configuration.
* `test-cache-file <string> | null` Path for test caching. *Default* `null`: a file in `./tmp` whose name is based on the content of the configuration.
* `clean <boolean>` Clear caches before running. *Default* `false`.
* `encoding <string>` Charset encoding to use for all the files. *Default* `"utf8"`.

<!--

## Plugins

* `plugin = await (await import("plugin")).default(options, home)`
  * `options <any>` The plugin's options
  * `home <string>` The path of the configuration file

* `plugin`
  * `link(path, infos)`
    * `path <string>` The current file.
    * `infos <Infos>`
  * `lint(file, infos)`
    * `file <File>`
    * `infos <Infos>`
  * `plugin.test(files, infos)`
    * `files <File[]>`
    * `infos <Infos>`

* `File`
  * `path <string>`
  * `content <string>`

* `Infos`
  * `ordering <string[]>` The entire file ordering of the application.
  * `index <number>` The current position in the file ordering.
  * `logTitle(title)` Log a blue title.
  * `logSubtitle(subtitle)` Log an indented blue title.
  * `logParagraph(paragraph)` Log a gray out paragraph.

-->
